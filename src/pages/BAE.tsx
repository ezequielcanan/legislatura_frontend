import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, FileText,
  Tag, Users, X, Sparkles, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  BookOpen, Hash,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import {
  getBaes,
  getBaeWithExpedientes,
  getCombinedBaesExpedientes,
  getBloques,
  getComisiones,
  getDistinctAutores,
  getDistinctCoautores,
} from '../services/legislatura.service';
import type { Expediente, Bloque, ComisionItem, BaeRecord } from '../types/legislatura.types';

const PAGE_SIZE = 10;

const categorias = [
  'Todos', 'LEY', 'RESOLUCION', 'DECLARACION', 'HACE CONSIDERACIONES', 'INTERNO', 'ESCUELAS', 'OFICIAL', 'PARTICULAR', 'FORO DE LA TERCERA EDAD', 'REMITE ACTUACIONES', 'NO DEFINIDO',
];

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

// ─── BaeCard ─────────────────────────────────────

function BaeCard({ proyecto, index }: { proyecto: Expediente; index: number }) {
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
                {proyecto.baeSource && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    BAE
                  </span>
                )}
                {proyecto.baeGrupo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {proyecto.baeGrupo}
                  </span>
                )}
                {proyecto.comisiones && proyecto.comisiones.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    {proyecto.comisiones[0].comisionDes}
                    {proyecto.comisiones.length > 1 && ` +${proyecto.comisiones.length - 1}`}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {proyecto.tipo}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {proyecto.titulo}
            </h3>
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
      </div>
    </motion.div>
  );
}

// ─── Main BAE Page ───────────────────────────────

