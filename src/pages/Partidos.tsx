import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Users, FileText, Calendar, ChevronDown, ChevronUp, Building2, ArrowRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { partidos, legisladores, proyectos } from '../data/mockData';
import type { Partido } from '../types/legislatura.types';

function getProyectosPartido(partidoId: string) {
  return proyectos.filter((p) =>
    p.partidosInvolucrados.some((pp) => pp.id === partidoId)
  );
}

function getLegisladoresPartido(partidoId: string) {
  return legisladores.filter((l) => l.partidoId === partidoId);
}

function PartidoCard({ partido, index }: { partido: Partido; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'legisladores' | 'proyectos'>('legisladores');
  const navigate = useNavigate();
  const miembros = getLegisladoresPartido(partido.id);
  const misProyectos = getProyectosPartido(partido.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      {/* Color bar */}
      <div className="h-1.5" style={{ backgroundColor: partido.color }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0"
            style={{ backgroundColor: partido.color }}
          >
            {partido.sigla}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{partido.nombre}</h3>
            <p className="text-sm text-muted-foreground mt-1">{partido.descripcion}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div
            className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center cursor-pointer hover:bg-violet-500/5 hover:border-violet-500/20 transition-all"
            onClick={() => navigate(`/legisladores?partido=${partido.id}`)}
          >
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-bold">{partido.cantidadLegisladores}</div>
            <div className="text-xs text-muted-foreground">Legisladores</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-bold">{misProyectos.length}</div>
            <div className="text-xs text-muted-foreground">Proyectos</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-bold">{partido.fundado}</div>
            <div className="text-xs text-muted-foreground">Fundado</div>
          </div>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors py-2 rounded-xl hover:bg-violet-500/5"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex gap-2 mt-3 mb-4">
                <button
                  onClick={() => setTab('legisladores')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === 'legisladores'
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1.5" />
                  Legisladores ({miembros.length})
                </button>
                <button
                  onClick={() => setTab('proyectos')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === 'proyectos'
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Proyectos ({misProyectos.length})
                </button>
              </div>

              {tab === 'legisladores' && (
                <div className="space-y-2">
                  {miembros.map((l) => (
                    <Link key={l.id} to={`/legisladores/${l.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: partido.color }}
                        >
                          {l.nombre[0]}{l.apellido[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{l.nombre} {l.apellido}</div>
                          <div className="text-xs text-muted-foreground">{l.bloque} · {l.comisiones.join(', ')}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{getProyectosPartidoLeg(l.id)} proy.</div>
                      </div>
                    </Link>
                  ))}
                  {miembros.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay legisladores registrados</p>
                  )}
                  <button
                    onClick={() => navigate(`/legisladores?partido=${partido.id}`)}
                    className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 py-2 rounded-xl hover:bg-violet-500/5 transition-colors"
                  >
                    Ver todos los legisladores del partido
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {tab === 'proyectos' && (
                <div className="space-y-2">
                  {misProyectos.map((p) => (
                    <Link key={p.id} to={`/proyectos/${p.id}`}>
                      <div className="p-3 bg-muted/20 rounded-xl border border-border/30 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{p.expediente}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            {p.categoria}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-tight">{p.titulo}</p>
                      </div>
                    </Link>
                  ))}
                  {misProyectos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay proyectos registrados</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function getProyectosPartidoLeg(legId: string) {
  return proyectos.filter(
    (p) => p.autores.some((a) => a.id === legId) || p.coautores.some((a) => a.id === legId)
  ).length;
}

export function Partidos() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = partidos.filter((p) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.sigla.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q)
    );
  });

  // Global stats
  const totalLegisladores = partidos.reduce((acc, p) => acc + p.cantidadLegisladores, 0);
  const totalProyectos = proyectos.length;

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">Partidos Políticos</Title>
          <p className="text-muted-foreground">
            Bloques y partidos con representación en la Legislatura de CABA
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{partidos.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Partidos/Bloques</p>
          </div>
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{totalLegisladores}</span>
            </div>
            <p className="text-sm text-muted-foreground">Legisladores Totales</p>
          </div>
          <div className="p-5 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-violet-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{totalProyectos}</span>
            </div>
            <p className="text-sm text-muted-foreground">Proyectos Totales</p>
          </div>
        </motion.div>

        {/* Composición visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-5"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Composición de la Legislatura</h3>
          <div className="flex rounded-xl overflow-hidden h-8">
            {partidos.map((p) => (
              <div
                key={p.id}
                className="relative group transition-all hover:opacity-90"
                style={{
                  backgroundColor: p.color,
                  width: `${(p.cantidadLegisladores / totalLegisladores) * 100}%`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold drop-shadow-sm hidden sm:block">
                    {p.sigla}
                  </span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-lg shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border/50">
                  {p.nombre}: {p.cantidadLegisladores} legisladores
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {partidos.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.sigla} ({p.cantidadLegisladores})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar partido..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 backdrop-blur-lg border border-border/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        {/* Party Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtrados.map((partido, idx) => (
            <PartidoCard key={partido.id} partido={partido} index={idx} />
          ))}
        </div>

        {filtrados.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">No se encontraron partidos</p>
          </motion.div>
        )}
      </div>
    </Container>
  );
}
