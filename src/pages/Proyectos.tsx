import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, FileText,
  Tag, Users, ChevronDown, ChevronUp, X, Sparkles, Loader2,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { searchExpedientes, getBloques, getLegisladores } from '../services/legislatura.service';
import type { Expediente, Bloque, Legislador } from '../types/legislatura.types';

const categorias = [
  'Todos', 'Proyecto de Ley', 'Proyecto de Resolución', 'Proyecto de Declaración', 'Proyecto de Comunicación', 'Pedido de Informes',
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
  'Proyecto de Ley': '📜',
  'Proyecto de Resolución': '📋',
  'Proyecto de Declaración': '📢',
  'Proyecto de Comunicación': '📨',
  'Pedido de Informes': '🔍',
};

function ProyectoCard({ proyecto, index }: { proyecto: Expediente; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const resumen = proyecto.aiSummary || proyecto.sumario;
  const tags = proyecto.aiTags || [];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
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
        {proyecto?.autores?.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Autor{proyecto?.autores?.length > 1 ? 'es' : ''}:</span>
              {proyecto?.autores?.map((a) => (
                <Link key={a.legisladorId} to={`/legisladores/${a.legisladorId}`} className="font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {a.nombre} {a.apellido}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle for sumario when aiSummary exists */}
        {proyecto.aiSummary && proyecto.sumario && (
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
        )}
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

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [proyectos, setProyectos] = useState<Expediente[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [legisladoresList, setLegisladoresList] = useState<Legislador[]>([]);

  // Debounce timer for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        return next;
      });
    },
    [setSearchParams],
  );

  const setBusqueda = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setParam('q', value), 400);
      // Immediately update the input via a local override isn't needed since we read from searchParams
      // But we need the input to feel responsive, so we set it immediately:
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!value) next.delete('q');
        else next.set('q', value);
        return next;
      });
    },
    [setParam, setSearchParams],
  );

  const filtrosActivos = categoriaFiltro !== 'Todos' || estadoFiltro !== 'Todos' || bloqueFiltro !== 'Todos' || legisladorFiltro !== 'Todos' || busqueda.length > 0;

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
        const params: Record<string, any> = { limit: 50 };
        if (busqueda) params.query = busqueda;
        if (categoriaFiltro !== 'Todos') params.tipo = categoriaFiltro;
        if (estadoFiltro !== 'Todos') params.estado = estadoFiltro;
        if (bloqueFiltro !== 'Todos') params.bloqueId = Number(bloqueFiltro);
        if (legisladorFiltro !== 'Todos') params.legisladorId = Number(legisladorFiltro);

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
  }, [busqueda, categoriaFiltro, estadoFiltro, bloqueFiltro, legisladorFiltro]);

  const limpiarFiltros = () => {
    setSearchParams({});
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

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-muted-foreground">
            {totalResultados} proyecto{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
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
          <div className="space-y-4">
            {proyectos?.map((proyecto, idx) => (
              <ProyectoCard key={proyecto.expedienteId} proyecto={proyecto} index={idx} />
            ))}

            {proyectos?.length === 0 && (
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
        )}
      </div>
    </Container>
  );
}
