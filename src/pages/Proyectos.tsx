import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, FileText,
  Tag, Users, X, Sparkles, Loader2,
  ChevronLeft, ChevronRight, Calendar, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { searchExpedientes, getBloques, getLegisladores } from '../services/legislatura.service';
import type { Expediente, Bloque, Legislador } from '../types/legislatura.types';

const PAGE_SIZE = 10;

const categorias = [
  'Todos', 'LEY', 'RESOLUCION', 'DECLARACION', 'HACE CONSIDERACIONES', 'INTERNO', 'ESCUELAS', 'OFICIAL', 'PARTICULAR', 'FORO DE LA TERCERA EDAD', 'REMITE ACTUACIONES', 'NO DEFINIDO',
];

const estados = [
  'Todos', 'Ingresado', 'En Comisión', 'Aprobado', 'Rechazado', 'Archivado',
];

const estadoColor: Record<string, string> = {
  'Ingresado': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'En Comisión': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Aprobado': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Rechazado': 'bg-red-500/10 text-red-600 dark:text-red-400',
  'Archivado': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const categoriaIcon: Record<string, string> = {
  'LEY': '📜',
  'RESOLUCION': '📌',
  'DECLARACION': '📣',
  'HACE CONSIDERACIONES': '💭',
  'INTERNO': '🏛️',
  'ESCUELAS': '🏫',
  'OFICIAL': '👔',
  'PARTICULAR': '👤',
  'FORO DE LA TERCERA EDAD': '👵',
  'REMITE ACTUACIONES': '📤',
  'NO DEFINIDO': '❓',
};

// ─── Helpers ─────────────────────────────────────

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

function isToday(dateStr: string): boolean {
  return dateStr === formatDateISO(new Date());
}

// ─── Pagination ──────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Primera página"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                ? 'bg-violet-600 text-white shadow-md'
                : 'hover:bg-muted/50 text-muted-foreground'
              }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Última página"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── ProyectoCard ────────────────────────────────

