import { PrismaClient, AssociadoTipo } from '@prisma/client';
import { prisma } from '../utils/prisma';
import type { AssociadoDTO, AssociadoCreateDTO, AssociadoUpdateDTO, AssociadoFilterDTO } from '~/types/api';

interface AssociadoFilterParams {
  page?: number;
  limit?: number;
  nome?: string;
  tipo?: 'PRODUTOR' | 'COMPRADOR';
  cidade?: string;
  estado?: string;
}

interface AssociadoPagedResponse {
  data: AssociadoDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AssociadoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new Associado
   */
  async create(data: AssociadoCreateDTO): Promise<AssociadoDTO> {
    const { tipo, ...rest } = data;

    return this.prisma.associado.create({
      data: {
        ...rest,
        tipo: tipo === 'PRODUTOR' ? AssociadoTipo.PRODUTOR : AssociadoTipo.COMPRADOR,
      },
    });
  }

  /**
   * Get Associado by ID
   */
  async getById(id: number): Promise<AssociadoDTO | null> {
    return this.prisma.associado.findUnique({
      where: { id },
    });
  }

  /**
   * Get all Associados with optional filtering
   */
  async getAll(params: AssociadoFilterParams = {}): Promise<AssociadoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      nome,
      tipo,
      cidade,
      estado,
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(nome && { nome: { contains: nome, mode: 'insensitive' as const } }),
      ...(tipo && { tipo: tipo === 'PRODUTOR' ? AssociadoTipo.PRODUTOR : AssociadoTipo.COMPRADOR }),
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' as const } }),
      ...(estado && { estado: { contains: estado, mode: 'insensitive' as const } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.associado.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.associado.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an Associado
   */
  async update(id: number, data: AssociadoUpdateDTO): Promise<AssociadoDTO> {
    const { tipo, ...rest } = data;

    const updateData: Partial<Omit<AssociadoUpdateDTO, "tipo">> & { tipo?: AssociadoTipo } = {
      ...rest,
    };

    if (tipo) {
      updateData.tipo = tipo === 'PRODUTOR' ? AssociadoTipo.PRODUTOR : AssociadoTipo.COMPRADOR;
    }

    return this.prisma.associado.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete an Associado
   */
  async delete(id: number): Promise<void> {
    await this.prisma.associado.delete({
      where: { id },
    });
  }

  /**
   * Get all Associados by cooperativa ID
   */
  async getByCooperativa(
    cooperativaId: number,
    filter?: AssociadoFilterDTO
  ): Promise<AssociadoPagedResponse> {
    const limit = filter?.limit || 10;
    const page = filter?.page || 1;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      cooperativaId: number;
      tipo?: AssociadoTipo;
      nome?: { contains: string; mode: "insensitive" };
      cidade?: { contains: string; mode: "insensitive" };
      estado?: { contains: string; mode: "insensitive" };
    } = { cooperativaId };

    if (filter?.tipo) {
      where.tipo = filter.tipo === 'PRODUTOR' ? AssociadoTipo.PRODUTOR : AssociadoTipo.COMPRADOR;
    }

    if (filter?.nome) {
      where.nome = { contains: filter.nome, mode: "insensitive" };
    }

    if (filter?.cidade) {
      where.cidade = { contains: filter.cidade, mode: "insensitive" };
    }

    if (filter?.estado) {
      where.estado = { contains: filter.estado, mode: "insensitive" };
    }

    // Count total
    const total = await this.prisma.associado.count({ where });

    // Get data
    const data = await this.prisma.associado.findMany({
      where,
      take: limit,
      skip,
      orderBy: { nome: "asc" },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}