#!/usr/bin/node

const http = require('http')
const app = require('./app')
const querystring = require('querystring')
const url = require('url')

const port = 22853
const redirectUri = `http://localhost:${22853}`
const accountsUrl = 'https://accounts.spotify.com'
const apiUrl = 'https://api.spotify.com'
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

const randomState = Math.random() * 999999999999

// authorize
const callbackServer = http.createServer((req, res) => {
  const { state, code } = url.parse(req.url, true).query

  if (state != randomState) {
    return
  }

  console.log('authenticated')
  res.end('ok')
  app({
    code,
    accountsUrl,
    apiUrl,
    redirectUri,
    clientId,
    clientSecret,
    inputFile: 'input.txt'
  })
})

callbackServer.listen(port)

console.log('authenticating...')

const authenticatingUrl = `${accountsUrl}/authorize?${querystring.stringify({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  scope: 'user-read-email playlist-modify-private',
  state: randomState
})}`

console.log(`copy and paste the following url in your browser ${authenticatingUrl}`)
