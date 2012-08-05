Birdeater
---------

Birdeater is a command-line tool for backing up a user's public Tweets in JSON format.

Usage
=====

```bash
npm install birdeater -g
birdeater --user=shitmydadsays
```

Why It's Cool
============

Birdeater does not use Twitter's API. It demonstrates an approach I like to use for parsing structured information from unstructured HTML. Here's how it works:

An http connection is made to a user's public timeline using the [request](https://github.com/mikeal/request/) library:

```javascript
User.prototype.loadStatuses = function(callback) {
	request({
		url: 'https://twitter.com/...',
		headers: {accept: 'application/json'}
	}, function(err, res, body) {
		var error = err || res.statusCode != 200;
		// handle error, or.
		callback( JSON.parse(body) );
	});
};
```

This returns an HTML representation of the tweets. JQuery is used to extract structured information from this.

```javascript
jquery(tweets.items_html).find('.tweet').each(function() {
	var tweet = jquery(this);
	_this.tweets.push({
		text: jquery.trim( tweet.find('.js-tweet-text').text() ),
		timestamp: parseInt( tweet.find('._timestamp').attr('data-time') ),
		mentions: mentions.length > 0 ? tweet.attr('data-mentions').split(' ') : [],
		urls: urls
	});
});
```

I find that Node.js coupled with JQuery works great for building website crawlers.