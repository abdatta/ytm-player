require('dotenv').config();

const express = require('express')
const app = express()

const youtube = {
    search: require('youtube-search'),
    // stream: require('ytdl-core')
};

const he = require('he');

app.set('view engine', 'hbs');
 
app.get('/', function (req, res) {
  const query = req.query['q'];
  if (!query)  {
      res.sendStatus(400);
      return;
  }
  youtube.search(query, { key: process.env.YOUTUBE_API_KEY}, (err, results) => {
    if(err) {
        res.sendStatus(500);
        return console.log(err);
    }
    if (!results || !results.length) {
        res.send('No results found :(');
        return;
    }
    results.forEach(r => r.title = he.decode(r.title));

    res.render('index', { query, results});
  });
})
 
app.listen(5000, () => console.log('Listening on port 5000.'));