import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const URL = 'https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx';

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function retry(fn, retries = 3, delay = 5000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`tentative ${i + 1} failed. trying in ${delay/1000} seconds...`);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

async function scrapeCoffeePrices() {
  const browser = await puppeteer.launch({
    headless: 'new',
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
      const data = {};
      
      // function to extract data from the first row of a table
      function extractTableData(table) {
        if (!table) return null;
        
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) return null;
        
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td');
        if (cells.length < 5) return null;
        
        return {
          data: cells[0].textContent.trim(),
          valorR$: cells[1].textContent.trim(),
          variacaoDia: cells[2].textContent.trim(),
          variacaoMes: cells[3].textContent.trim(),
          valorUS$: cells[4].textContent.trim()
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

    // save data to a json file
    const outputPath = path.join(process.cwd(), 'data', 'coffee-prices.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(coffeeData, null, 2), 'utf-8');

    console.log('Dados das cotações de café foram salvos com sucesso!');
    console.log(coffeeData);

  } catch (error) {
    console.error('Erro ao fazer scraping das cotações:', error);
    process.exit(1); // exit with error so the GitHub Actions knows it failed
  } finally {
    await browser.close();
  }
}

scrapeCoffeePrices(); 