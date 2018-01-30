/*
 * Use socket.io for sending tweets to client. 
 */

console.log(process.env.PORT, process.env.WEBSOCKET_PORT)
const io = require('socket.io')(process.env.WEBSOCKET_PORT);

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

/*
 * Fetch API keys and initialize twitter client.
 */
const Twitter = require('twitter');
const twitterConfig = require('./config');
const twitterClient = new Twitter(twitterConfig);

/*
 * Set hashtag(s) for tracking.
 */
const hashtag = 'python,javascript';

/*
 * Use twitter's stream API to get tweets in 
 * realtime.
 */
twitterClient.stream('statuses/filter', {
  track: hashtag
}, function(stream) {
  stream.on('data', function(tweet) {
    io.emit('tweet', tweet);
  });

  stream.on('error', function(err) {
    console.error(err);
  });
});


// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
