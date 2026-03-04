import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Users, FileText, ChevronDown, ChevronUp, Building2, ArrowRight, Loader2,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { getBloquesWithCounts, getLegisladores } from '../services/legislatura.service';
import type { Bloque, Legislador } from '../types/legislatura.types';

function BloqueCard({ bloque, legisladoresBloque, index }: { bloque: Bloque; legisladoresBloque: Legislador[]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ backgroundColor: bloque.color || '#8b5cf6' }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {bloque.logoM ? (
            <img src={bloque.logoM} alt={bloque.nombre} className="w-14 h-14 rounded-2xl object-cover shadow-lg shrink-0" />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0"
              style={{ backgroundColor: bloque.color || '#8b5cf6' }}
            >
              {bloque.nombre.slice(0, 3).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{bloque.nombre}</h3>
            <p className="text-sm text-muted-foreground mt-1">{bloque.percent?.toFixed(1)}% de la legislatura</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div
            className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center cursor-pointer hover:bg-violet-500/5 hover:border-violet-500/20 transition-all"
            onClick={() => navigate(`/legisladores?bloque=${bloque.bloqueId}`)}
          >
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-bold">{bloque?.total}</div>
            <div className="text-xs text-muted-foreground">Legisladores</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-bold">{bloque.percent?.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Composición</div>
          </div>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors py-2 rounded-xl hover:bg-violet-500/5"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Ocultar legisladores' : 'Ver legisladores'}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                {legisladoresBloque.map((l) => (
                  <Link key={l.legisladorId} to={`/legisladores/${l.legisladorId}`}>
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                      {l.fotoM ? (
                        <img src={l.fotoM} alt={`${l.nombre} ${l.apellido}`} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: bloque.color || '#8b5cf6' }}
                        >
                          {l.nombre[0]}{l.apellido[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{l.nombre} {l.apellido}</div>
                        <div className="text-xs text-muted-foreground">{l.cargoRecinto || 'Legislador/a'}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {legisladoresBloque.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay legisladores registrados</p>
                )}
                <button
                  onClick={() => navigate(`/legisladores?bloque=${bloque.bloqueId}`)}
                  className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 py-2 rounded-xl hover:bg-violet-500/5 transition-colors"
                >
                  Ver todos los legisladores del bloque
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Partidos() {
  const [busqueda, setBusqueda] = useState('');
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [legisladoresList, setLegisladoresList] = useState<Legislador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bloquesData, legisladoresData] = await Promise.all([
          getBloquesWithCounts(),
          getLegisladores(),
        ]);
        setBloques(bloquesData);
        setLegisladoresList(legisladoresData);
      } catch (err) {
        console.error('Error loading bloques:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtrados = bloques.filter((b) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return b.nombre.toLowerCase().includes(q);
  });

  const totalLegisladores = bloques.reduce((acc, b) => acc + (b.total || 0), 0);

  if (loading) {
    return (
      <Container>
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="ml-3 text-muted-foreground">Cargando bloques...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">Bloques Políticos</Title>
          <p className="text-muted-foreground">
            Bloques con representación en la Legislatura de CABA
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{bloques.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Bloques</p>
          </div>
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{totalLegisladores}</span>
            </div>
            <p className="text-sm text-muted-foreground">Legisladores Totales</p>
          </div>
        </motion.div>

        {/* Composición visual */}
        {bloques.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-5"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Composición de la Legislatura</h3>
            <div className="flex rounded-xl overflow-hidden h-8">
              {bloques.map((b) => (
                <div
                  key={b.bloqueId}
                  className="relative group transition-all hover:opacity-90"
                  style={{
                    backgroundColor: b.color || '#8b5cf6',
                    width: `${b.percent || 0}%`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow-sm hidden sm:block truncate px-1">
                      {b.nombre.length > 8 ? b.nombre.slice(0, 8) + '…' : b.nombre}
                    </span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-lg shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border/50">
                    {b.nombre}: {b.total} legisladores
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {bloques.map((b) => (
                <div key={b.bloqueId} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color || '#8b5cf6' }} />
                  {b.nombre} ({b.total})
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar bloque..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        {/* Bloque Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtrados.map((bloque, idx) => (
            <BloqueCard
              key={bloque.bloqueId}
              bloque={bloque}
              legisladoresBloque={legisladoresList.filter((l) => l.bloqueId === bloque.bloqueId)}
              index={idx}
            />
          ))}
        </div>

        {filtrados.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">No se encontraron bloques</p>
          </motion.div>
        )}
      </div>
    </Container>
  );
}
