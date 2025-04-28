import type { MenuType, UsuarioType } from '@prisma/client'

export interface PermissionDTO {
  id: number;
  path: string;
  title?: string | null;
  icon?: string | null;
  description?: string | null;
  menuType: MenuType[];
  usuarioType: UsuarioType[];
}

export interface TransacaoDTO {
  id: string;
  data: Date;
  comprador: string;
  compradorId: number;
  vendedor: string;
  vendedorId: number;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  status: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransacaoDTO {
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  data: Date;
  status: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  observacoes?: string | null;
  compradorId: number;
  vendedorId: number;
}

export interface UpdateTransacaoDTO {
  id: string;
  quantidade?: number;
  precoUnitario?: number;
  valorTotal?: number;
  data?: Date;
  status?: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  observacoes?: string | null;
}

export interface TransacaoFilterDTO {
  compradorId?: number;
  vendedorId?: number;
  status?: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
  dataInicio?: Date;
  dataFim?: Date;
  page?: number;
  limit?: number;
}

export interface PrecoCafeDTO {
  id: number;
  data: Date;
  precoRobusta?: number | null;
  precoArabica?: number | null;
  fonte?: string | null;
}

export interface NotificacaoDTO {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  lida: boolean;
  enviada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferenceDTO {
  theme: string;
  fontSize: string;
}

export interface AssociadoDTO {
  id: number;
  nome: string;
  celular?: string | null;
  tipo: 'PRODUTOR' | 'COMPRADOR';
  documento?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface ColaboradorDTO {
  id: number;
  nome: string;
  celular?: string | null;
  cargo?: string | null;
  cooperativaId: number;
}

export interface CooperativaDTO {
  id: number;
  nome: string;
  celular?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface UsuarioDTO {
  id: number;
  name: string;
  email?: string | null;
  celular: string;
  type: UsuarioType;
  cooperativaId?: number | null;
  associadoId?: number | null;
  colaboradorId?: number | null;
}

export interface UsuarioPreferencesDTO {
  name: string;
  email: string;
  celular?: string;
  type: string;
  // Optional associations for fetching location
  cooperativaId?: number | null;
  associadoId?: number | null;
}

export interface LoginDTO {
  celular: string;
  password: string;
}

export interface SignupDTO {
  name: string;
  celular: string;
  password: string;
}

export interface AuthResponseDTO {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: any;
  status?: number;
}

export interface WeatherDataDTO {
  hourly: {
    time: Date;
    temperature2m: number;
    relativeHumidity2m: number;
    precipitationProbability: number;
    precipitation: number;
  }
}

// Order book offer types
export interface OfferDTO {
  id: number;
  userId: number;
  user: string; // user name
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: Date;
}

export interface CreateOfferDTO {
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
}

export interface OfferBookDTO {
  bids: OfferDTO[];
  asks: OfferDTO[];
}

// Password recovery related DTOs
export interface PasswordRecoveryRequestDTO {
  celular: string;
}

export interface PasswordResetRequestDTO {
  token: string;
  password: string;
}

export interface PasswordTokenDTO {
  token: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
}

// Associado-related DTOs
export interface AssociadoCreateDTO {
  nome: string;
  celular?: string;
  tipo: 'PRODUTOR' | 'COMPRADOR';
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cooperativaId: number;
}

export interface AssociadoUpdateDTO {
  id: number;
  nome?: string;
  celular?: string;
  tipo?: 'PRODUTOR' | 'COMPRADOR';
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}

export interface AssociadoFilterDTO {
  tipo?: 'PRODUTOR' | 'COMPRADOR';
  nome?: string;
  cidade?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

// Colaborador-related DTOs
export interface ColaboradorCreateDTO {
  nome: string;
  celular?: string;
  cargo?: string;
  cooperativaId: number;
}

export interface ColaboradorUpdateDTO {
  id: number;
  nome?: string;
  celular?: string;
  cargo?: string;
  cooperativaId?: number;
}

export interface ColaboradorFilterDTO {
  nome?: string;
  cargo?: string;
  cooperativaId?: number;
  page?: number;
  limit?: number;
}