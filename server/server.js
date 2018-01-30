/*
 * Use socket.io for sending tweets to client. 
 */

console.log(process.env.WEBSOCKET_PORT)
const io = require('socket.io')(process.env.WEBSOCKET_PORT);

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
