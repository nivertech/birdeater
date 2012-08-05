#!/usr/bin/env node
var User = require('birdeater').User,
		argv = require('optimist').argv;

if (!argv.user) {
	console.log('usage: birdeater --user=[twitter_username]')
} else {
	var user = new User({
		userName: argv.user,
		onMaximumErrors: function(err) {
			console.log('too many errors occurred during crawl: ' + err);
		},
		onMoreTweetsLoaded: function() {
			console.log(user.tweets.length + ' tweets crawled.');
		}
	}, function() {
		console.log('finished crawling ' + argv.user);
	});
	user.crawl();
}