import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText, Users, Building2, MessageSquare, Sparkles, Calendar, TrendingUp, ArrowRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import Title from '../components/layout/Title';
import Container from '../components/containers/Container';
import { getStats, getExpedientesGrouped } from '../services/legislatura.service';
import type { LegislaturaStats, FechaProyectos } from '../types/legislatura.types';

export function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LegislaturaStats | null>(null);
  const [ultimosProyectos, setUltimosProyectos] = useState<FechaProyectos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, grouped] = await Promise.all([
          getStats().catch(() => null),
          getExpedientesGrouped(7).catch(() => []),
        ]);
        setStats(statsData);
        if (grouped.length > 0) setUltimosProyectos(grouped[0]);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Proyectos de Ley',
      description: 'Explorá los proyectos ordenados por fecha con resúmenes generados por IA',
      gradient: 'from-violet-700 via-violet-600 to-purple-600',
      path: '/proyectos',
    },
    {
      icon: Users,
      title: 'Legisladores',
      description: 'Consultá el directorio completo de legisladores y sus proyectos',
      gradient: 'from-violet-700 via-violet-600 to-purple-600',
      path: '/legisladores',
    },
    {
      icon: Building2,
      title: 'Partidos Políticos',
      description: 'Conocé la composición política y actividad legislativa por partido',
      gradient: 'from-violet-700 via-violet-600 to-purple-600',
      path: '/partidos',
    },
    {
      icon: MessageSquare,
      title: 'Consultas IA',
      description: 'Hacé preguntas sobre proyectos de ley y obtené respuestas inteligentes',
      gradient: 'from-violet-700 via-violet-600 to-purple-600',
      path: '/consultas',
    },
  ];

  const statsCards = [
    { label: 'Proyectos', value: stats?.totalExpedientes ?? 0, icon: FileText, gradient: 'from-violet-600 to-purple-600' },
    { label: 'Legisladores', value: stats?.totalLegisladores ?? 0, icon: Users, gradient: 'from-blue-600 to-cyan-600' },
    { label: 'Bloques', value: stats?.totalBloques ?? 0, icon: Building2, gradient: 'from-fuchsia-600 to-pink-600' },
  ];

  return (
    <Container>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium">Powered by AI</span>
          </motion.div>

          <Title fontSize={"text-5xl"} style={"mb-6"}>
            Legislatura CABA
          </Title>
          <p className="text-xl text-foreground/70 dark:text-muted-foreground max-w-2xl mx-auto">
            Analizá los proyectos de ley de la Legislatura de la Ciudad Autónoma de Buenos Aires con inteligencia artificial
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-background/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(feature.path)}
              className="group cursor-pointer bg-background/80 backdrop-blur-lg rounded-3xl p-7 border border-border/50 shadow-medium hover:shadow-strong transition-all relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-all`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>

              <div className="flex items-center text-sm font-medium">
                <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  Explorar
                </span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`ml-2 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Latest Projects Preview */}
        {ultimosProyectos && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="bg-background/80 backdrop-blur-lg rounded-3xl border border-border/50 shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Últimos Proyectos</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ultimosProyectos.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/proyectos')}
                className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {ultimosProyectos.proyectos.slice(0, 3).map((p) => (
                <div key={p.expedienteId} className="p-4 bg-muted/20 rounded-2xl border border-border/30 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-muted-foreground">{p.numero}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      {p.tipo}
                    </span>
                  </div>
                  <h4 className="font-medium mb-2">{p.titulo}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span className="line-clamp-1">{(p.aiSummary || p.sumario || '').slice(0, 120)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Container>
  );
}
