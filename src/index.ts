import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth';
import quotes from '../quotes/quotes.json';
import { getCharacterImageUrl } from './helpers';

type Bindings = {
  USERNAME: string,
  PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  })
  return auth(c,next)
})

app.get('/', (c) => {
  const counts: Record<string, number> = {};
  for (const quote of quotes) {
    counts[quote.character] = (counts[quote.character] ?? 0) + 1;
  }

  let HTML = `<!doctype html>
      <head>
        <title>ATLA Quotes API</title>
        <style>
          html {
            background-color: beige;
            display: flex;
            justify-content: center;
            margin-top: 1em;
          } 
          a { 
            text-decoration: none;
          }
          a:hover { 
            text-decoration: underline;
          }
        </style>
      </head>
      <h2>Avatar: The Last Airbender Quotes API</h2>
      <h2><a href="https://github.com/zuhayrali/atla-quotes-api" target="_blank" rel="noopener noreferrer">Source Code (GitHub)</a></h2>
      <p>Developed for plugin development on <a href="https://usetrmnl.com/" target="_blank" rel="noopener noreferrer">trmnl</a>.<p>
      <h3>Current Quotes per Character</h3>
      <ul>
  `

  Object.entries(counts).forEach((character) => { 
    HTML += (`<li>${character[0]}: ${character[1]}</li>`);
  })

  HTML += "</ul>"
  
  HTML += `
  <h3>TODO</h3>
  <ul>
    <li>[  ] OpenAPI / Swagger docs </li>
    <li>[  ] Add 10 quotes per character </li>
    <li>[ x ] Add 3 1-bit images per character </li>
    <li>[  ] Add image url to quote response </li>
    <li>[  ] Add Season/Episode (Book/Chapter) for each quote </li>
    <li>[  ] Add Legend of Korra support?</li>
    <li>[  ] Comission artwork</li>
  </ul>
  <footer style="position: fixed; bottom: 0; font-size: 0.8rem">
    note to self: 
    <a href="https://motherfuckingwebsite.com/" target="_blank" rel="noopener noreferrer">do not make this look pretty :)</a>
  </footer>
  `
  return c.html(
    HTML
  )})

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})

app.get('/quotes', (c) => {
  return c.json(quotes); 
});

app.get('/quotes/:id', async (c) => { 
  const id = parseInt(c.req.param('id'));
  if(id > quotes.length || id <= 0) { 
    return c.text(`Quote ${id} does not exist :)`, 400);
  }
  const quote = quotes.find(quote => quote.id === id);
  if(!quote) { 
    return c.text(`Quote ${id} does not exist :)`, 400);
  }
  const characterImg = getCharacterImageUrl(quote.character, c)

  return c.json({
    ...quote, characterImg
  });

})

app.get('/random-quote', (c) => {
  const character = c.req.query('character');
  if(character) { 
    return c.redirect(`/random-character-quote?character=${character}`, 301);
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const characterImg = getCharacterImageUrl(quotes[randomIndex].character, c)
  
  return c.json({
    ...quotes[randomIndex], characterImg
  }); 
  
});

app.get('/random-character-quote', (c) => {
  const character = c.req.query('character');
  if(!character) { 
    return c.text('No character provided.', 400)
  }

  const characterQuotes = quotes.filter(quotes => quotes["character"] == character);
  
  if(characterQuotes.length == 0) { 
    return c.text(`No quotes exist for ${character}, sorry :)`, 400);
  }
  
  const randomIndex = Math.floor(Math.random() * characterQuotes.length);
  const characterImg = getCharacterImageUrl(characterQuotes[randomIndex].character, c)

  return c.json({
    ...characterQuotes[randomIndex], characterImg
  });

});

app.get('/quotes-by-character', async (c) => { 
  const character = c.req.query('character');
  if(!character) { 
    return c.text('No character provided.', 400)
  }
  const characterQuotes = quotes.filter(quotes => quotes["character"] == character);
  
  if(characterQuotes.length == 0) { 
    return c.text(`No quotes exist for ${character}, sorry :)`, 400);
  }
  
  return c.json(characterQuotes)
})

export default app