export function BAE() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Current BAE navigation
  const currentNro = parseInt(searchParams.get('nro') || '0', 10);
  const currentAno = parseInt(searchParams.get('ano') || String(new Date().getFullYear()), 10);

  // Filters
  const busqueda = searchParams.get('q') || '';
  const categoriaFiltro = searchParams.get('tipo') || 'Todos';
  const comisionFiltro = searchParams.get('comision') || 'Todos';
  const bloqueFiltro = searchParams.get('bloque') || 'Todos';
  const autorFiltro = searchParams.get('autor') || 'Todos';
  const coautorFiltro = searchParams.get('coautor') || 'Todos';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // New filters
  const searchMode = (searchParams.get('searchMode') || 'text') as 'text' | 'exact';
  const baeSourceOnly = searchParams.get('baeSourceOnly') === 'true';
  const baeMode = (searchParams.get('mode') || 'single') as 'single' | 'combine';
  const yearFilter = searchParams.get('year') || 'Todos';

  // Selected BAEs for combine mode (comma-separated "nro-ano" in URL)
  const selectedBaesParam = searchParams.get('selectedBaes') || '';

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [proyectos, setProyectos] = useState<Expediente[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBae, setCurrentBae] = useState<BaeRecord | null>(null);

  // All available BAEs for navigation
  const [allBaes, setAllBaes] = useState<BaeRecord[]>([]);
  const [baesLoaded, setBaesLoaded] = useState(false);

  // Reference data
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [comisionesList, setComisionesList] = useState<ComisionItem[]>([]);
  const [autoresList, setAutoresList] = useState<Array<{ legisladorId: number; nombre: string; apellido: string }>>([]);
  const [coautoresList, setCoautoresList] = useState<Array<{ legisladorId: number; nombre: string; apellido: string }>>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalResultados / PAGE_SIZE));

  // Get unique years from all BAEs
  const availableYears = useMemo(() => {
    const years = [...new Set(allBaes.map((b) => b.anoParlamentario))].sort((a, b) => b - a);
    return years;
  }, [allBaes]);

  // Filter BAEs by selected year
  const filteredBaes = useMemo(() => {
    if (yearFilter === 'Todos') return allBaes;
    return allBaes.filter((b) => b.anoParlamentario === Number(yearFilter));
  }, [allBaes, yearFilter]);

  // Parse selected BAEs for combine mode
  const selectedBaes = useMemo(() => {
    if (!selectedBaesParam) return [];
    return selectedBaesParam.split(',').map((ref) => {
      const [nro, ano] = ref.split('-').map(Number);
      return { nroOrden: nro, anoParlamentario: ano };
    }).filter((r) => !isNaN(r.nroOrden) && !isNaN(r.anoParlamentario));
  }, [selectedBaesParam]);

  // Helper to update search params
  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === 'Todos') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        if (key !== 'page') next.delete('page');
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

  const filtrosActivos = categoriaFiltro !== 'Todos' || comisionFiltro !== 'Todos' || bloqueFiltro !== 'Todos' || autorFiltro !== 'Todos' || coautorFiltro !== 'Todos' || busqueda.length > 0 || baeSourceOnly;

  // Find current index in the filtered BAE list
  const currentBaeIndex = filteredBaes.findIndex(
    (b) => b.nroOrden === currentNro && b.anoParlamentario === currentAno,
  );

  // Navigation: BAEs are sorted desc (newest first), so "prev" means older (higher index), "next" means newer (lower index)
  const canGoNewer = currentBaeIndex < filteredBaes.length - 1 && currentBaeIndex >= 0;
  const canGoOlder = currentBaeIndex > 0;

  const goToNewer = () => {
    if (!canGoNewer) return;
    const newer = filteredBaes[currentBaeIndex + 1];
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('nro', String(newer.nroOrden));
      next.set('ano', String(newer.anoParlamentario));
      next.delete('page');
      return next;
    });
  };

  const goToOlder = () => {
    if (!canGoOlder) return;
    const older = filteredBaes[currentBaeIndex - 1];
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('nro', String(older.nroOrden));
      next.set('ano', String(older.anoParlamentario));
      next.delete('page');
      return next;
    });
  };

  const goToLatest = () => {
    if (filteredBaes.length > 0) {
      const latest = filteredBaes[filteredBaes.length - 1];
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('nro', String(latest.nroOrden));
        next.set('ano', String(latest.anoParlamentario));
        next.delete('page');
        return next;
      });
    }
  };

  // Toggle a BAE in combine mode
  const toggleBaeSelection = (nroOrden: number, anoParlamentario: number) => {
    const key = `${nroOrden}-${anoParlamentario}`;
    const current = selectedBaesParam ? selectedBaesParam.split(',') : [];
    const idx = current.indexOf(key);
    let updated: string[];
    if (idx >= 0) {
      updated = current.filter((_, i) => i !== idx);
    } else {
      updated = [...current, key];
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (updated.length === 0) {
        next.delete('selectedBaes');
      } else {
        next.set('selectedBaes', updated.join(','));
      }
      next.delete('page');
      return next;
    });
  };

  const isBaeSelected = (nroOrden: number, anoParlamentario: number) => {
    const key = `${nroOrden}-${anoParlamentario}`;
    return selectedBaesParam.split(',').includes(key);
  };

  // Select all BAEs visible (in current year filter)
  const selectAllFilteredBaes = () => {
    const keys = filteredBaes.map((b) => `${b.nroOrden}-${b.anoParlamentario}`);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('selectedBaes', keys.join(','));
      next.delete('page');
      return next;
    });
  };

  const clearBaeSelection = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('selectedBaes');
      next.delete('page');
      return next;
    });
  };

  // Load all BAEs and reference data on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [baesData, bloquesData, comisionesData] = await Promise.all([
          getBaes(),
          getBloques(),
          getComisiones(),
        ]);

        setAllBaes(baesData?.reverse());
        setBloques(bloquesData);
        setComisionesList(comisionesData);
        setBaesLoaded(true);

        // If no BAE selected in URL, navigate to latest
        if (!searchParams.get('nro') && baesData.length > 0) {
          const latest = baesData[baesData?.length - 1];
          setSearchParams({
            nro: String(latest.nroOrden),
            ano: String(latest.anoParlamentario),
          }, { replace: true });
        }
      } catch (err) {
        console.error('Error loading BAE data:', err);
        setError('Error al cargar los datos de BAE.');
        setBaesLoaded(true);
      }
    }
    loadInitialData();
  }, []);

  // Dynamically load autores/coautores based on current BAE + filters
  useEffect(() => {
    if (!currentNro || !currentAno || !baesLoaded) return;
    async function loadAutoresCoautores() {
      try {
        const baseParams: Record<string, any> = {
          nroOrden: currentNro,
          anoParlamentario: currentAno,
        };
        if (categoriaFiltro !== 'Todos') baseParams.tipo = categoriaFiltro;
        if (comisionFiltro !== 'Todos') baseParams.comisionUrl = comisionFiltro;
        if (bloqueFiltro !== 'Todos') baseParams.bloqueId = Number(bloqueFiltro);

        const [autoresData, coautoresData] = await Promise.all([
          getDistinctAutores(baseParams),
          getDistinctCoautores(baseParams),
        ]);
        setAutoresList(autoresData);
        setCoautoresList(coautoresData);
      } catch (err) {
        console.error('Error loading autores/coautores:', err);
      }
    }
    loadAutoresCoautores();
  }, [currentNro, currentAno, categoriaFiltro, comisionFiltro, bloqueFiltro, baesLoaded]);

  // Fetch BAE expedientes when BAE selection or filters change
  useEffect(() => {
    const isSingleMode = baeMode === 'single';
    const isCombineMode = baeMode === 'combine';

    // In single mode, need currentNro and currentAno
    if (isSingleMode && (!currentNro || !currentAno || !baesLoaded)) return setLoading(false);
    // In combine mode, need at least one selected BAE
    if (isCombineMode && (selectedBaes.length === 0 || !baesLoaded)) return setLoading(false);

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { limit: PAGE_SIZE };
        if (busqueda) params.query = busqueda;
        if (categoriaFiltro !== 'Todos') params.tipo = categoriaFiltro;
        if (comisionFiltro !== 'Todos') params.comisionUrl = comisionFiltro;
        if (bloqueFiltro !== 'Todos') params.bloqueId = Number(bloqueFiltro);
        if (autorFiltro !== 'Todos') params.autorId = Number(autorFiltro);
        if (coautorFiltro !== 'Todos') params.coautorId = Number(coautorFiltro);
        if (searchMode === 'exact') params.searchMode = 'exact';
        if (baeSourceOnly) params.baeSourceOnly = true;
        params.skip = (currentPage - 1) * PAGE_SIZE;

        if (isCombineMode) {
          const result = await getCombinedBaesExpedientes(selectedBaes, params);
          if (!cancelled) {
            setProyectos(result.expedientes);
            setTotalResultados(result.total);
            setCurrentBae(null);
          }
        } else {
          const result = await getBaeWithExpedientes(currentNro, currentAno, params);
          if (!cancelled) {
            setProyectos(result.expedientes);
            setTotalResultados(result.total);
            setCurrentBae(result.bae);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching BAE expedientes:', err);
          setError('Error al cargar los expedientes del BAE.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [currentNro, currentAno, busqueda, categoriaFiltro, comisionFiltro, bloqueFiltro, autorFiltro, coautorFiltro, currentPage, baesLoaded, baeMode, selectedBaes, searchMode, baeSourceOnly]);

  const limpiarFiltros = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      // Preserve BAE navigation
      if (prev.get('nro')) next.set('nro', prev.get('nro')!);
      if (prev.get('ano')) next.set('ano', prev.get('ano')!);
      if (prev.get('mode')) next.set('mode', prev.get('mode')!);
      if (prev.get('year')) next.set('year', prev.get('year')!);
      if (prev.get('selectedBaes')) next.set('selectedBaes', prev.get('selectedBaes')!);
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setParam('page', String(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatBaeDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">BAE</Title>
          <p className="text-muted-foreground">
            Boletín de Asuntos Entrados — Navegá los expedientes por boletín
          </p>
        </motion.div>

        {/* BAE Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-4">
            {/* Mode toggle + Year filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                <button
                  onClick={() => setParam('mode', 'single')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    baeMode === 'single'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  BAE individual
                </button>
                <button
                  onClick={() => setParam('mode', 'combine')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    baeMode === 'combine'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Combinar BAEs
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-muted-foreground font-medium">Año:</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setParam('year', e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm font-medium focus:border-violet-500 outline-none"
                >
                  <option value="Todos">Todos</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {baeMode === 'single' ? (
              /* Single BAE navigation */
              <>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <button
                    onClick={goToOlder}
                    disabled={!canGoOlder}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">BAE anterior</span>
                  </button>

                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-violet-500" />
                      <p className="text-base sm:text-lg font-semibold">
                        BAE N° {currentNro} — {currentAno}
                      </p>
                    </div>
                    {currentBae && (
                      <p className="text-xs text-muted-foreground">
                        {formatBaeDate(currentBae.fechaDesdeDate)} — {formatBaeDate(currentBae.fechaHastaDate)}
                        {' · '}
                        {currentBae.totalItems} expedientes
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canGoNewer && currentBaeIndex !== 0 && (
                      <button
                        onClick={goToLatest}
                        className="px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-colors text-sm font-medium"
                      >
                        Último
                      </button>
                    )}
                    <button
                      onClick={goToNewer}
                      disabled={!canGoNewer}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">BAE siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick BAE selector */}
                {filteredBaes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Ir a:</span>
                      {filteredBaes.map((b) => (
                        <button
                          key={`${b.nroOrden}-${b.anoParlamentario}`}
                          onClick={() =>
                            setSearchParams((prev) => {
                              const next = new URLSearchParams(prev);
                              next.set('nro', String(b.nroOrden));
                              next.set('ano', String(b.anoParlamentario));
                              next.delete('page');
                              return next;
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                            b.nroOrden === currentNro && b.anoParlamentario === currentAno
                              ? 'bg-violet-600 text-white shadow-md'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {b.nroOrden}-{b.anoParlamentario}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Combine mode - multi-select */
              <>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-violet-500" />
                  <p className="text-base font-semibold">
                    Seleccioná los BAEs a combinar
                  </p>
                  <span className="text-xs text-muted-foreground">
                    ({selectedBaes.length} seleccionado{selectedBaes.length !== 1 ? 's' : ''})
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={selectAllFilteredBaes}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Seleccionar todos
                    </button>
                    {selectedBaes.length > 0 && (
                      <button
                        onClick={clearBaeSelection}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {filteredBaes.map((b) => {
                    const selected = isBaeSelected(b.nroOrden, b.anoParlamentario);
                    return (
                      <button
                        key={`${b.nroOrden}-${b.anoParlamentario}`}
                        onClick={() => toggleBaeSelection(b.nroOrden, b.anoParlamentario)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                          selected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                            : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                        }`}
                      >
                        {selected ? '✓ ' : ''}{b.nroOrden}-{b.anoParlamentario}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>
        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              {searchMode === 'exact' ? (
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="text"
                defaultValue={busqueda}
                key={searchMode}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={searchMode === 'exact' ? 'Buscar por número de expediente exacto (ej: 1234-J-2025)...' : 'Buscar por título, expediente, etiqueta...'}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all ${
                  searchMode === 'exact' ? 'border-amber-500/50' : 'border-border/50'
                }`}
              />
            </div>

            {/* Search mode toggle */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border/50 p-0.5">
              <button
                onClick={() => setParam('searchMode', 'text')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  searchMode === 'text'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title="Búsqueda por coincidencias de texto"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Coincidencias</span>
              </button>
              <button
                onClick={() => setParam('searchMode', 'exact')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  searchMode === 'exact'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title="Búsqueda exacta por número de expediente"
              >
                <Hash className="w-4 h-4" />
                <span className="hidden lg:inline">Nro. exacto</span>
              </button>
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

          {/* BAE Source-only toggle */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setParam('baeSourceOnly', baeSourceOnly ? '' : 'true')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                baeSourceOnly
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${baeSourceOnly ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
              Solo propios del BAE
            </button>
            {baeSourceOnly && (
              <span className="text-xs text-muted-foreground">
                Mostrando solo expedientes con la etiqueta BAE
              </span>
            )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    {/* Comisión */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Comisión</label>
                      <select
                        value={comisionFiltro}
                        onChange={(e) => setParam('comision', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todas las comisiones</option>
                        {comisionesList.map((c) => (
                          <option key={c.idComision} value={c.url}>{c.nombre}</option>
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

                    {/* Autor/a */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Autor/a</label>
                      <select
                        value={autorFiltro}
                        onChange={(e) => setParam('autor', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos</option>
                        {autoresList.map((l) => (
                          <option key={l.legisladorId} value={String(l.legisladorId)}>
                            {l.apellido}, {l.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Coautor/a */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Coautor/a</label>
                      <select
                        value={coautorFiltro}
                        onChange={(e) => setParam('coautor', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-violet-500 outline-none text-sm"
                      >
                        <option value="Todos">Todos</option>
                        {coautoresList.map((l) => (
                          <option key={l.legisladorId} value={String(l.legisladorId)}>
                            {l.apellido}, {l.nombre}
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

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalResultados} expediente{totalResultados !== 1 ? 's' : ''}
              {baeMode === 'combine'
                ? ` en ${selectedBaes.length} BAE${selectedBaes.length !== 1 ? 's' : ''} combinados`
                : ' en este BAE'}
            </span>
            {totalPages > 1 && (
              <span>
                Página {currentPage} de {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando expedientes del BAE...</p>
          </motion.div>
        )}

        {/* Error */}
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

        {/* No BAEs available */}
        {!loading && !error && allBaes.length === 0 && baesLoaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">
              No hay BAEs sincronizados aún
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Los BAEs se sincronizan automáticamente o pueden ser cargados por un administrador
            </p>
          </motion.div>
        )}

        {/* Results list */}
        {!loading && !error && (
          <>
            <div className="space-y-4">
              {proyectos?.map((proyecto, idx) => (
                <BaeCard key={proyecto.expedienteId} proyecto={proyecto} index={idx} />
              ))}

              {proyectos?.length === 0 && (allBaes.length > 0 || baeMode === 'combine') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">
                    {baeMode === 'combine' && selectedBaes.length === 0
                      ? 'Seleccioná al menos un BAE para ver sus expedientes'
                      : baeMode === 'combine'
                      ? `No se encontraron expedientes en los BAEs seleccionados${filtrosActivos ? ' con los filtros seleccionados' : ''}`
                      : `No se encontraron expedientes en el BAE N° ${currentNro} — ${currentAno}${filtrosActivos ? ' con los filtros seleccionados' : ''}`
                    }
                  </p>
                  {filtrosActivos && (
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
