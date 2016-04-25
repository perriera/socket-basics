var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

// prototype

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection', function (socket) {
	console.log('User connected vis socket.io!');

	socket.on('disconnect', function () {
		if (typeof clientInfo[socket.id] !== 'undefined' ) {
			socket.leave(clientInfo[socket.id].room);
			io.to(clientInfo[socket.id].room).emit('message', {
				name: 'System',
				text: clientInfo[socket.id].name + ' has left!',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message',{
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function(message){
		console.log('Message received: ' + message.text);
		message.timestamp = moment().valueOf();
		io.to(clientInfo[socket.id].room).emit('message',message);
	});

	var now = moment();

	socket.emit('message',{
		name: 'System',
		text: 'Welcome to the chat application!',
		now: now
	});

});

http.listen(PORT, function () {
	console.log('Server started!');
});
