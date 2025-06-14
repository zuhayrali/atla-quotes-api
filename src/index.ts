import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth';
import quotes from '../quotes/quotes.json'

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

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})

app.get('/quotes', (c) => {
  return c.json(quotes); 
});

app.get('/quote-by-id/:id', async (c) => { 
  const id = parseInt(c.req.param('id'));
  if(id > quotes.length || id < 1 || !id) { 
    return c.text(`Quote ${id} does not exist :)`, 400);
  }
  const quote = quotes.find(quote => quote.id === id);
  return c.json(quote)
})

app.get('/random-quote', (c) => {
  const character = c.req.query('character');
  if(character) { 
    return c.redirect(`/random-character-quote?character=${character}`, 301);
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return c.json(quotes[randomIndex]); 
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
  return c.json(characterQuotes[randomIndex]); 
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
