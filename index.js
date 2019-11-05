require('dotenv').config();

const express = require('express');
const app = express();

const globalTunnel = require('global-tunnel-ng');

// in case of proxy requirements
if (process.env.HTTP_PROXY && process.env.HTTP_PROXY.toLowerCase() === 'true') {
    globalTunnel.initialize({
        host: process.env.HTTP_PROXY_HOST,
        port: process.env.HTTP_PROXY_PORT,
        proxyAuth: process.env.HTTP_PROXY_USER + ':' + process.env.HTTP_PROXY_PASS
    });
}

const youtube = {
    search: require('youtube-search'),
    stream: require('ytdl-core')
};

const he = require('he');

app.set('view engine', 'hbs');
 
app.get('/', (req, res) => {
  const query = req.query['q'];
  if (!query)  {
      res.sendStatus(400);
      return;
  }
  youtube.search(query, {
      maxResults: 8,
      type: 'video',
      key: process.env.YOUTUBE_API_KEY
    }, (err, results) => {
    if(err) {
        res.sendStatus(500);
        return console.log(err);
    }
    if (!results || !results.length) {
        res.send('No results found :(');
        return;
    }

    results = results.filter(r => r.kind === 'youtube#video');
    results.forEach(r => {
        r.title = he.decode(r.title);
        r.link = '/play?url=' + encodeURIComponent(r.link);
    });

    res.render('index', { query, results });
  });
})

app.get('/play', (req, res) => {
    const url = req.query['url'];
    if (!url)  {
        res.sendStatus(400);
        return;
    }
    youtube.stream(url).pipe(res);
});
 
app.listen(5000, () => console.log('Listening on port 5000.'));
