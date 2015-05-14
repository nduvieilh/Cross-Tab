var express = require('express');

var app = express();

var dirs = {
	'views': __dirname + '/',
}

// Error Handler
function Error(message) {
	console.log("ERROR: " + message);
}

// View files
app.get('/', function(req, res) {
	res.sendFile(dirs['views'] + 'index.html');
});
app.get('/slave', function(req, res) {
	res.sendFile(dirs['views'] + 'slave.html');
});
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/node_modules'));

app.listen(3000);
console.log('Listening on port 3000...');