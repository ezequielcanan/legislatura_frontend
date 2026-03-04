import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, User, Building2, Mail, Calendar, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { legisladores, partidos, proyectos } from '../data/mockData';
import type { Legislador } from '../types/legislatura.types';

function getProyectosLegislador(legId: string) {
  return proyectos.filter(
    (p) => p.autores.some((a) => a.id === legId) || p.coautores.some((a) => a.id === legId)
  );
}

function LegisladorCard({ legislador, index }: { legislador: Legislador; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const misProyectos = getProyectosLegislador(legislador.id);
  const iniciales = `${legislador.nombre[0]}${legislador.apellido[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="p-6">
        <Link to={`/legisladores/${legislador.id}`}>
          <div className="flex items-start gap-4 cursor-pointer group">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0"
              style={{ backgroundColor: legislador.partido.color }}
            >
              {iniciales}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name & Party */}
              <h3 className="text-lg font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {legislador.nombre} {legislador.apellido}
              </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: legislador.partido.color }}
              >
                {legislador.partido.sigla}
              </span>
              <span className="text-sm text-muted-foreground">{legislador.bloque}</span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>{misProyectos.length} proyectos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{legislador.comisiones.length} comisiones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Mandato {new Date(legislador.mandatoInicio).getFullYear()}-{new Date(legislador.mandatoFin).getFullYear()}</span>
              </div>
            </div>

            {/* Comisiones */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {legislador.comisiones.map((com) => (
                <span key={com} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {com}
                </span>
              ))}
            </div>

            {legislador.email && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span>{legislador.email}</span>
              </div>
            )}
          </div>
        </div>
        </Link>

        {/* Projects toggle */}
        {misProyectos.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Ocultar proyectos' : `Ver ${misProyectos.length} proyecto${misProyectos.length !== 1 ? 's' : ''}`}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 space-y-2"
              >
                {misProyectos.map((p) => (
                  <Link key={p.id} to={`/proyectos/${p.id}`}>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-sm hover:bg-violet-500/5 hover:border-violet-500/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{p.expediente}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.autores.some((a) => a.id === legislador.id)
                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {p.autores.some((a) => a.id === legislador.id) ? 'Autor' : 'Coautor'}
                        </span>
                      </div>
                      <p className="font-medium leading-tight">{p.titulo}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export function Legisladores() {
  const [searchParams] = useSearchParams();
  const partidoFromQuery = searchParams.get('partido');
  const [busqueda, setBusqueda] = useState('');
  const [partidoFiltro, setPartidoFiltro] = useState<string>(partidoFromQuery || 'Todos');

  // Sync with query param on mount
  useEffect(() => {
    if (partidoFromQuery) {
      setPartidoFiltro(partidoFromQuery);
    }
  }, [partidoFromQuery]);

  const partidoActivo = partidos.find(p => p.id === partidoFiltro);

  const filtrados = useMemo(() => {
    return legisladores.filter((l) => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchNombre = `${l.nombre} ${l.apellido}`.toLowerCase().includes(q);
        const matchBloque = l.bloque.toLowerCase().includes(q);
        const matchComision = l.comisiones.some((c) => c.toLowerCase().includes(q));
        if (!matchNombre && !matchBloque && !matchComision) return false;
      }
      if (partidoFiltro !== 'Todos' && l.partidoId !== partidoFiltro) return false;
      return true;
    });
  }, [busqueda, partidoFiltro]);

  return (
    <Container>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Title fontSize="text-3xl" style="mb-2">
            {partidoActivo ? `Legisladores - ${partidoActivo.nombre}` : 'Legisladores'}
          </Title>
          <p className="text-muted-foreground">
            {partidoActivo
              ? `Legisladores del bloque ${partidoActivo.nombre} en la Legislatura de CABA`
              : 'Directorio de legisladores de la Ciudad Autónoma de Buenos Aires'
            }
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {partidos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setPartidoFiltro(partidoFiltro === p.id ? 'Todos' : p.id)}
              className={`cursor-pointer p-3 rounded-xl border transition-all ${
                partidoFiltro === p.id
                  ? 'border-violet-500/50 bg-violet-500/10 shadow-md'
                  : 'border-border/50 bg-background/80 hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-semibold">{p.sigla}</span>
              </div>
              <div className="text-lg font-bold">{p.cantidadLegisladores}</div>
              <div className="text-xs text-muted-foreground truncate">{p.nombre}</div>
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
            placeholder="Buscar por nombre, bloque o comisión..."
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
            <LegisladorCard key={leg.id} legislador={leg} index={idx} />
          ))}
        </div>

        {filtrados.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">No se encontraron legisladores</p>
          </motion.div>
        )}
      </div>
    </Container>
  );
}
