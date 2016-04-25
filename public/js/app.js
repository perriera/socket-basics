var socket = io();
var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room') || 'General';

console.log(name + ' wants to join ' + room);

var $room = jQuery('.room');
$room.append(room);
	
socket.on('connect', function () {
	console.log('Connected to socket.io server!');
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
});

socket.on('message', function (message) {
	console.log('New message:');
	console.log(message.text);
	var ts = moment(message.now);
	ts = ts.local();
	ts = ts.format('h:mm a');
	var $messages = jQuery('.messages');
	var $message = jQuery('<li class="list-group-item"></li>');
	$message.append('<p><b>' + message.name + ' ' + ts + ' </b><p>');
	$message.append('<p>' + message.text + '<p>');
	$messages.append($message);
});

// Handles submitting of new message

var $form = jQuery('#message-form');

$form.on('submit', function (event) {
	event.preventDefault();
	var $message = $form.find('input[name=message]');
	var now = moment();
	socket.emit('message', {
		name: name,
		text: $message.val(),
		now: now
	});
	$message.val('');
});

