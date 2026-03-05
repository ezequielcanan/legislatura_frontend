import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, FileText, Calendar, Tag, Users,
  Sparkles, MapPin, ScrollText, Download, Loader2, AlertCircle,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Container from '../components/containers/Container';
import { getExpedienteById } from '../services/legislatura.service';
import type { Expediente } from '../types/legislatura.types';

const estadoColor: Record<string, string> = {
  'Ingresado': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'En Comisión': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Aprobado en Comisión': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'Media Sanción': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'Aprobado': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Rechazado': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'Archivado': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  'Retirado': 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20',
};

const tipoIcon: Record<string, string> = {
  'Ley': '📜',
  'Resolución': '📋',
  'Declaración': '📢',
  'Decreto': '⚖️',
  'Comunicación': '📨',
  'Pedido de Informes': '🔍',
};

function formatFechaCompleta(fecha: string): string {
  return fecha.split("T")[0]
}

export function ProyectoDetalle() {
  const { expedienteId } = useParams<{ expedienteId: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!expedienteId) {
      setError('ID de expediente no proporcionado');
      setLoading(false);
      return;
    }

    const id = Number(expedienteId);
    if (isNaN(id)) {
      setError('ID de expediente inválido');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchExpediente() {
      try {
        setLoading(true);
        setError(null);
        const data = await getExpedienteById(id);
        if (!cancelled) {
          setProyecto(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Error al cargar el expediente');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExpediente();

    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  if (loading) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-500 animate-spin" />
          <p className="text-lg text-muted-foreground">Cargando expediente...</p>
        </div>
      </Container>
    );
  }

  if (error || !proyecto) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-xl text-muted-foreground">{error || 'Proyecto no encontrado'}</p>
          <button
            onClick={() => navigate('/proyectos')}
            className="mt-4 text-violet-600 dark:text-violet-400 hover:underline"
          >
            Volver a proyectos
          </button>
        </div>
      </Container>
    );
  }

  const resumenIA = proyecto.aiSummary || proyecto.sumario;
  const etiquetas = proyecto.aiTags || [];

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-8"
        >
          <div className="p-6 sm:p-8">
            {/* Top badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-2xl">{tipoIcon[proyecto.tipo] || '📄'}</span>
              <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">
                {proyecto.numero}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${estadoColor[proyecto.estado] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'}`}>
                {proyecto.estado}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">{proyecto.titulo}</h1>

            {/* Tags */}
            {etiquetas?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {etiquetas?.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sumario */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Sumario</h2>
              </div>
              <p className="text-foreground/80 leading-relaxed">{proyecto.sumario}</p>
            </motion.div>

            {/* Resumen IA */}
            {resumenIA && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg font-semibold text-violet-600 dark:text-violet-400">Resumen IA</h2>
                </div>
                <p className="text-foreground/80 leading-relaxed">{resumenIA}</p>
              </motion.div>
            )}

            {/* Texto completo (pdfText) */}
            {proyecto.pdfText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold">Texto Completo</h2>
                </div>
                <div className="text-foreground/80 leading-relaxed bg-muted/30 rounded-xl p-4 border border-border/50 whitespace-pre-wrap">
                  {proyecto.pdfText}
                </div>
              </motion.div>
            )}

            {/* Libros (downloadable documents) */}
            {proyecto?.libros && proyecto?.libros?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold">Bibliografía</h2>
                </div>
                <div className="space-y-2">
                  {proyecto.libros.map((libro, i) => (
                    <div
                      key={libro.idDoc + i}
                      className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 transition-all group"
                    >
                      <FileText className="w-5 h-5 text-muted-foreground shrink-0 transition-colors" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{libro.nombre}</div>
                        <div className="text-xs text-muted-foreground">{libro.tipo}</div>
                      </div>
                      {/*
                      <Download className="w-4 h-4 text-muted-foreground shrink-0 transition-colors" />
                      */}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Información</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</div>
                    <div className="font-medium">{proyecto.tipo}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Fecha de ingreso</div>
                    <div className="font-medium">{formatFechaCompleta(proyecto.fechaIngresoDate)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</div>
                    <div className="font-medium">{proyecto.ubicacion}: {proyecto.estado}</div>
                  </div>
                </div>
                {proyecto.anioParlamentario && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Año parlamentario</div>
                      <div className="font-medium">{proyecto.anioParlamentario}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Autores */}
            {proyecto?.autor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold">Autores</h2>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Link key={proyecto?.autor.legisladorId} to={`/legisladores/${proyecto?.autor.legisladorId}`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                      <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {proyecto?.autor.nombre[0]}{proyecto?.autor.apellido[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-md">{proyecto?.autor.nombre} {proyecto?.autor.apellido}</div>
                      </div>
                    </div>
                  </Link>
                  {proyecto?.coautores?.map((autor) => (
                    <Link key={autor.legisladorId} to={`/legisladores/${autor.legisladorId}`}>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                        <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {autor.nombre[0]}{autor.apellido[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{autor.nombre} {autor.apellido}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
