import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Sparkles, Bot, User, Loader2, Info, Plus,
  MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen, X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Navbar } from '../components/layout/Navbar';
import Container from '../components/containers/Container';
import {
  sendChatMessage, createConversation, getConversations,
  getConversationMessages, deleteConversation,
} from '../services/legislatura.service';
import type { MensajeChat } from '../types/legislatura.types';

const HISTORY_PAGE_SIZE = 50;

export function Consultas() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Conversation history state
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const historyListRef = useRef<HTMLDivElement>(null);
  const historyHasMore = conversations.length < historyTotal;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, streamingContent, scrollToBottom]);

  // Load conversation history (first page)
  const loadConversations = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const result = await getConversations(1, HISTORY_PAGE_SIZE);
      setConversations(result.conversations || []);
      setHistoryTotal(result.total || 0);
      setHistoryPage(1);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Load more conversations (next page)
  const loadMoreConversations = useCallback(async () => {
    if (loadingMore || !historyHasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      const result = await getConversations(nextPage, HISTORY_PAGE_SIZE);
      setConversations((prev) => [...prev, ...(result.conversations || [])]);
      setHistoryTotal(result.total || 0);
      setHistoryPage(nextPage);
    } catch (err) {
      console.error('Error loading more conversations:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [historyPage, loadingMore, historyHasMore]);

  // Load conversations when sidebar is opened
  useEffect(() => {
    if (showSidebar) {
      loadConversations();
    }
  }, [showSidebar, loadConversations]);

  // Infinite scroll: detect when user scrolls to bottom of history list
  const handleHistoryScroll = useCallback(() => {
    const el = historyListRef.current;
    if (!el || loadingMore || !historyHasMore) return;
    const threshold = 40;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      loadMoreConversations();
    }
  }, [loadMoreConversations, loadingMore, historyHasMore]);

  // Load a specific conversation's messages
  const loadConversation = async (convId: string) => {
    setLoadingConversation(true);
    setError(null);
    try {
      const messages = await getConversationMessages(convId);
      const mapped: MensajeChat[] = messages.map((m: any) => ({
        id: m._id,
        rol: m.role === 'user' ? 'usuario' : 'asistente',
        contenido: m.text,
        timestamp: m.createdAt || new Date().toISOString(),
      }));
      setMensajes(mapped);
      setConversationId(convId);
      setStreamingContent('');
      // Close sidebar on mobile
      if (window.innerWidth < 1024) setShowSidebar(false);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Error al cargar la conversación.');
    } finally {
      setLoadingConversation(false);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(convId);
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (conversationId === convId) {
        handleNewConversation();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const ensureConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;
    try {
      const conv = await createConversation();
      setConversationId(conv._id);
      return conv._id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw new Error('No se pudo crear la conversación');
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMensajes([]);
    setStreamingContent('');
    setError(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const pregunta = input.trim();
    const userMsg: MensajeChat = {
      id: `msg-${Date.now()}`,
      rol: 'usuario',
      contenido: pregunta,
      timestamp: new Date().toISOString(),
    };

    setMensajes((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    setError(null);

    try {
      let convId = await ensureConversation();
      let accumulated = '';

      try {
        await sendChatMessage(convId, pregunta, {
          onToken: (token) => {
            accumulated += token;
            console.log(token)
            setStreamingContent(accumulated);
          },
          onDone: () => {
            const aiMsg: MensajeChat = {
              id: `msg-${Date.now()}-ai`,
              rol: 'asistente',
              contenido: accumulated,
              timestamp: new Date().toISOString(),
            };
            setMensajes((prev) => [...prev, aiMsg]);
            setStreamingContent('');
            setIsLoading(false);
          },
          onError: (err) => {
            console.error('Chat stream error:', err);
            setError('Error al obtener la respuesta. Intentá de nuevo.');
            setStreamingContent('');
            setIsLoading(false);
          },
        });
      } catch (chatErr: any) {
        // Si falla por conversación no encontrada, crear una nueva e intentar de nuevo
        if (chatErr.message?.includes('404') || chatErr.message?.includes('not found')) {
          console.log('Conversación no encontrada, creando nueva...');
          setConversationId(null);
          convId = await ensureConversation();
          
          await sendChatMessage(convId, pregunta, {
            onToken: (token) => {
              accumulated += token;
              console.log(token)
              setStreamingContent(accumulated);
            },
            onDone: () => {
              const aiMsg: MensajeChat = {
                id: `msg-${Date.now()}-ai`,
                rol: 'asistente',
                contenido: accumulated,
                timestamp: new Date().toISOString(),
              };
              setMensajes((prev) => [...prev, aiMsg]);
              setStreamingContent('');
              setIsLoading(false);
            },
            onError: (err) => {
              console.error('Chat stream error:', err);
              setError('Error al obtener la respuesta. Intentá de nuevo.');
              setStreamingContent('');
              setIsLoading(false);
            },
          });
        } else {
          throw chatErr;
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Error de conexión. Verificá que estés logueado e intentá de nuevo.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sugerencias = [
    '¿Qué proyectos de transporte se presentaron?',
    '¿Cuál es la situación de los hospitales?',
    '¿Hay proyectos sobre inteligencia artificial?',
    '¿Qué propuestas hay sobre vivienda?',
  ];

  return (
    <Container>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
        {/* Mobile overlay */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar - mobile: fixed overlay, desktop: relative push */}
        {showSidebar && (
          <aside
            className="
              fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
              w-80 bg-background/95 backdrop-blur-xl lg:bg-background/80
              border-r border-border/50 flex flex-col shrink-0
            "
          >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold">Historial</span>
              {historyTotal > 0 && (
                <span className="text-xs text-muted-foreground">({historyTotal})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConversation}
                className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors"
                title="Nueva consulta"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                title="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div
            ref={historyListRef}
            onScroll={handleHistoryScroll}
            className="flex-1 overflow-y-auto"
          >
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No tenés conversaciones anteriores</p>
              </div>
            ) : (
              <div className="py-1">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    disabled={loadingConversation}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-2 group ${
                      conv._id === conversationId
                        ? 'bg-violet-500/10 border-l-2 border-violet-500'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.title || 'Consulta sin título'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastActivityAt || conv.createdAt).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {conv.messageCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            · {conv.messageCount} msg
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      disabled={deletingId === conv._id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all shrink-0"
                      title="Eliminar"
                    >
                      {deletingId === conv._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </button>
                ))}

                {/* Load more indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                )}
                {historyHasMore && !loadingMore && (
                  <div className="text-center py-3">
                    <button
                      onClick={loadMoreConversations}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Cargar más...
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-3 border-b border-border/50 flex items-center justify-between shrink-0 bg-background/0 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                title={showSidebar ? 'Cerrar historial' : 'Abrir historial'}
              >
                {showSidebar ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </button>
              <div>
                <h2 className="text-lg font-semibold">Consultas IA</h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Preguntá sobre expedientes y proyectos de ley
                </p>
              </div>
            </div>

            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva</span>
            </button>
          </div>

          {/* Info Banner */}
          <div className="px-4 sm:px-6 pt-3 shrink-0">
            <div className="p-2.5 bg-violet-500/5 border border-violet-500/15 rounded-xl flex items-center gap-3 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span>
                La IA usa como contexto los <strong>expedientes procesados</strong> de la Legislatura de CABA.
              </span>
            </div>
          </div>

          {/* Loading conversation indicator */}
          {loadingConversation && (
            <div className="px-4 sm:px-6 pt-3 shrink-0">
              <div className="p-2.5 bg-violet-500/5 border border-violet-500/15 rounded-xl flex items-center gap-3 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin shrink-0" />
                <span>Cargando conversación...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 sm:px-6 pt-3 shrink-0">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" data-reset-scroll="true">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Welcome Message */}
              {mensajes.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-violet-500/50" />
                  <h3 className="text-lg font-semibold mb-2">Asistente de la Legislatura</h3>
                  <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                    Hacé preguntas sobre los expedientes y proyectos de ley presentados en la Legislatura de CABA.
                    Podés consultar por tema, legislador, bloque o tipo de expediente.
                  </p>

                  {/* Suggestions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                    {sugerencias.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="text-left p-3 rounded-xl bg-violet-500/5 border border-violet-500/15 text-sm hover:bg-violet-500/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mensajes.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.rol === 'usuario' ? 'justify-end' : ''}`}
                >
                  {msg.rol === 'asistente' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${msg.rol === 'usuario' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        msg.rol === 'usuario'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white ml-auto'
                          : 'bg-background/90 border border-border/50 shadow-sm'
                      }`}
                    >
                      {msg.rol === 'asistente' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ol]:mb-2 [&>ul]:mb-2">
                          <ReactMarkdown>{msg.contenido}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.contenido}</p>
                      )}
                    </div>

                    <div className={`text-xs text-muted-foreground mt-1 ${msg.rol === 'usuario' ? 'text-right' : ''}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {msg.rol === 'usuario' && (
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Streaming indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-background/90 border border-border/50 rounded-2xl p-4 shadow-sm max-w-[80%]">
                    {streamingContent ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ol]:mb-2 [&>ul]:mb-2">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-0.5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analizando expedientes...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="px-4 sm:px-6 pb-4 pt-2 shrink-0 border-t border-border/50 bg-background/0  backdrop-blur-lg">
            <div className="max-w-3xl mx-auto">
              {/* Quick suggestions if chat has messages */}
              {mensajes.length > 0 && mensajes.length < 4 && !isLoading && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {sugerencias.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-1.5 rounded-full bg-violet-500/5 border border-violet-500/15 text-muted-foreground hover:bg-violet-500/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hacé una pregunta sobre los expedientes..."
                  className="flex-1 px-5 py-3 rounded-xl bg-background/80 shadow-sm backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-sm"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
