import { defineEventHandler, readBody, createError } from 'h3'
import { getServerSession } from '#auth'
import prisma from '@@/lib/prisma'
import type { OfferDTO, CreateOfferDTO, OfferBookDTO, UsuarioDTO } from '~/types/api'

export default defineEventHandler(async (event) => {
  // Authenticate user
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  console.log('Session user:', session.user)

  // Cast session.user to UsuarioDTO for type safety
  const user = session.user as unknown as UsuarioDTO

  if (!user.id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID not found in session' })
  }

  const userId = user.id

  // Fetch associado type to enforce side
  let associadoType: string | null = null
  if (user.associadoId) {
    const assoc = await prisma.associado.findUnique({
      where: { id: user.associadoId }
    })
    associadoType = assoc?.tipo ?? null
  }

  if (event.method === 'GET') {
    // Get open buy offers (bids) and sell offers (asks)
    try {
      const bidsRaw = await prisma.$queryRaw`
        SELECT o.*, u.name
        FROM "Oferta" o
        JOIN "Usuario" u ON o."userId" = u.id
        WHERE o.status = 'OPEN' AND o.side = 'BUY'
        ORDER BY o.price DESC
      `

      const asksRaw = await prisma.$queryRaw`
        SELECT o.*, u.name
        FROM "Oferta" o
        JOIN "Usuario" u ON o."userId" = u.id
        WHERE o.status = 'OPEN' AND o.side = 'SELL'
        ORDER BY o.price DESC
      `

      const bids: OfferDTO[] = (bidsRaw as any[]).map((o) => ({
        id: o.id,
        userId: o.userId,
        user: o.name,
        side: o.side,
        price: o.price,
        quantity: o.quantity,
        status: o.status,
        createdAt: o.createdAt
      }))

      const asks: OfferDTO[] = (asksRaw as any[]).map((o) => ({
        id: o.id,
        userId: o.userId,
        user: o.name,
        side: o.side,
        price: o.price,
        quantity: o.quantity,
        status: o.status,
        createdAt: o.createdAt
      }))

      const book: OfferBookDTO = { bids, asks }
      return { success: true, data: book }
    } catch (error) {
      console.error('Error fetching offers:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch offers' })
    }
  }

  if (event.method === 'POST') {
    try {
      const body = await readBody<CreateOfferDTO>(event)

      console.log('Received offer creation request:', {
        userId,
        ...body,
        associadoType
      })

      const { side, price, quantity } = body

      if (!side || price == null || quantity == null) {
        throw createError({ statusCode: 400, statusMessage: 'Missing offer parameters' })
      }

      // Validate price and quantity
      if (price <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Price must be greater than 0' })
      }

      if (quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Quantity must be greater than 0' })
      }

      // Enforce role-based side: PRODUTOR only SELL, COMPRADOR only BUY
      if (associadoType === 'PRODUTOR' && side !== 'SELL') {
        throw createError({ statusCode: 403, statusMessage: 'Produtor users can only place sell offers' })
      }
      if (associadoType === 'COMPRADOR' && side !== 'BUY') {
        throw createError({ statusCode: 403, statusMessage: 'Comprador users can only place buy offers' })
      }

      // Try a simpler insertion
      const now = new Date()

      // Direct insert using raw SQL
      try {
        const insertSQL = `
          INSERT INTO "Oferta" ("userId", "side", "price", "quantity", "status", "createdAt", "updatedAt")
          VALUES ($1, $2::text::"OfferSide", $3, $4, 'OPEN', $5, $6)
        `;

        await prisma.$executeRawUnsafe(
          insertSQL,
          userId,
          side,
          price,
          Math.floor(quantity),
          now,
          now
        );

        console.log('Insert successful');
      } catch (sqlError: any) {
        console.error('SQL Error:', sqlError);
        throw new Error(`SQL Error: ${sqlError.message || 'Unknown database error'}`);
      }

      // Get the user name for the response
      const userName = user.name;

      // Create a response object - use a new object since we may not be able to get the created record back
      const offerResponse: OfferDTO = {
        id: 0, // We don't know the actual ID, but the client will refresh
        userId: userId,
        user: userName,
        side: side,
        price: price,
        quantity: quantity,
        status: 'OPEN',
        createdAt: now
      }

      return {
        success: true,
        message: 'Offer created successfully',
        data: offerResponse
      }
    } catch (error: any) {
      console.error('Error creating offer:', error)

      // Return more detailed error information
      const errorMessage = error.message || 'Unknown error occurred'
      const errorDetails = {
        name: error.name,
        code: error.code,
        stack: error.stack,
        details: error.details || 'No additional details'
      }

      console.error('Error details:', errorDetails)

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create offer: ${errorMessage}`
      })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})