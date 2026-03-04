import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send, Calendar, Sparkles, Bot, User, FileText, Loader2, Info,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { mensajesChatMock, proyectos } from '../data/mockData';
import type { MensajeChat } from '../types/legislatura.types';

// Simulated AI responses based on keywords
function generarRespuestaIA(pregunta: string): { contenido: string; refs: typeof proyectos } {
  const q = pregunta.toLowerCase();

  if (q.includes('transporte') || q.includes('subte') || q.includes('colectivo')) {
    return {
      contenido: `Encontré **2 proyectos relacionados con transporte** en el período seleccionado:\n\n1. **Programa de Modernización del Transporte Público** (Exp. 0234-D-2026): Propone colectivos eléctricos, mejora de subte y pago digital unificado. Autor: María González (PRO).\n\n2. **Pedido de Informes sobre Contrataciones del Subte** (Exp. 0211-D-2026): Solicita datos de contrataciones de SBASE y avance de líneas E y F. Autor: Roberto Fernández (UCR).\n\n¿Querés más detalles sobre alguno?`,
      refs: [proyectos[0], proyectos[13]],
    };
  }

  if (q.includes('salud') || q.includes('hospital')) {
    return {
      contenido: `En materia de **salud** encontré estos proyectos:\n\n1. **Pedido de Informes sobre Estado de Hospitales Públicos** (Exp. 0231-D-2026): Solicita información sobre estado edilicio, equipamiento y personal de los 13 hospitales generales. Autor: Carlos Rodríguez (UxP).\n\n2. **Decreto de Control de Plagas Urbanas** (Exp. 0216-D-2026): Declara emergencia sanitaria en comunas 4, 8 y 9. Ya fue aprobado.\n\nAmbos proyectos reflejan preocupaciones sanitarias actuales en la ciudad.`,
      refs: [proyectos[4], proyectos[11]],
    };
  }

  if (q.includes('ambiente') || q.includes('verde') || q.includes('árbol') || q.includes('sustentab')) {
    return {
      contenido: `Hay **3 proyectos con impacto ambiental**:\n\n1. **Plan de Forestación Urbana 2026-2030** (Exp. 0205-D-2026): 100.000 nuevos árboles priorizando barrios con menor arbolado. Aprobado en Comisión.\n\n2. **Modificación del Código de Edificación - Techos Verdes** (Exp. 0232-D-2026): Exige 30% de techo verde o paneles solares en edificios nuevos de +6 pisos.\n\n3. **Programa de Modernización del Transporte** (Exp. 0234-D-2026): Aunque es de transporte, incluye la transición a colectivos eléctricos.\n\nLa agenda ambiental está ganando peso en la legislatura.`,
      refs: [proyectos[14], proyectos[5], proyectos[0]],
    };
  }

  if (q.includes('vivienda') || q.includes('alquiler')) {
    return {
      contenido: `Encontré **2 proyectos sobre vivienda**:\n\n1. **Regulación de Alquileres Temporarios** (Exp. 0236-D-2026): Regula actividad tipo Airbnb con registro obligatorio, límites y fondo para vivienda social. Autor: Diego Pérez (FIT-U).\n\n2. **Comunicación sobre Emergencia en Villas** (Exp. 0221-D-2026): Solicita medidas urgentes de urbanización y servicios básicos en villas y asentamientos.\n\nEl acceso a la vivienda es uno de los temas más activos actualmente.`,
      refs: [proyectos[2], proyectos[9]],
    };
  }

  if (q.includes('tecnología') || q.includes('inteligencia artificial') || q.includes('ia') || q.includes('digital')) {
    return {
      contenido: `Sobre **tecnología e IA** encontré:\n\n1. **Regulación del Uso de IA por el GCBA** (Exp. 0210-D-2026): Framework regulatorio para sistemas de IA gubernamentales. Establece transparencia, no discriminación y supervisión humana. Autor: Lucía Díaz (LLA).\n\n2. **Ley de Promoción de la Economía del Conocimiento** (Exp. 0220-D-2026): Beneficios para empresas tech, polos tecnológicos y fondo para startups. Ya tiene media sanción.\n\nCABA está avanzando hacia una regulación proactiva de la tecnología.`,
      refs: [proyectos[12], proyectos[8]],
    };
  }

  // Default response
  return {
    contenido: `Analicé los **${proyectos.length} proyectos** presentados en el período seleccionado. Los temas más activos son:\n\n- **Transporte y movilidad**: Modernización de colectivos y subte\n- **Vivienda**: Regulación de alquileres temporarios y urbanización\n- **Ambiente**: Forestación y techos verdes\n- **Tecnología**: Regulación de IA y economía del conocimiento\n- **Salud**: Estado de hospitales y control de plagas\n\n¿Sobre cuál de estos temas querés profundizar? También podés preguntarme por un legislador o partido específico.`,
    refs: [],
  };
}

export function Consultas() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(mensajesChatMock);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('2026-02-25');
  const [fechaHasta, setFechaHasta] = useState('2026-03-03');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: MensajeChat = {
      id: `msg-${Date.now()}`,
      rol: 'usuario',
      contenido: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMensajes((prev) => [...prev, userMsg]);
    const pregunta = input.trim();
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { contenido, refs } = generarRespuestaIA(pregunta);

    const aiMsg: MensajeChat = {
      id: `msg-${Date.now()}-ai`,
      rol: 'asistente',
      contenido,
      timestamp: new Date().toISOString(),
      proyectosReferenciados: refs,
    };

    setMensajes((prev) => [...prev, aiMsg]);
    setIsLoading(false);
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
                Preguntá sobre los proyectos de ley. La IA responde con contexto de los proyectos del período seleccionado.
              </p>
            </div>

            {/* Date range selector */}
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-lg rounded-xl border border-border/50 p-3 shadow-md">
              <Calendar className="w-4 h-4 text-violet-600 shrink-0" />
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-violet-500"
                />
                <span className="text-muted-foreground">a</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-violet-500"
                />
              </div>
            </div>
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
            La IA usa como contexto los <strong>{proyectos.length} proyectos</strong> presentados entre{' '}
            {new Date(fechaDesde + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} y{' '}
            {new Date(fechaHasta + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-background/50 backdrop-blur-lg border border-border/50 shadow-inner mb-4" data-reset-scroll="true">
          <div className="p-4 space-y-4">
            {/* Welcome Message */}
            {mensajes.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 text-violet-500/50" />
                <h3 className="text-lg font-semibold mb-2">Asistente de la Legislatura</h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                  Hacé preguntas sobre los proyectos de ley presentados en la Legislatura de CABA.
                  Podés consultar por tema, legislador, partido o fecha.
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

                  {/* Referenced Projects */}
                  {msg.proyectosReferenciados && msg.proyectosReferenciados.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Proyectos referenciados:
                      </span>
                      {msg.proyectosReferenciados.map((p) => (
                        <div key={p.id} className="text-xs p-2 bg-violet-500/5 border border-violet-500/10 rounded-lg">
                          <span className="font-mono text-muted-foreground mr-1">{p.expediente}</span>
                          {p.titulo}
                        </div>
                      ))}
                    </div>
                  )}

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

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-background/90 border border-border/50 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizando proyectos...
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0">
          {/* Quick suggestions if chat has messages */}
          {mensajes.length > 0 && mensajes.length < 4 && (
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
              placeholder="Hacé una pregunta sobre los proyectos de ley..."
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
