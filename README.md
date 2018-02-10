# Spotify playlist import

## What
Spotify playlist import is a simple command line tool that lets you import a text file with line separated tracks into a spotify playlist.

## Installation
You have to setup an app through the [Spotify Developer Dashboard](https://developer.spotify.com/) accepting Spotify terms.

Go to _Edit settings_ in your app's dashboard and configure a _Redirect URI_ like http://localhost:12121 (choose a random port for this).

```
npm install
```
## Usage
```
./index.js \
--port={port} \
--clientId={clientId} \
--clientSecret=[clientSecret} \
--inputFile={inputFile}
```