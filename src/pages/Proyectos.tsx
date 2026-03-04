import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Calendar, FileText,
  Tag, Users, Building2, ChevronDown, ChevronUp, X, Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { proyectos, partidos, legisladores } from '../data/mockData';
import type { CategoriaProyecto, EstadoProyecto, ProyectoLey } from '../types/legislatura.types';

const categorias: (CategoriaProyecto | 'Todas')[] = [
  'Todas', 'Ley', 'Resolución', 'Declaración', 'Decreto', 'Comunicación', 'Pedido de Informes',
];

const estados: (EstadoProyecto | 'Todos')[] = [
  'Todos', 'Ingresado', 'En Comisión', 'Aprobado en Comisión', 'Media Sanción', 'Aprobado', 'Rechazado', 'Archivado',
];

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

const categoriaIcon: Record<string, string> = {
  'Ley': '📜',
  'Resolución': '📋',
  'Declaración': '📢',
  'Decreto': '⚖️',
  'Comunicación': '📨',
  'Pedido de Informes': '🔍',
};

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function esHoy(fecha: string): boolean {
  return fecha === '2026-03-03';
}

function esAyer(fecha: string): boolean {
  return fecha === '2026-03-02';
}

function fechaLabel(fecha: string): string {
  if (esHoy(fecha)) return 'Hoy';
  if (esAyer(fecha)) return 'Ayer';
  return '';
}

function ProyectoCard({ proyecto, index }: { proyecto: ProyectoLey; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <Link to={`/proyectos/${proyecto.id}`}>
          <div className="cursor-pointer group">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{categoriaIcon[proyecto.categoria]}</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  {proyecto.expediente}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor[proyecto.estado]}`}>
                  {proyecto.estado}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {proyecto.categoria}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{proyecto.titulo}</h3>
          </div>
        </Link>

        {/* AI Summary */}
        <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Resumen IA</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {proyecto.resumenIA}
          </p>
        </div>

        {/* Authors */}
        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Autor{proyecto.autores.length > 1 ? 'es' : ''}:</span>
            {proyecto.autores.map((a) => (
              <Link key={a.id} to={`/legisladores/${a.id}`} className="font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                {a.nombre} {a.apellido}
                <span className="text-xs text-muted-foreground ml-1">({a.partido.sigla})</span>
              </Link>
            ))}
          </div>
          {proyecto.coautores.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">Coautores:</span>
              {proyecto.coautores.map((a, i) => (
                <Link key={a.id} to={`/legisladores/${a.id}`} className="font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {a.nombre} {a.apellido}
                  <span className="text-xs text-muted-foreground ml-1">({a.partido.sigla})</span>
                  {i < proyecto.coautores.length - 1 ? ',' : ''}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {proyecto.etiquetas.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              {tag}
            </span>
          ))}
        </div>

        {/* Comisiones */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5" />
          <span>Comisiones: {proyecto.comisiones.join(', ')}</span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Ocultar texto' : 'Ver texto completo'}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 bg-muted/30 rounded-xl text-sm leading-relaxed border border-border/50">
                {proyecto.textoCompleto}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Proyectos() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProyecto | 'Todas'>('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoProyecto | 'Todos'>('Todos');
  const [partidoFiltro, setPartidoFiltro] = useState<string>('Todos');
  const [legisladorFiltro, setLegisladorFiltro] = useState<string>('Todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const filtrosActivos = categoriaFiltro !== 'Todas' || estadoFiltro !== 'Todos' || partidoFiltro !== 'Todos' || legisladorFiltro !== 'Todos' || busqueda.length > 0;

  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchTitulo = p.titulo.toLowerCase().includes(q);
        const matchExpediente = p.expediente.toLowerCase().includes(q);
        const matchResumen = p.resumenIA.toLowerCase().includes(q);
        const matchEtiqueta = p.etiquetas.some((e) => e.toLowerCase().includes(q));
        if (!matchTitulo && !matchExpediente && !matchResumen && !matchEtiqueta) return false;
      }
      if (categoriaFiltro !== 'Todas' && p.categoria !== categoriaFiltro) return false;
      if (estadoFiltro !== 'Todos' && p.estado !== estadoFiltro) return false;
      if (partidoFiltro !== 'Todos') {
        const tienePartido = p.partidosInvolucrados.some((pp) => pp.id === partidoFiltro);
        if (!tienePartido) return false;
      }
      if (legisladorFiltro !== 'Todos') {
        const esAutor = p.autores.some((a) => a.id === legisladorFiltro);
        const esCoautor = p.coautores.some((a) => a.id === legisladorFiltro);
        if (!esAutor && !esCoautor) return false;
      }
      return true;
    });
  }, [busqueda, categoriaFiltro, estadoFiltro, partidoFiltro, legisladorFiltro]);

  // Group by date
  const gruposPorFecha = useMemo(() => {
    const grouped = new Map<string, ProyectoLey[]>();
    for (const p of proyectosFiltrados) {
      const existing = grouped.get(p.fechaIngreso) || [];
      existing.push(p);
      grouped.set(p.fechaIngreso, existing);
    }
    return Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([fecha, projs]) => ({ fecha, proyectos: projs }));
  }, [proyectosFiltrados]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('Todas');
    setEstadoFiltro('Todos');
    setPartidoFiltro('Todos');
    setLegisladorFiltro('Todos');
  };

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">Proyectos de Ley</Title>
          <p className="text-muted-foreground">
            Explorá los proyectos presentados en la Legislatura de CABA, organizados por fecha
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, expediente, etiqueta..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${
                mostrarFiltros || filtrosActivos
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400'
                  : 'bg-background/80 border-border/50 hover:bg-accent'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {filtrosActivos && (
                <span className="w-2 h-2 rounded-full bg-violet-500" />
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Categoría */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoría</label>
                      <select
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        {categorias.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Estado</label>
                      <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        {estados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>

                    {/* Partido */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Partido</label>
                      <select
                        value={partidoFiltro}
                        onChange={(e) => setPartidoFiltro(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos los partidos</option>
                        {partidos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Legislador */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Legislador/a</label>
                      <select
                        value={legisladorFiltro}
                        onChange={(e) => setLegisladorFiltro(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos</option>
                        {legisladores.map((l) => (
                          <option key={l.id} value={l.id}>{l.apellido}, {l.nombre} ({l.partido.sigla})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filtrosActivos && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={limpiarFiltros}
                        className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''} encontrado{proyectosFiltrados.length !== 1 ? 's' : ''}
        </div>

        {/* Projects by Date */}
        <div className="space-y-10">
          {gruposPorFecha.map(({ fecha, proyectos: projs }) => (
            <motion.div
              key={fecha}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {fechaLabel(fecha) && (
                      <span className="mr-2">{fechaLabel(fecha)} ·</span>
                    )}
                    {formatFecha(fecha)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {projs.length} proyecto{projs.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Project Cards */}
              <div className="space-y-4">
                {projs.map((proyecto, idx) => (
                  <ProyectoCard key={proyecto.id} proyecto={proyecto} index={idx} />
                ))}
              </div>
            </motion.div>
          ))}

          {gruposPorFecha.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">No se encontraron proyectos con los filtros seleccionados</p>
              <button
                onClick={limpiarFiltros}
                className="mt-4 text-violet-600 dark:text-violet-400 hover:underline text-sm"
              >
                Limpiar filtros
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Container>
  );
}
