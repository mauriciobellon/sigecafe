import { getServerSession } from '#auth'
import * as cheerio from 'cheerio'
import { ofetch } from 'ofetch'
import prisma from '@@/lib/prisma'

// Define interface for the PrecoCafe model
interface PrecoCafe {
  id: number
  data: Date
  precoRobusta: number | null
  precoArabica: number | null
}

export default defineEventHandler(async (event) => {
  // Validate authentication
  const session = await getServerSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Você precisa estar autenticado para acessar esta funcionalidade'
    })
  }

  try {
    if (event.method === 'GET') {
      // First check if we have recent prices in the database
      const lastDay = new Date()
      lastDay.setDate(lastDay.getDate() - 1)

      // Fetch the most recent price from the database
      const recentPrices = await prisma.$queryRaw<PrecoCafe[]>`
        SELECT * FROM "PrecoCafe"
        WHERE "data" >= ${lastDay}
        ORDER BY "data" DESC
        LIMIT 1
      `

      // If we have recent prices, return them
      if (recentPrices && recentPrices.length > 0) {
        const price = recentPrices[0]
        return {
          success: true,
          data: {
            arabica: price.precoArabica,
            robusta: price.precoRobusta,
            date: price.data
          }
        }
      }

      // If no recent prices, fetch from external source
      const prices = await fetchLatestPrices()

      // Save to database using raw query
      if (prices.arabica && prices.robusta) {
        const now = new Date()
        await prisma.$executeRaw`
          INSERT INTO "PrecoCafe" ("data", "precoArabica", "precoRobusta")
          VALUES (${now}, ${prices.arabica}, ${prices.robusta})
        `
      }

      return {
        success: true,
        data: prices
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Método não permitido'
    })
  } catch (error) {
    console.error('Error fetching coffee prices:', error)
    return {
      success: false,
      message: 'Erro ao buscar preços do café'
    }
  }
})

// Function to fetch prices from external source
async function fetchLatestPrices() {
  try {
    // Fetch data from CEPEA/ESALQ website
    const response = await ofetch('https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx', {
      retry: 3,
      timeout: 10000
    })

    const $ = cheerio.load(response)

    // Extract arabica price
    const arabicaElement = $('#imagenet-indicador-cafe .imagenet-center td.text:contains("Arábica")').next()
    let arabicaPrice = 0
    if (arabicaElement.length) {
      const arabicaText = arabicaElement.text().trim()
      arabicaPrice = parseFloat(arabicaText.replace('R$', '').replace('.', '').replace(',', '.').trim())
    }

    // Extract robusta/conilon price
    const robustaElement = $('#imagenet-indicador-cafe .imagenet-center td.text:contains("Robusta")').next()
    let robustaPrice = 0
    if (robustaElement.length) {
      const robustaText = robustaElement.text().trim()
      robustaPrice = parseFloat(robustaText.replace('R$', '').replace('.', '').replace(',', '.').trim())
    }

    // Log extracted data for debugging
    console.log('Extracted Arabica price:', arabicaPrice)
    console.log('Extracted Robusta price:', robustaPrice)

    // Use fallback values if extraction failed
    if (!arabicaPrice || isNaN(arabicaPrice)) {
      console.warn('Failed to extract arabica price, using fallback')
      arabicaPrice = 1249.88
    }

    if (!robustaPrice || isNaN(robustaPrice)) {
      console.warn('Failed to extract robusta price, using fallback')
      robustaPrice = 779.25
    }

    return {
      arabica: arabicaPrice,
      robusta: robustaPrice,
      date: new Date()
    }
  } catch (error) {
    console.error('Error fetching external coffee prices:', error)
    // Return fallback data in case of any errors
    return {
      arabica: 1249.88,
      robusta: 779.25,
      date: new Date()
    }
  }
}