function ProyectoCard({ proyecto, index }: { proyecto: Expediente; index: number }) {
  const resumen = proyecto.aiSummary || proyecto.sumario;
  const tags = proyecto.aiTags || [];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <Link to={`/proyectos/${proyecto.expedienteId}`}>
          <div className="cursor-pointer group">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{categoriaIcon[proyecto.tipo] || '📄'}</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  {proyecto.numero}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor[proyecto.estado] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                  {proyecto.estado}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {proyecto.tipo}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{proyecto.titulo}</h3>
          </div>
        </Link>

        {/* AI Summary / Sumario */}
        {resumen && (
          <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                {proyecto.aiSummary ? 'Resumen IA' : 'Sumario'}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {resumen}
            </p>
          </div>
        )}

        {/* Authors */}
        {proyecto?.autor && (
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Autores:</span>
              <Link key={proyecto.autor.legisladorId} to={`/legisladores/${proyecto.autor.legisladorId}`} className="font-bold text-md hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                {proyecto.autor.nombre} {proyecto.autor.apellido}
              </Link>
              {proyecto?.coautores?.map((a) => (
                <Link key={a.legisladorId} to={`/legisladores/${a.legisladorId}`} className="font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {a.nombre} {a.apellido}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle for sumario when aiSummary exists */}
        {/*proyecto.aiSummary && proyecto.sumario && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Ocultar sumario' : 'Ver sumario original'}
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
                    {proyecto.sumario}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )*/}
      </div>
    </motion.div>
  );
}

export function Proyectos() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state from URL query params
  const busqueda = searchParams.get('q') || '';
  const categoriaFiltro = searchParams.get('tipo') || 'Todos';
  const estadoFiltro = searchParams.get('estado') || 'Todos';
  const bloqueFiltro = searchParams.get('bloque') || 'Todos';
  const legisladorFiltro = searchParams.get('legislador') || 'Todos';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Day-by-day navigation date (defaults to today)
  const selectedDate = searchParams.get('fecha') || formatDateISO(new Date());

  // Mode: 'day' for day-by-day browsing, 'range' for custom date range
  const dateMode = searchParams.get('modo') || 'day';

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [proyectos, setProyectos] = useState<Expediente[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for date range inputs to avoid resetting while typing
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  // Reference data
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [legisladoresList, setLegisladoresList] = useState<Legislador[]>([]);

  // Debounce timers
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateFromDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateToDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalResultados / PAGE_SIZE));

  // Helper to update a single search param
  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === 'Todos') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        // Reset page when changing filters
        if (key !== 'page') {
          next.delete('page');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setMultipleParams = useCallback(
    (params: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(params)) {
          if (value === '' || value === 'Todos') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const setBusqueda = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setParam('q', value), 400);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!value) next.delete('q');
        else next.set('q', value);
        next.delete('page');
        return next;
      });
    },
    [setParam, setSearchParams],
  );

  // Day navigation
  const goToPrevDay = () => setMultipleParams({ fecha: addDays(selectedDate, -1), modo: 'day' });
  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    const today = formatDateISO(new Date());
    if (next <= today) {
      setMultipleParams({ fecha: next, modo: 'day' });
    }
  };
  const goToToday = () => setMultipleParams({ fecha: formatDateISO(new Date()), modo: 'day' });

  const switchToRange = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('modo', 'range');
      next.delete('fecha');
      next.delete('page');
      return next;
    });
  };

  const switchToDay = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('modo', 'day');
      if (!next.get('fecha')) next.set('fecha', formatDateISO(new Date()));
      next.delete('dateFrom');
      next.delete('dateTo');
      next.delete('page');
      return next;
    });
  };

  const filtrosActivos = categoriaFiltro !== 'Todos' || estadoFiltro !== 'Todos' || bloqueFiltro !== 'Todos' || legisladorFiltro !== 'Todos' || busqueda.length > 0;

  // Sync local date state when URL params change externally
  useEffect(() => { setLocalDateFrom(dateFrom); }, [dateFrom]);
  useEffect(() => { setLocalDateTo(dateTo); }, [dateTo]);

  // Debounced date setters
  const setDebouncedDateFrom = useCallback(
    (value: string) => {
      setLocalDateFrom(value);
      if (dateFromDebounceRef.current) clearTimeout(dateFromDebounceRef.current);
      dateFromDebounceRef.current = setTimeout(() => setParam('dateFrom', value), 600);
    },
    [setParam],
  );
  const setDebouncedDateTo = useCallback(
    (value: string) => {
      setLocalDateTo(value);
      if (dateToDebounceRef.current) clearTimeout(dateToDebounceRef.current);
      dateToDebounceRef.current = setTimeout(() => setParam('dateTo', value), 600);
    },
    [setParam],
  );

  // Load bloques and legisladores on mount
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [bloquesData, legisladoresData] = await Promise.all([
          getBloques(),
          getLegisladores(),
        ]);

        setBloques(bloquesData);
        setLegisladoresList(legisladoresData);
      } catch (err) {
        console.error('Error loading reference data:', err);
      }
    }
    loadReferenceData();
  }, []);

  // Fetch expedientes when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { limit: PAGE_SIZE };
        if (busqueda) params.query = busqueda;
        if (categoriaFiltro !== 'Todos') params.tipo = categoriaFiltro;
        if (estadoFiltro !== 'Todos') params.estado = estadoFiltro;
        if (bloqueFiltro !== 'Todos') params.bloqueId = Number(bloqueFiltro);
        if (legisladorFiltro !== 'Todos') params.legisladorId = Number(legisladorFiltro);

        // Date filtering
        if (dateMode === 'day') {
          params.dateFrom = selectedDate;
          params.dateTo = selectedDate;
        } else if (dateMode === 'range') {
          if (dateFrom) params.dateFrom = dateFrom;
          if (dateTo) params.dateTo = dateTo;
        }

        // Pagination
        params.skip = (currentPage - 1) * PAGE_SIZE;

        const result = await searchExpedientes(params);
        if (!cancelled) {
          setProyectos(result.data);
          setTotalResultados(result.total);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error searching expedientes:', err);
          setError('Error al cargar los proyectos. Intentá de nuevo más tarde.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [busqueda, categoriaFiltro, estadoFiltro, bloqueFiltro, legisladorFiltro, selectedDate, dateFrom, dateTo, dateMode, currentPage]);

  const limpiarFiltros = () => {
    setSearchParams({ fecha: formatDateISO(new Date()), modo: 'day' });
  };

  const handlePageChange = (page: number) => {
    setParam('page', String(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">Proyectos de Ley</Title>
          <p className="text-muted-foreground">
            Explorá los proyectos presentados en la Legislatura de CABA
          </p>
        </motion.div>

        {/* Date Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-4">
            {/* Mode Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={switchToDay}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${dateMode === 'day'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
              >
                Por día
              </button>
              <button
                onClick={switchToRange}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${dateMode === 'range'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
              >
                Rango de fechas
              </button>
            </div>

            {dateMode === 'day' ? (
              /* Day-by-day navigation */
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <button
                  onClick={goToPrevDay}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Día anterior</span>
                </button>

                <div className="flex items-center gap-3 text-center">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="text-base sm:text-lg font-semibold capitalize">
                      {formatDateDisplay(selectedDate)}
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="date"
                      value={selectedDate}
                      max={formatDateISO(new Date())}
                      onChange={(e) => {
                        if (e.target.value) setMultipleParams({ fecha: e.target.value, modo: 'day' });
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {!isToday(selectedDate) && (
                    <button
                      onClick={goToToday}
                      className="px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors text-sm font-medium"
                    >
                      Hoy
                    </button>
                  )}
                  <button
                    onClick={goToNextDay}
                    disabled={isToday(selectedDate)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Día siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Date range picker */
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Desde:</label>
                  <input
                    type="date"
                    value={localDateFrom}
                    max={localDateTo || formatDateISO(new Date())}
                    onChange={(e) => setDebouncedDateFrom(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground font-medium whitespace-nowrap">Hasta:</label>
                  <input
                    type="date"
                    value={localDateTo}
                    min={localDateFrom}
                    max={formatDateISO(new Date())}
                    onChange={(e) => setDebouncedDateTo(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                  />
                </div>
                {(localDateFrom || localDateTo) && (
                  <button
                    onClick={() => {
                      if (dateFromDebounceRef.current) clearTimeout(dateFromDebounceRef.current);
                      if (dateToDebounceRef.current) clearTimeout(dateToDebounceRef.current);
                      setLocalDateFrom('');
                      setLocalDateTo('');
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete('dateFrom');
                        next.delete('dateTo');
                        next.delete('page');
                        return next;
                      });
                    }}
                    className="flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Limpiar fechas
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                defaultValue={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, expediente, etiqueta..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${mostrarFiltros || filtrosActivos
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
                    {/* Categoría / Tipo */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoría</label>
                      <select
                        value={categoriaFiltro}
                        onChange={(e) => setParam('tipo', e.target.value)}
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
                        onChange={(e) => setParam('estado', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        {estados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bloque */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Bloque</label>
                      <select
                        value={bloqueFiltro}
                        onChange={(e) => setParam('bloque', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos los bloques</option>
                        {bloques.map((b) => (
                          <option key={b.bloqueId} value={String(b.bloqueId)}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Legislador */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Legislador/a</label>
                      <select
                        value={legisladorFiltro}
                        onChange={(e) => setParam('legislador', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos</option>
                        {legisladoresList.map((l) => (
                          <option key={l.legisladorId} value={String(l.legisladorId)}>
                            {l.apellido}, {l.nombre} ({l.bloque})
                          </option>
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

        {/* Results count & page info */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalResultados} proyecto{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
            </span>
            {totalPages > 1 && (
              <span>
                Página {currentPage} de {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando proyectos...</p>
          </motion.div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-violet-600 dark:text-violet-400 hover:underline text-sm"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Projects flat list */}
        {!loading && !error && (
          <>
            <div className="space-y-4">
              {proyectos?.map((proyecto, idx) => (
                <ProyectoCard key={proyecto.expedienteId} proyecto={proyecto} index={idx} />
              ))}

              {proyectos?.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">
                    No se encontraron proyectos {dateMode === 'day' ? `para el ${formatDateDisplay(selectedDate)}` : 'con los filtros seleccionados'}
                  </p>
                  {dateMode === 'day' ? (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={goToPrevDay}
                        className="text-violet-600 dark:text-violet-400 hover:underline text-sm"
                      >
                        ← Probar día anterior
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        onClick={goToToday}
                        className="text-violet-600 dark:text-violet-400 hover:underline text-sm"
                      >
                        Ir a hoy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={limpiarFiltros}
                      className="mt-4 text-violet-600 dark:text-violet-400 hover:underline text-sm"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </Container>
  );
}
