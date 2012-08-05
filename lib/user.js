var jquery = require('jquery'),
		request = require('request'),
		sexy = require('sexy-args'),
		fs = require('fs');

function User(params, loadedCallback) {
	sexy.args([this, ['object1', 'function1'], 'function1'], {
		'object1': {
			// PUBLIC.
			userName: null, 
			userId: null,
			tweets: [],
			onMaximumErrors: function() {}, // Called if we hit the maximum errors threshold.
			onMoreTweetsLoaded: function() {}, // Callback executed as we stream in more tweets.
			
			// PRIVATE.
			_maxId: 0, // MaxID of the next page of tweets to load.
			_maxStatusesLoaded: -1, // How many tweets should we load for this user?
			_statusCache: {}, // Cache of a page of tweets.
			_backoff: 2000, // How long should we _backoff when loading data fails.,
			_maximumErrors: 3, // How many errors should we allow before calling the onMaximumErrors callback?
			_errors: 0,
		},
		'function1': function(text) {} // Callback executed when all tweets are loaded.
	}, function() {
		sexy.extend(this, params);
		this.loadedCallback = loadedCallback;
	});
};

User.prototype.crawl = function() {
	this.crawlUserData();
};

User.prototype.crawlUserData = function() {
	var _this = this;
	this.loadStatuses(function(tweets) {
		var element = jquery(tweets.items_html);
		_this.userId = element.find('.account-group').attr('data-user-id');
		_this.crawlStatuses();
	});
};

User.prototype.crawlStatuses = function() {
	var _this = this;
	
	this.loadStatuses(function(tweets) {
		jquery(tweets.items_html).find('.tweet').each(function() {
			var tweet = jquery(this),
					mentions = tweet.attr('data-mentions'),
					urls = [];
			
			tweet.find('.js-display-url').each(function() {
				urls.push( jquery(this).text() );
			});
			
			_this.tweets.push({
				text: jquery.trim( tweet.find('.js-tweet-text').text() ),
				timestamp: parseInt( tweet.find('._timestamp').attr('data-time') ),
				mentions: mentions.length > 0 ? tweet.attr('data-mentions').split(' ') : [],
				urls: urls
			});
			
			_this._maxId = tweet.attr('data-item-id');
		});
		
		_this.onMoreTweetsLoaded();
		
		if (tweets.has_more_items) {
			_this.crawlStatuses();
		} else {
			_this.save();
			_this.loadedCallback();
		}

	});
};

User.prototype.statusUrl = function() {
	var statusUrl = 'https://twitter.com/' + this.userName + '?incluce_available_features=1&include_entities=1'
	statusUrl += this._maxId ? '&max_id=' + this._maxId : ''
	return statusUrl;
};

User.prototype.loadStatuses = function(callback) {
	var _this = this;
	
	if (this._statusCache[this._maxId]) {
		callback(this._statusCache[this._maxId]);
		return;
	}
	
	request({
		url: this.statusUrl(),
		headers: {accept: 'application/json'}
	}, function(err, res, body) {
		var error = err || res.statusCode != 200;
		
		if (error && _this._errors < _this._maximumErrors) {
			_this._errors += 1;
			setTimeout(function() {
				_this.crawl();
			}, _this._backoff);
		} else if (error) {
			_this.onMaximumErrors(err || ('http status ' + res.statusCode) );
		} else {
			_this._errors = 0;
			_this._statusCache[_this._maxId] = JSON.parse(body);
			callback(_this._statusCache[_this._maxId]);
		}
	});
};

User.prototype.save = function() {
	fs.writeFileSync(this.userName + '.json', JSON.stringify({
		userName: this.userName,
		userId: this.userId,
		tweets: this.tweets
	}));
};

User.loadFromFile = function(filename) {
	return new User( JSON.parse(fs.readFileSync(filename)) );
};

exports.User = User;