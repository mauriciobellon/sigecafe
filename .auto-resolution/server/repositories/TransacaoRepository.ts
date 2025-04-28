import { PrismaClient, TransacaoStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import type { TransacaoDTO, TransacaoFilterDTO, CreateTransacaoDTO, UpdateTransacaoDTO } from '~/types/api';
import { Prisma } from '@prisma/client';

interface TransacaoFilterParams {
  page?: number;
  limit?: number;
  compradorId?: number;
  vendedorId?: number;
  status?: TransacaoStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

interface TransacaoPagedResponse {
  data: TransacaoDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class TransacaoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new transaction
   */
  async create(data: CreateTransacaoDTO): Promise<TransacaoDTO> {
    const transaction = await this.prisma.transacao.create({
      data: {
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        valorTotal: data.valorTotal,
        data: data.data,
        status: data.status,
        observacoes: data.observacoes,
        comprador: { connect: { id: data.compradorId } },
        vendedor: { connect: { id: data.vendedorId } },
      },
      include: {
        comprador: {
          select: {
            id: true,
            name: true,
          },
        },
        vendedor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      ...transaction,
      comprador: transaction.comprador.name,
      vendedor: transaction.vendedor.name,
    };
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<TransacaoDTO | null> {
    const transacao = await this.prisma.transacao.findUnique({
      where: { id },
      include: {
        comprador: {
          select: { name: true }
        },
        vendedor: {
          select: { name: true }
        }
      }
    });

    if (!transacao) return null;

    return {
      ...transacao,
      comprador: transacao.comprador.name,
      vendedor: transacao.vendedor.name
    };
  }

  /**
   * Get all transactions with filtering
   */
  async getAll(params: TransacaoFilterParams = {}): Promise<TransacaoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      compradorId,
      vendedorId,
      status,
      dataInicio,
      dataFim
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransacaoWhereInput = {};

    if (compradorId) {
      where.compradorId = compradorId;
    }

    if (vendedorId) {
      where.vendedorId = vendedorId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = dataInicio;
      }
      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    const [transacoesRaw, total] = await Promise.all([
      this.prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          comprador: {
            select: { name: true }
          },
          vendedor: {
            select: { name: true }
          }
        }
      }),
      this.prisma.transacao.count({ where })
    ]);

    // Transform data to match TransacaoDTO format
    const data = transacoesRaw.map(t => ({
      ...t,
      comprador: t.comprador.name,
      vendedor: t.vendedor.name
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update a transaction
   */
  async update(id: string, data: UpdateTransacaoDTO): Promise<TransacaoDTO> {
    const updatedTransacao = await this.prisma.transacao.update({
      where: { id },
      data: {
        quantidade: data.quantidade,
        precoUnitario: data.precoUnitario,
        valorTotal: data.valorTotal,
        data: data.data,
        status: data.status,
        observacoes: data.observacoes,
      },
      include: {
        comprador: {
          select: { name: true }
        },
        vendedor: {
          select: { name: true }
        }
      }
    });

    return {
      ...updatedTransacao,
      comprador: updatedTransacao.comprador.name,
      vendedor: updatedTransacao.vendedor.name
    };
  }

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<void> {
    await this.prisma.transacao.delete({
      where: { id }
    });
  }

  /**
   * Get transactions by user ID (as either buyer or seller)
   */
  async getByUsuarioId(usuarioId: number, filter: TransacaoFilterParams = {}): Promise<TransacaoPagedResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      dataInicio,
      dataFim
    } = filter;

    const skip = (page - 1) * limit;

    // User can be either buyer or seller
    const where: Prisma.TransacaoWhereInput = {
      OR: [
        { compradorId: usuarioId },
        { vendedorId: usuarioId }
      ]
    };

    // Apply additional filters
    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) {
        where.data.gte = dataInicio;
      }
      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    const [transacoesRaw, total] = await Promise.all([
      this.prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          comprador: {
            select: { name: true }
          },
          vendedor: {
            select: { name: true }
          }
        }
      }),
      this.prisma.transacao.count({ where })
    ]);

    // Transform data to match TransacaoDTO format
    const data = transacoesRaw.map(t => ({
      ...t,
      comprador: t.comprador.name,
      vendedor: t.vendedor.name
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find all transactions with filtering
   */
  async findAll(filters: TransacaoFilterDTO = {}): Promise<TransacaoPagedResponse> {
    const { compradorId, vendedorId, status, dataInicio, dataFim, page = 1, limit = 10 } = filters;

    const where: Prisma.TransacaoWhereInput = {};

    if (compradorId) {
      where.compradorId = compradorId;
    }

    if (vendedorId) {
      where.vendedorId = vendedorId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.data = {};

      if (dataInicio) {
        where.data.gte = dataInicio;
      }

      if (dataFim) {
        where.data.lte = dataFim;
      }
    }

    const skip = (page - 1) * limit;

    const [total, transacoesRaw] = await Promise.all([
      this.prisma.transacao.count({ where }),
      this.prisma.transacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          comprador: {
            select: {
              id: true,
              name: true,
            },
          },
          vendedor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Transform data to match TransacaoDTO format
    const data = transacoesRaw.map(t => ({
      ...t,
      comprador: t.comprador.name,
      vendedor: t.vendedor.name
    }));

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