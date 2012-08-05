var User = require('../lib').User;
console.log( User.loadFromFile('example/shitmydadsays.json').tweets );