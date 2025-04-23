import { getServerSession } from '#auth'
import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio';

const prisma = new PrismaClient()

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
      const lastDay = new Date();
      lastDay.setDate(lastDay.getDate() - 1);

      const recentPrices = await prisma.precoCafe.findFirst({
        where: {
          data: { gte: lastDay }
        },
        orderBy: {
          data: 'desc'
        }
      });

      // If we have recent prices, return them
      if (recentPrices) {
        return {
          success: true,
          data: {
            arabica: recentPrices.precoArabica,
            robusta: recentPrices.precoRobusta,
            date: recentPrices.data
          }
        };
      }

      // If no recent prices, fetch from external source
      const prices = await fetchLatestPrices();

      // Save to database
      if (prices.arabica && prices.robusta) {
        await prisma.precoCafe.create({
          data: {
            data: new Date(),
            precoArabica: prices.arabica,
            precoRobusta: prices.robusta
          }
        });
      }

      return {
        success: true,
        data: prices
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Método não permitido'
    });
  } catch (error) {
    console.error('Error fetching coffee prices:', error);
    return {
      success: false,
      message: 'Erro ao buscar preços do café'
    };
  }
});

// Function to fetch prices from external source
async function fetchLatestPrices() {
  try {
    // This is a mock function - in a real app you would fetch from a real API
    // such as CEPEA/ESALQ or similar

    // For now, return mock data
    return {
      arabica: 31.20 + Math.random() * 2, // Random price around 31.20
      robusta: 25.59 + Math.random() * 2, // Random price around 25.59
      date: new Date()
    };

    // Example of fetching from a real source (commented out)
    /*
    const response = await fetch('https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx');
    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse the HTML to extract prices
    // This is just an example; the actual implementation depends on the site structure
    const arabicaPrice = parseFloat($('#some-arabica-selector').text().replace('R$', '').trim());
    const robustaPrice = parseFloat($('#some-robusta-selector').text().replace('R$', '').trim());

    return {
      arabica: arabicaPrice,
      robusta: robustaPrice,
      date: new Date()
    };
    */
  } catch (error) {
    console.error('Error fetching external coffee prices:', error);
    // Return fallback data
    return {
      arabica: 31.20,
      robusta: 25.59,
      date: new Date()
    };
  }
}