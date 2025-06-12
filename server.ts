// server.ts
import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Define the Quote interface
interface Quote {
  id: number;
  character: string;
  quote: string;
}

// Load quotes from the JSON file
async function loadQuotes(): Promise<Quote[]> {
  try {
    const filePath = path.resolve('src', 'quotes.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as Quote[];
  } catch (err) {
    console.error('Error loading quotes:', err);
    return [];
  }
}

const app = express();
const port = 9329;

let cachedQuotes: Quote[] = [];

// Initialize cached quotes on server start
(async () => {
  cachedQuotes = await loadQuotes();
  if (cachedQuotes.length === 0) {
    console.log("No quotes found in quotes.json");
  }
})();

// Random quote endpoint
app.get('/random-quote', async (req: Request, res: Response): Promise<void> => {
  const randomIndex = Math.floor(Math.random() * cachedQuotes.length);
  res.json(cachedQuotes[randomIndex]);
});

// Specific character quote endpoint
app.get('/quote', async (req: Request, res: Response) => {
  const character = req.query.character as string;

  if (!character) {
    return res.redirect('/random-quote');
  }

  const availableQuotes = cachedQuotes.filter(quote => quote.character === character);

  if (availableQuotes.length === 0) {
    return res.redirect('/random-quote');
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  res.json(availableQuotes[randomIndex]);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});