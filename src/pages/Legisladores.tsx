import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, User, Calendar, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { getLegisladores, getLegisladoresInactivos, getBloquesWithCounts } from '../services/legislatura.service';
import type { Legislador, Bloque } from '../types/legislatura.types';

function LegisladorCard({ legislador, index }: { legislador: Legislador; index: number }) {
  const iniciales = `${legislador.nombre[0]}${legislador.apellido[0]}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="p-6">
        <Link to={`/legisladores/${legislador.legisladorId}`}>
          <div className="flex items-start gap-4 cursor-pointer group">
            {/* Avatar */}
            {legislador.fotoM ? (
              <img
                src={legislador.fotoM}
                alt={`${legislador.nombre} ${legislador.apellido}`}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0"
                style={{ backgroundColor: legislador.bloqueColor || '#7c3aed' }}
              >
                {iniciales}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Name & Bloque */}
              <h3 className="text-lg font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {legislador.nombre} {legislador.apellido}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: "#" + (legislador.bloqueColor || '7c3aed') }}
                >
                  {legislador.bloque}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {legislador.fecha_inicio_mandato && legislador.fecha_fin_mandato && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Mandato {new Date(legislador.fecha_inicio_mandato).getFullYear()}-{new Date(legislador.fecha_fin_mandato).getFullYear()}</span>
                  </div>
                )}
                {legislador.cargoRecinto && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{legislador.cargoRecinto}</span>
                  </div>
                )}
              </div>

              {/* Comisiones (if available) */}
              {legislador.comisiones && legislador.comisiones.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {legislador.comisiones.map((com) => (
                    <span key={com.comisionId} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      {com.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export function Legisladores() {
  const [searchParams] = useSearchParams();
  const bloqueFromQuery = searchParams.get('bloque');

  const [legisladores, setLegisladores] = useState<Legislador[]>([]);
  const [inactivos, setInactivos] = useState<Legislador[]>([]);
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [bloqueFiltro, setBloqueFiltro] = useState<string>(bloqueFromQuery || 'Todos');
  const [showInactivos, setShowInactivos] = useState(false);

  // Sync with query param on mount
  useEffect(() => {
    if (bloqueFromQuery) {
      setBloqueFiltro(bloqueFromQuery);
    }
  }, [bloqueFromQuery]);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [legsData, bloquesData, inactivosData] = await Promise.all([
          getLegisladores(),
          getBloquesWithCounts(),
          getLegisladoresInactivos(),
        ]);
        setLegisladores(legsData);
        setBloques(bloquesData);
        setInactivos(inactivosData);
      } catch (err) {
        console.error('Error fetching legisladores:', err);
        setError('Error al cargar los datos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const bloqueActivo = bloques.find((b) => String(b.bloqueId) === bloqueFiltro);

  const filtrados = useMemo(() => {
    return legisladores.filter((l) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchNombre = `${l.nombre} ${l.apellido}`.toLowerCase().includes(q);
        const matchBloque = l.bloque.toLowerCase().includes(q);
        if (!matchNombre && !matchBloque) return false;
      }
      if (bloqueFiltro !== 'Todos' && String(l.bloqueId) !== bloqueFiltro) return false;
      return true;
    });
  }, [busqueda, bloqueFiltro, legisladores]);

  const filtradosInactivos = useMemo(() => {
    return inactivos.filter((l) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchNombre = `${l.nombre} ${l.apellido}`.toLowerCase().includes(q);
        if (!matchNombre) return false;
      }
      return true;
    });
  }, [busqueda, inactivos]);

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">
            {bloqueActivo ? `Legisladores - ${bloqueActivo.nombre}` : 'Legisladores'}
          </Title>
          <p className="text-muted-foreground">
            {bloqueActivo
              ? `Legisladores del bloque ${bloqueActivo.nombre} en la Legislatura de CABA`
              : 'Directorio de legisladores de la Ciudad Autónoma de Buenos Aires'
            }
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm"
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-3 underline hover:no-underline"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
            <p className="text-muted-foreground">Cargando legisladores...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Bloque stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
            >
              {bloques.map((b, i) => (
                <motion.div
                  key={b.bloqueId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setBloqueFiltro(bloqueFiltro === String(b.bloqueId) ? 'Todos' : String(b.bloqueId))}
                  className={`cursor-pointer p-3 rounded-xl border transition-all ${
                    bloqueFiltro === String(b.bloqueId)
                      ? 'border-violet-500/50 bg-violet-500/10 shadow-md'
                      : 'border-border/50 bg-background/80 hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-xs font-semibold truncate">{b.nombre}</span>
                  </div>
                  <div className="text-lg font-bold">{b.cantidad}</div>
                  <div className="text-xs text-muted-foreground truncate">{b.nombre}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o bloque..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
              />
            </div>

            {/* Results */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filtrados.length} legislador{filtrados.length !== 1 ? 'es' : ''}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtrados.map((leg, idx) => (
                <LegisladorCard key={leg.legisladorId} legislador={leg} index={idx} />
              ))}
            </div>

            {filtrados.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground">No se encontraron legisladores</p>
              </motion.div>
            )}

            {/* Inactive legislators section */}
            {inactivos.length > 0 && (
              <div className="mt-12">
                <button
                  onClick={() => setShowInactivos(!showInactivos)}
                  className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  {showInactivos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  Legisladores con mandato no activo ({filtradosInactivos.length})
                </button>

                {showInactivos && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-75">
                      {filtradosInactivos.map((leg, idx) => (
                        <LegisladorCard key={leg.legisladorId} legislador={leg} index={idx} />
                      ))}
                    </div>
                    {filtradosInactivos.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4">No se encontraron legisladores inactivos con ese criterio de búsqueda.</p>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
