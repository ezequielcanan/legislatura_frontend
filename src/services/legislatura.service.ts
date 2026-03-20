import { axiosInstance } from '../config/axios.config';
import type {
  Bloque,
  Legislador,
  Expediente,
  SearchExpedientesParams,
  FechaProyectos,
  LegislaturaStats,
  ComisionItem,
  BaeRecord,
  ApiResponse,
} from '../types/legislatura.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Bloques ─────────────────────────────────────

export async function getBloques(): Promise<Bloque[]> {
  const { data } = await axiosInstance.get<ApiResponse<Bloque[]>>('/legislatura/bloques');
  return data.data;
}

export async function getBloquesWithCounts(): Promise<Bloque[]> {
  const { data } = await axiosInstance.get<ApiResponse<Bloque[]>>('/legislatura/bloques/counts');
  return data.data;
}

// ─── Legisladores ────────────────────────────────

export async function getLegisladores(bloqueId?: number): Promise<Legislador[]> {
  const params = bloqueId ? { bloqueId } : {};
  const { data } = await axiosInstance.get<ApiResponse<Legislador[]>>('/legislatura/legisladores', { params });
  return data.data;
}

export async function getLegisladoresInactivos(): Promise<Legislador[]> {
  const { data } = await axiosInstance.get<ApiResponse<Legislador[]>>('/legislatura/legisladores/inactivos');
  return data.data;
}

export async function getLegisladorById(id: number): Promise<Legislador> {
  const { data } = await axiosInstance.get<ApiResponse<Legislador>>(`/legislatura/legisladores/${id}`);
  return data.data;
}

// ─── Expedientes ─────────────────────────────────

export async function getComisiones(): Promise<ComisionItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<ComisionItem[]>>('/legislatura/comisiones');
  return data.data;
}

export async function getDistinctAutores(
  params: SearchExpedientesParams = {},
): Promise<Array<{ legisladorId: number; nombre: string; apellido: string }>> {
  const { data } = await axiosInstance.get<ApiResponse<Array<{ legisladorId: number; nombre: string; apellido: string }>>>(
    '/legislatura/expedientes/autores',
    { params },
  );
  return data.data;
}

export async function getDistinctCoautores(
  params: SearchExpedientesParams = {},
): Promise<Array<{ legisladorId: number; nombre: string; apellido: string }>> {
  const { data } = await axiosInstance.get<ApiResponse<Array<{ legisladorId: number; nombre: string; apellido: string }>>>(
    '/legislatura/expedientes/coautores',
    { params },
  );
  return data.data;
}

export async function searchExpedientes(
  params: SearchExpedientesParams = {},
): Promise<{ data: Expediente[]; total: number }> {
  const { data } = await axiosInstance.get('/legislatura/expedientes', { params });
  return { data: data.expedientes, total: data.total };
}

export async function getExpedienteById(id: number): Promise<Expediente> {
  const { data } = await axiosInstance.get<ApiResponse<Expediente>>(`/legislatura/expedientes/${id}`);
  return data.data;
}

export async function getExpedientesGrouped(days: number = 30): Promise<FechaProyectos[]> {
  const { data } = await axiosInstance.get<ApiResponse<FechaProyectos[]>>('/legislatura/expedientes/grouped', {
    params: { days },
  });
  return data.data;
}

export async function getExpedientesByLegislador(legisladorId: number): Promise<Expediente[]> {
  const { data } = await axiosInstance.get<ApiResponse<Expediente[]>>(
    `/legislatura/legisladores/${legisladorId}/expedientes`,
  );
  return data.data;
}

// ─── Stats ───────────────────────────────────────

export async function getStats(): Promise<LegislaturaStats> {
  const { data } = await axiosInstance.get<ApiResponse<LegislaturaStats>>('/legislatura/stats');
  return data.data;
}

// ─── BAE ─────────────────────────────────────────

export async function getBaes(anoParlamentario?: number): Promise<BaeRecord[]> {
  const params = anoParlamentario ? { anoParlamentario } : {};
  const { data } = await axiosInstance.get<ApiResponse<BaeRecord[]>>('/legislatura/bae', { params });
  return data.data;
}

export async function getBaeWithExpedientes(
  nroOrden: number,
  anoParlamentario: number,
  params: SearchExpedientesParams = {},
): Promise<{ bae: BaeRecord | null; expedientes: Expediente[]; total: number }> {
  const { data } = await axiosInstance.get(
    `/legislatura/bae/${nroOrden}/${anoParlamentario}`,
    { params },
  );
  return { bae: data.bae, expedientes: data.expedientes, total: data.total };
}

// ─── Chat (SSE streaming) ────────────────────────

export interface RagSource {
  ref: string;
  numero: string;
  tipo: string;
  preview: string;
  score: number;
}

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  onSources?: (sources: RagSource[]) => void;
}

export async function sendChatMessage(
  conversationId: string,
  text: string,
  callbacks: ChatStreamCallbacks,
): Promise<{ conversationId: string }> {
  const token = localStorage.getItem('accessToken');
  
  try {
    const response = await fetch(
      `${API_URL}/chat/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      },
    );

    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Chat request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') {
              callbacks.onDone();
              return { conversationId };
            }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) {
                callbacks.onError(new Error(parsed.error));
                return { conversationId };
              }
              // Handle sources event from Python RAG pipeline
              if (parsed.sources && Array.isArray(parsed.sources)) {
                callbacks.onSources?.(parsed.sources);
              } else {
                callbacks.onToken(parsed.chunk ?? payload);
              }
            } catch {
              callbacks.onToken(payload);
            }
          }
        }
      }
      callbacks.onDone();
    } catch (error) {
      callbacks.onError(error as Error);
    }
    return { conversationId };
  } catch (error) {
    console.error('sendChatMessage error:', error);
    throw error;
  }
}

// ─── Conversations ───────────────────────────────

export async function createConversation(): Promise<{ _id: string }> {
  const { data } = await axiosInstance.post('/chat/conversations', {
    title: 'Consulta Legislatura',
  });
  return data;
}

export async function getConversations(page = 1, limit = 20): Promise<{ conversations: any[]; total: number }> {
  const { data } = await axiosInstance.get('/chat/conversations', {
    params: { page, limit },
  });
  return data;
}

export async function getConversation(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/chat/conversations/${id}`);
  return data;
}

export async function getConversationMessages(id: string, limit = 50): Promise<any[]> {
  const { data } = await axiosInstance.get(`/chat/conversations/${id}/messages`, {
    params: { limit },
  });
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await axiosInstance.delete(`/chat/conversations/${id}`);
}
