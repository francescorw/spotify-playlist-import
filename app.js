const { get, post } = require('axios')
const querystring = require('querystring')
const fs = require('fs')

module.exports = params => {
  const { code, accountsUrl, apiUrl, redirectUri, clientId, clientSecret, inputFile } = params
  const userData = {}

  post(`${accountsUrl}/api/token`, querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    }), {
    headers: {
      'Authorization': `Basic ${(new Buffer(clientId + ':' + clientSecret).toString('base64'))}`
    }
  }).
  then(response => {
    userData.access_token = response.data.access_token

    return get(`${apiUrl}/v1/me`, {
      headers: {
        'Authorization': `Bearer ${userData.access_token}`
      }
    })
  }).
  then(response => {
    userData.id = response.data.id

    return new Promise((resolve, reject) => {
      fs.readFile(inputFile, (error, content) => {
        if (error) {
          reject(error)
        }
  
        resolve(content)
      })
    })
  }).
  then(content => Promise.all(
    content.
    toString().
    split('\n').
    filter(line => line && line.trim()).
    map(line =>
      get(`${apiUrl}/v1/search`, {
        params: {
          q: line,
          type: 'track'
        },
        headers: {
          'Authorization': `Bearer ${userData.access_token}`
        }
      })
    ))
  ).
  then(response => {
    const tracks = response.
    filter(r => r.data.tracks.items.length > 0).
    map(r => `spotify:track:${r.data.tracks.items[0].id}`)
    
    return new Promise((resolve, reject) => {
      post(`${apiUrl}/v1/users/${userData.id}/playlists`, {
        name: `imported-on-${new Date()}`,
        public: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.access_token}`
        }
      }).
      then(response => {
        if (!response.data.id) {
          reject()
          return
        }

        resolve({tracks, playlistId: response.data.id})
      })
    })
  }).
  then(response =>
    post(`${apiUrl}/v1/users/${userData.id}/playlists/${response.playlistId}/tracks`, {
      uris: response.tracks
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.access_token}`
      }
    })
  ).
  then(response => {
    console.log('done!')
    process.exit()
  }).
  catch(error => {
    console.log(error)
  })
}