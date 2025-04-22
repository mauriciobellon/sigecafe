import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();
const URL = 'https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx';

// Define coffee price interface
interface CoffeePrice {
  id: number;
  data: Date;
  precoArabica: number | null;
  precoRobusta: number | null;
}

// Check if the price is older than a day
function isPriceOutdated(priceDate: Date): boolean {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  return new Date().getTime() - new Date(priceDate).getTime() > oneDayInMs;
}

async function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function retry(fn: Function, retries = 3, delayTime = 5000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`tentative ${i + 1} failed. trying in ${delayTime/1000} seconds...`);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
  }

  throw lastError;
}

// Add type definitions for DOM types in server environment
type HTMLElement = any;
type Document = any;
declare const document: Document;

async function scrapeCoffeePrices() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    timeout: 60000
  });

  try {
    const page = await browser.newPage();

    // setup viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // setup extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    });

    // enable js and disable cache
    await page.setJavaScriptEnabled(true);
    await page.setCacheEnabled(false);

    console.log('Acessando a página...');
    await retry(async () => {
      await page.goto(URL, {
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: 60000
      });
    });

    await delay(5000);

    console.log('Extraindo dados...');
    const coffeeData = await page.evaluate(() => {
      const data: any = {};

      // function to extract data from the first row of a table
      function extractTableData(table: HTMLElement | null) {
        if (!table) return null;

        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return null;

        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        if (cells.length < 5) return null;

        return {
          data: cells[0].textContent?.trim(),
          valorR$: cells[1].textContent?.trim(),
          variacaoDia: cells[2].textContent?.trim(),
          variacaoMes: cells[3].textContent?.trim(),
          valorUS$: cells[4].textContent?.trim()
        };
      }

      // extract arabica coffee data
      const arabicaTable = document.querySelector('#imagenet-indicador1');
      if (arabicaTable) {
        data['Café Arábica CEPEA/ESALQ'] = extractTableData(arabicaTable);
      }

      // search for the second table that should contain the robusta coffee data
      const tables = document.querySelectorAll('table.imagenet-table');
      if (tables.length >= 2) {
        data['Café Robusta CEPEA/ESALQ'] = extractTableData(tables[1]);
      }

      return data;
    });

    return coffeeData;
  } finally {
    await browser.close();
  }
}

// Convert a string price to a float (handles Brazilian price format)
function convertPriceToFloat(priceStr: string | undefined): number | null {
  if (!priceStr) return null;

  // Remove non-numeric characters except decimal separators
  const cleanedStr = priceStr.replace(/[^\d,\.]/g, '');

  // Handle Brazilian format (e.g., "1.234,56")
  if (cleanedStr.includes(',')) {
    return parseFloat(cleanedStr.replace('.', '').replace(',', '.'));
  }

  return parseFloat(cleanedStr);
}

// Save new coffee prices to database
async function saveNewPrices(coffeeData: any) {
  // Parse prices
  const precoArabica = convertPriceToFloat(coffeeData['Café Arábica CEPEA/ESALQ']?.valorR$);
  const precoRobusta = convertPriceToFloat(coffeeData['Café Robusta CEPEA/ESALQ']?.valorR$);

  // Save to database
  await prisma.$executeRaw`
    INSERT INTO "PrecoCafe" (data, "precoArabica", "precoRobusta")
    VALUES (${new Date()}, ${precoArabica}, ${precoRobusta})
  `;

  const insertedPrice = await prisma.$queryRaw<CoffeePrice[]>`SELECT * FROM "PrecoCafe" ORDER BY data DESC LIMIT 1`;
  return insertedPrice[0];
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event);

  // Handle explicitly forcing a scrape (for GitHub Actions)
  if (query.force === 'true' || method === 'POST') {
    try {
      const scrapedData = await scrapeCoffeePrices();
      const newPrice = await saveNewPrices(scrapedData);

      return {
        success: true,
        data: newPrice,
        source: 'scraped'
      };
    } catch (error) {
      console.error('Error scraping coffee prices:', error);
      return {
        success: false,
        error: 'Failed to scrape coffee prices'
      };
    }
  }

  // Normal GET request handling
  const history = query.history === 'true';

  if (history) {
    // Get price history
    const priceHistory = await prisma.$queryRaw<CoffeePrice[]>`
      SELECT * FROM "PrecoCafe" ORDER BY data DESC
    `;

    return {
      success: true,
      data: priceHistory
    };
  } else {
    // Get latest price
    const latestPrice = await prisma.$queryRaw<CoffeePrice[]>`
      SELECT * FROM "PrecoCafe" ORDER BY data DESC LIMIT 1
    `;

    // If no prices exist or latest price is outdated, scrape new data
    if (latestPrice.length === 0 || isPriceOutdated(latestPrice[0].data)) {
      try {
        const scrapedData = await scrapeCoffeePrices();
        const newPrice = await saveNewPrices(scrapedData);

        return {
          success: true,
          data: newPrice,
          source: 'scraped'
        };
      } catch (error) {
        console.error('Failed to scrape new prices:', error);
        // Continue to return the old price if available
      }
    }

    if (latestPrice.length === 0) {
      return {
        success: false,
        error: 'No coffee prices available'
      };
    }

    return {
      success: true,
      data: latestPrice[0],
      source: 'database'
    };
  }
});