var socket = io();

socket.on('connect', function () {
	console.log('Connected to socket.io server!');
});

socket.on('message', function (message) {
	console.log('New message:');
	console.log(message.text);
	var ts = moment(message.now);
	ts = ts.local();
	ts = ts.format('h:mm a');
	jQuery('.messages').append('<p><b>' + ts + ':</b> '+ message.text + '<p>');
});

// Handles submitting of new message

var $form = jQuery('#message-form');

$form.on('submit', function (event) {
	event.preventDefault();
	var $message = $form.find('input[name=message]');
	var now = moment();
	socket.emit('message', {
		text: $message.val(),
		now: now
	});
	$message.val('');
});

