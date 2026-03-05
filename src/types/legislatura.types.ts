// ===== Backend-aligned types for Legislatura CABA =====

// ===== Bloques (Parties) =====

export interface Bloque {
  _id: string;
  bloqueId: number;
  nombre: string;
  url: string;
  logo: string;
  logoS: string;
  logoM: string;
  cantidad: number;
  color: string;
  percent: number;
}

// ===== Legisladores =====

export interface Comision {
  comisionId: number;
  nombre: string;
  cargo: string;
}

export interface Legislador {
  _id: string;
  legisladorId: number;
  apellido: string;
  nombre: string;
  urlLegislador: string;
  sexo: string;
  bloque: string;
  urlBloque: string;
  bloqueId: number;
  bloqueColor: string;
  bloque_color: string;
  foto: string;
  fotoS: string;
  fotoM: string;
  bloqueLogo: string;
  bloqueLogoS: string;
  bloqueLogoM: string;
  idAutor: number;
  fecha_inicio_mandato: string;
  fecha_fin_mandato: string;
  cargoRecinto: string;
  idCargoRecinto: number;
  fecha_nacimiento: string;
  telefono: string;
  oficina: string;
  comisiones?: Comision[];
}

// ===== Expedientes (Projects) =====

export type ExpedienteStatus = 'pending' | 'downloading' | 'summarizing' | 'embedding' | 'completed' | 'failed';

export type CategoriaProyecto = string;
export type EstadoProyecto = string;

export interface ExpedienteAutor {
  legisladorId: number;
  nombre: string;
  apellido: string;
}

export interface LibroExpediente {
  idDoc: number;
  nombre: string;
  url: string;
  tipo: string;
}

export interface Expediente {
  _id: string;
  expedienteId: number;
  numero: string;
  titulo: string;
  sumario: string;
  tipo: string;
  tipoId: number;
  estado: string;
  estadoId: number;
  ubicacion: string;
  ubicacionId: number;
  fechaIngreso: string;
  fechaIngresoDate: string;
  anioParlamentario: string;
  autor: ExpedienteAutor;
  coautores: ExpedienteAutor[];
  pdfText?: string;
  aiSummary?: string;
  aiTags?: string[];
  aiCategory?: string;
  libros?: LibroExpediente[];
  votaciones?: any;
  status: ExpedienteStatus;
  embeddingCount?: number;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Search & Filters =====

export interface SearchExpedientesParams {
  query?: string;
  tipo?: string;
  estado?: string;
  bloqueId?: number;
  legisladorId?: number;
  tag?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  skip?: number;
}

export interface FechaProyectos {
  fecha: string;
  proyectos: Expediente[];
  totalProyectos: number;
}

// ===== Stats =====

export interface LegislaturaStats {
  totalExpedientes: number;
  completedExpedientes: number;
  failedExpedientes: number;
  pendingExpedientes: number;
  totalLegisladores: number;
  totalBloques: number;
  totalEmbeddings: number;
}

// ===== Chat =====

export interface MensajeChat {
  id: string;
  rol: 'usuario' | 'asistente';
  contenido: string;
  timestamp: string;
  expedientesReferenciados?: Expediente[];
}

export interface ConversacionChat {
  id: string;
  mensajes: MensajeChat[];
}

// ===== API Responses =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
