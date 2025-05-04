import { getServerSession } from '#auth'
import { PrismaClient, UsuarioType } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Verificar autenticação
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade',
    })
  }

  try {
    console.log('Buscando contrapartes para usuário:', session.user.email)
    
    // Buscar o usuário atual
    const usuario = await prisma.usuario.findFirst({
      where: { email: session.user.email }
    })

    if (!usuario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
      })
    }

    console.log('Usuário encontrado:', usuario)

    // Se o usuário é administrador, buscar tanto compradores quanto vendedores
    if (usuario.type === UsuarioType.ADMINISTRADOR) {
      console.log('Usuário é administrador, buscando compradores e vendedores')
      const [compradores, vendedores] = await Promise.all([
        prisma.usuario.findMany({
          where: {
            type: UsuarioType.COMPRADOR,
            cooperativaId: usuario.cooperativaId
          },
          select: {
            id: true,
            name: true,
            type: true
          }
        }),
        prisma.usuario.findMany({
          where: {
            type: UsuarioType.PRODUTOR,
            cooperativaId: usuario.cooperativaId
          },
          select: {
            id: true,
            name: true,
            type: true
          }
        })
      ])
      console.log('Compradores encontrados:', compradores)
      console.log('Vendedores encontrados:', vendedores)
      return [...compradores, ...vendedores]
    }
    // Se o usuário é comprador, buscar vendedores
    else if (usuario.type === UsuarioType.COMPRADOR) {
      console.log('Usuário é comprador, buscando vendedores')
      const vendedores = await prisma.usuario.findMany({
        where: {
          type: UsuarioType.PRODUTOR,
          cooperativaId: usuario.cooperativaId
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      })
      console.log('Vendedores encontrados:', vendedores)
      return vendedores
    }
    // Se o usuário é vendedor, buscar compradores
    else if (usuario.type === UsuarioType.PRODUTOR) {
      console.log('Usuário é vendedor, buscando compradores')
      const compradores = await prisma.usuario.findMany({
        where: {
          type: UsuarioType.COMPRADOR,
          cooperativaId: usuario.cooperativaId
        },
        select: {
          id: true,
          name: true,
          type: true
        }
      })
      console.log('Compradores encontrados:', compradores)
      return compradores
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Apenas administradores, compradores e vendedores podem realizar transações',
    })
  } catch (error) {
    console.error('Erro ao buscar contrapartes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar contrapartes',
    })
  }
}) 