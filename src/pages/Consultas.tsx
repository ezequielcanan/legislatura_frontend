import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Send, Sparkles, Bot, User, Loader2, Info, Plus,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { sendChatMessage, createConversation } from '../services/legislatura.service';
import type { MensajeChat } from '../types/legislatura.types';

export function Consultas() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, streamingContent, scrollToBottom]);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 shrink-0">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Title fontSize="text-3xl" style="mb-2">Consultas IA</Title>
              <p className="text-muted-foreground text-sm">
                Preguntá sobre los expedientes y proyectos de ley. La IA responde con contexto de los expedientes procesados.
              </p>
            </div>

            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva consulta
            </button>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl flex items-center gap-3 text-sm text-muted-foreground shrink-0"
        >
          <Info className="w-4 h-4 text-violet-500 shrink-0" />
          <span>
            La IA usa como contexto los <strong>expedientes procesados</strong> de la Legislatura de CABA, incluyendo resúmenes y etiquetas generadas por IA.
          </span>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 shrink-0">
            {error}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-background/50 backdrop-blur-lg border border-border/50 shadow-inner mb-4" data-reset-scroll="true">
          <div className="p-4 space-y-4">
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
        <div className="shrink-0">
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
              placeholder="Hacé una pregunta sobre los expedientes de la Legislatura..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </Container>
  );
}
