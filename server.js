var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

// prototype

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

function aMessage(who,what) {
	return {
		name: who,
		text: what,
		timestamp: moment().valueOf()
	}
}

function aSystemMessage(what) {
	return aMessage('System',what);
}

function sendCurrentUsers(socket) {
	var info = clientInfo[socket.id];
	var users = [];
	if ( typeof info === 'undefined' ) {
		return ;
	}
	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];
		if ( info.room === userInfo.room ) {
			users.push(userInfo.name);
		}
	});
	socket.emit('message',
		aSystemMessage('@currentUsers: '+users.join(', '))
	);
}

io.on('connection', function (socket) {
	console.log('User connected vis socket.io!');

	socket.on('disconnect', function () {
		if (typeof clientInfo[socket.id] !== 'undefined' ) {
			socket.leave(clientInfo[socket.id].room);
			io.to(clientInfo[socket.id].room).emit('message', 
				aSystemMessage(clientInfo[socket.id].name + ' has left!')
			);
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', 
			aSystemMessage(req.name + ' has joined!')
		);
	});

	socket.on('message', function(message){
		console.log('Message received: ' + message.text);
		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message',message);
		}
	});

	socket.emit('message',
		aSystemMessage('Welcome to the chat application!'));

});

http.listen(PORT, function () {
	console.log('Server started!');
});
