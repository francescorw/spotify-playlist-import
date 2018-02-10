#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const app = require('./app')
const querystring = require('querystring')
const url = require('url')

const { port, clientId, clientSecret, inputFile } = require('minimist')(process.argv.slice(2));

if (!port || !clientId || !clientSecret || !inputFile) {
  console.log('You must provide port, clientId, clientSecret and inputFile')
  return
}

if ( !fs.existsSync(inputFile)) {
  console.log(`${inputFile}: no such file or directory`)
  return
}

const redirectUri = `http://localhost:${port}`
const accountsUrl = 'https://accounts.spotify.com'
const apiUrl = 'https://api.spotify.com'

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
    inputFile
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
