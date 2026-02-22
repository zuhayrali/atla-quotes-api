// This is the entrypoint for the docker image

import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import app from './index'

const nodeApp = new Hono()

nodeApp.use('/*', async (c, next) => {
  c.env = {
    USERNAME: process.env.USERNAME ?? '',
    PASSWORD: process.env.PASSWORD ?? '',
  }
  await next()
})

nodeApp.use('/*', serveStatic({ root: './public' }))
nodeApp.route('/', app)

serve({
  fetch: nodeApp.fetch,
  port: 3000
})