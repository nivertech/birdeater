Using Node.js and JQuery to Crawl Public Tweets
------------------------------------------------

A talk by [@benjamincoe](https://twitter.com/benjamincoe)

Birdeater
---------

Birdeater is a command-line tool for backing up a user's public Tweets in JSON format.

Usage
=====

First, make sure you have [node package manager](https://github.com/isaacs/npm/) installed:

```bash
curl http://npmjs.org/install.sh | sh
```

Then run the following commands to install and run Birdeater:

```bash
npm install birdeater -g
birdeater --user=shitmydadsays
```

Be mindful when running it, as Twitter limits the number of requests that a single client can make per hour.

How Birdeater Works
==================

Birdeater does not use Twitter's API. It was built as a demonstration of an approach I like to use for parsing structured information from unstructured HTML. Here's how it works:

An http connection is made to a user's public timeline using the [request](https://github.com/mikeal/request/) library:

```javascript
User.prototype.loadStatuses = function(callback) {
	request({
		url: 'https://twitter.com/...',
		headers: {accept: 'application/json'}
	}, function(err, res, body) {
		var error = err || res.statusCode != 200;
		// handle error, or.
		callback( body );
	});
};
```

This returns an HTML representation of the tweets. JQuery is used to extract structured information from this:

```javascript
jquery(body).find('.tweet').each(function() {
	var tweet = jquery(this);
	_this.tweets.push({
		text: jquery.trim( tweet.find('.js-tweet-text').text() ),
		timestamp: parseInt( tweet.find('._timestamp').attr('data-time') ),
		mentions: mentions.length > 0 ? tweet.attr('data-mentions').split(' ') : [],
		urls: urls
	});
});
```

I find that Node.js, coupled with JQuery, works great for building web crawlers:

* Node.js offers a non-blocking evented paradigm. This is awesome for a web-crawler, which will tend to be I/O bound.
* JQuery is a champ at parsing HTML. I find it much more intuitive than other libraries that I've used, such as Beautiful Soup.
* First and foremost, it's easy to do (take a look at **lib/user.js** Birdeater clocks in at about 100 lines of code).

This approach has become my hammer, when web scraping tasks come up.

-- Ben [@benjamincoe](https://twitter.com/#/benjamincoe)