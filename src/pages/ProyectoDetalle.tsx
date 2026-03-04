import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, FileText, Calendar, Tag, Users, Building2,
  Sparkles, MapPin, Compass, ScrollText, GitBranch, User,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Container from '../components/containers/Container';
import { proyectos } from '../data/mockData';

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

const categoriaIcon: Record<string, string> = {
  'Ley': '📜',
  'Resolución': '📋',
  'Declaración': '📢',
  'Decreto': '⚖️',
  'Comunicación': '📨',
  'Pedido de Informes': '🔍',
};

function formatFechaCompleta(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const proyecto = proyectos.find((p) => p.id === id);

  if (!proyecto) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-xl text-muted-foreground">Proyecto no encontrado</p>
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
              <span className="text-2xl">{categoriaIcon[proyecto.categoria]}</span>
              <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">
                {proyecto.expediente}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${estadoColor[proyecto.estado]}`}>
                {proyecto.estado}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">{proyecto.titulo}</h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {proyecto.etiquetas.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {tag}
                </span>
              ))}
            </div>
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
              <p className="text-foreground/80 leading-relaxed">{proyecto.resumenIA}</p>
            </motion.div>

            {/* Texto completo */}
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
              <div className="text-foreground/80 leading-relaxed bg-muted/30 rounded-xl p-4 border border-border/50">
                {proyecto.textoCompleto}
              </div>
            </motion.div>
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
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Proyecto de</div>
                    <div className="font-medium">{proyecto.proyectoDe}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Fecha de ingreso</div>
                    <div className="font-medium">{formatFechaCompleta(proyecto.fechaIngreso)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Compass className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Origen</div>
                    <div className="font-medium">{proyecto.origen}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</div>
                    <div className="font-medium">{proyecto.ubicacion}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Giros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Giros</h2>
              </div>
              <div className="space-y-2">
                {proyecto.giros.map((giro, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl border border-border/30">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{giro}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Comisiones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Comisiones</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {proyecto.comisiones.map((com) => (
                  <span key={com} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {com}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Autores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Autor{proyecto.autores.length > 1 ? 'es' : ''}</h2>
              </div>
              <div className="space-y-2">
                {proyecto.autores.map((a) => (
                  <Link key={a.id} to={`/legisladores/${a.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: a.partido.color }}
                      >
                        {a.nombre[0]}{a.apellido[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{a.nombre} {a.apellido}</div>
                        <div className="text-xs text-muted-foreground">{a.partido.sigla} · {a.bloque}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Coautores */}
            {proyecto.coautores.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Coautores</h2>
                </div>
                <div className="space-y-2">
                  {proyecto.coautores.map((a) => (
                    <Link key={a.id} to={`/legisladores/${a.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all cursor-pointer">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: a.partido.color }}
                        >
                          {a.nombre[0]}{a.apellido[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{a.nombre} {a.apellido}</div>
                          <div className="text-xs text-muted-foreground">{a.partido.sigla} · {a.bloque}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adherentes */}
            {proyecto.adherentes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold">Adherentes</h2>
                </div>
                <div className="space-y-2">
                  {proyecto.adherentes.map((a) => (
                    <Link key={a.id} to={`/legisladores/${a.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-pointer">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: a.partido.color }}
                        >
                          {a.nombre[0]}{a.apellido[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{a.nombre} {a.apellido}</div>
                          <div className="text-xs text-muted-foreground">{a.partido.sigla} · {a.bloque}</div>
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
