// ===== Enums =====

export type CategoriaProyecto =
  | 'Ley'
  | 'Resolución'
  | 'Declaración'
  | 'Decreto'
  | 'Comunicación'
  | 'Pedido de Informes';

export type EstadoProyecto =
  | 'Ingresado'
  | 'En Comisión'
  | 'Aprobado en Comisión'
  | 'Media Sanción'
  | 'Aprobado'
  | 'Rechazado'
  | 'Archivado'
  | 'Retirado';

// ===== Interfaces =====

export interface Partido {
  id: string;
  nombre: string;
  sigla: string;
  color: string; // hex color for UI
  logo?: string;
  descripcion: string;
  fundado: number;
  cantidadLegisladores: number;
}

export interface Legislador {
  id: string;
  nombre: string;
  apellido: string;
  foto: string;
  partidoId: string;
  partido: Partido;
  bloque: string;
  email?: string;
  despacho: string;
  fechaNacimiento: string; // ISO date
  mandatoInicio: string; // ISO date
  mandatoFin: string; // ISO date
  comisiones: string[];
  proyectosPresentados: number;
}

export interface ProyectoLey {
  id: string;
  expediente: string; // e.g. "0001-D-2026"
  titulo: string;
  sumario: string;
  resumenIA: string; // AI-generated summary
  textoCompleto: string;
  categoria: CategoriaProyecto;
  estado: EstadoProyecto;
  fechaIngreso: string; // ISO date
  fechaUltimaModificacion: string;
  autores: Legislador[];
  coautores: Legislador[];
  adherentes: Legislador[];
  partidosInvolucrados: Partido[];
  comisiones: string[];
  giros: string[];
  ubicacion: string;
  origen: string;
  proyectoDe: string;
  etiquetas: string[];
}

export interface FechaProyectos {
  fecha: string; // ISO date
  proyectos: ProyectoLey[];
  totalProyectos: number;
}

// ===== Filters =====

export interface FiltrosProyecto {
  busqueda: string;
  categoria: CategoriaProyecto | 'Todas';
  estado: EstadoProyecto | 'Todos';
  partidoId: string | 'Todos';
  legisladorId: string | 'Todos';
  fechaDesde: string;
  fechaHasta: string;
}

// ===== Chat =====

export interface MensajeChat {
  id: string;
  rol: 'usuario' | 'asistente';
  contenido: string;
  timestamp: string;
  proyectosReferenciados?: ProyectoLey[];
}

export interface ConversacionChat {
  id: string;
  mensajes: MensajeChat[];
  fechaContextoDesde: string;
  fechaContextoHasta: string;
}
