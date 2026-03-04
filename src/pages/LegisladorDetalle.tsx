import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, User, Phone, Calendar, FileText,
  Briefcase, Clock, Tag, Users, Sparkles, ChevronLeft, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { getLegisladorById, getExpedientesByLegislador } from '../services/legislatura.service';
import type { Legislador, Expediente } from '../types/legislatura.types';

const PROYECTOS_POR_PAGINA = 5;

const estadoColor: Record<string, string> = {
  'Ingresado': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'En Comisión': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Aprobado en Comisión': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'Media Sanción': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'Aprobado': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Rechazado': 'bg-red-500/10 text-red-600 dark:text-red-400',
  'Archivado': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  'Retirado': 'bg-gray-500/10 text-gray-500 dark:text-gray-400',
};

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function tieneMandatoActual(mandatoFin: string): boolean {
  return new Date(mandatoFin) >= new Date();
}

export function LegisladorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [legislador, setLegislador] = useState<Legislador | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroRol, setFiltroRol] = useState<'todos' | 'autor' | 'coautor'>('todos');
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [leg, exps] = await Promise.all([
          getLegisladorById(Number(id)),
          getExpedientesByLegislador(Number(id)),
        ]);
        if (!cancelled) {
          setLegislador(leg);
          setExpedientes(exps);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Error al cargar datos del legislador');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const legisladorIdNum = Number(id);

  const proyectosAutor = useMemo(() =>
    expedientes.filter((p) => p.autores.some((a) => a.legisladorId === legisladorIdNum)),
    [expedientes, legisladorIdNum]
  );

  const proyectosCoautor = useMemo(() =>
    expedientes.filter((p) => !p.autores.some((a) => a.legisladorId === legisladorIdNum)),
    [expedientes, legisladorIdNum]
  );

  const proyectosFiltrados = useMemo(() => {
    if (filtroRol === 'autor') return proyectosAutor;
    if (filtroRol === 'coautor') return proyectosCoautor;
    return expedientes;
  }, [filtroRol, proyectosAutor, proyectosCoautor, expedientes]);

  const totalPaginas = Math.ceil(proyectosFiltrados.length / PROYECTOS_POR_PAGINA);
  const proyectosPaginados = proyectosFiltrados.slice(
    (paginaActual - 1) * PROYECTOS_POR_PAGINA,
    paginaActual * PROYECTOS_POR_PAGINA
  );

  const handleFiltroChange = (nuevoFiltro: 'todos' | 'autor' | 'coautor') => {
    setFiltroRol(nuevoFiltro);
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
          <p className="text-muted-foreground">Cargando legislador...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500/70" />
          <p className="text-xl text-red-600 dark:text-red-400 mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/legisladores')}
            className="mt-4 text-violet-600 dark:text-violet-400 hover:underline"
          >
            Volver a legisladores
          </button>
        </div>
      </Container>
    );
  }

  if (!legislador) {
    return (
      <Container>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-xl text-muted-foreground">Legislador no encontrado</p>
          <button
            onClick={() => navigate('/legisladores')}
            className="mt-4 text-violet-600 dark:text-violet-400 hover:underline"
          >
            Volver a legisladores
          </button>
        </div>
      </Container>
    );
  }

  const edad = calcularEdad(legislador.fechaNacimiento);
  const mandatoActual = tieneMandatoActual(legislador.fecha_fin_mandato);
  const iniciales = `${legislador.nombre[0]}${legislador.apellido[0]}`;
  const fotoUrl = legislador.fotoM || legislador.foto;

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

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-8"
        >
          <div className="h-2" style={{ backgroundColor: legislador.bloqueColor }} />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={`${legislador.nombre} ${legislador.apellido}`}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg shrink-0"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0"
                  style={{ backgroundColor: legislador.bloqueColor }}
                >
                  {iniciales}
                </div>
              )}

              <div className="flex-1">
                {/* Name & Bloque */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {legislador.nombre} {legislador.apellido}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: legislador.bloqueColor }}
                  >
                    {legislador.bloque}
                  </span>
                </div>

                {/* Cargo en recinto */}
                {legislador.cargoRecinto && (
                  <p className="text-muted-foreground mb-4">
                    Cargo: <span className="font-medium text-foreground">{legislador.cargoRecinto}</span>
                  </p>
                )}

                {/* Mandate status badge */}
                <div className="mb-4">
                  {mandatoActual ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Mandato vigente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Mandato finalizado
                    </span>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-muted-foreground text-xs">Edad</div>
                      <div className="font-medium">{isNaN(edad) ? '—' : `${edad} años`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-muted-foreground text-xs">Oficina</div>
                      <div className="font-medium">{legislador.oficina || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-muted-foreground text-xs">Mandato</div>
                      <div className="font-medium">
                        {new Date(legislador.fecha_inicio_mandato).getFullYear()}-{new Date(legislador.fecha_fin_mandato).getFullYear()}
                      </div>
                    </div>
                  </div>
                  {legislador.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-muted-foreground text-xs">Teléfono</div>
                        <div className="font-medium truncate">{legislador.telefono}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comisiones */}
                {legislador.comisiones && legislador.comisiones.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Comisiones</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {legislador.comisiones.map((com) => (
                        <span
                          key={com.comisionId}
                          className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                          title={com.cargo}
                        >
                          {com.nombre}{com.cargo ? ` (${com.cargo})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {expedientes.length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Proyectos totales</p>
          </div>
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {proyectosAutor.length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Como autor</p>
          </div>
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {proyectosCoautor.length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Como coautor</p>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Title fontSize="text-2xl" style="">Proyectos</Title>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {([
                { key: 'todos', label: 'Todos' },
                { key: 'autor', label: 'Autor' },
                { key: 'coautor', label: 'Coautor' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleFiltroChange(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filtroRol === key
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 text-sm text-muted-foreground">
            {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}
          </div>

          {/* Project Cards */}
          <div className="space-y-4">
            {proyectosPaginados.map((proyecto, idx) => (
              <ProyectoCardMini key={proyecto.expedienteId} proyecto={proyecto} legisladorId={legisladorIdNum} index={idx} />
            ))}
          </div>

          {proyectosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No se encontraron proyectos con este filtro</p>
            </div>
          )}

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="p-2 rounded-xl border border-border/50 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pag) => (
                <button
                  key={pag}
                  onClick={() => setPaginaActual(pag)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    paginaActual === pag
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'border border-border/50 hover:bg-accent'
                  }`}
                >
                  {pag}
                </button>
              ))}
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-xl border border-border/50 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </Container>
  );
}

function ProyectoCardMini({ proyecto, legisladorId, index }: { proyecto: Expediente; legisladorId: number; index: number }) {
  const esAutor = proyecto.autores.some((a) => a.legisladorId === legisladorId);
  const resumen = proyecto.aiSummary || proyecto.sumario;

  return (
    <Link to={`/proyectos/${proyecto.expedienteId}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {proyecto.numero}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor[proyecto.estado] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
              {proyecto.estado}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              esAutor
                ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}>
              {esAutor ? 'Autor' : 'Coautor'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Tag className="w-3 h-3" />
              {proyecto.tipo}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-tight mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {proyecto.titulo}
          </h3>

          {/* AI Summary / Sumario */}
          {resumen && (
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">{resumen}</p>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(proyecto.fechaIngreso + 'T12:00:00').toLocaleDateString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
