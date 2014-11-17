var usernames = {};
var rooms = [];

io.sockets.on('connection', function (socket) {
	socket.on('adduser', function(data) {
		socket.username = data.username;
		socket.room = data.chatHash;
		socket.join(socket.room);
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + socket.room);
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
		io.sockets.in(socket.room).emit('updateusers', usernames[socket.room]);
		socket.emit('updaterooms', rooms, socket.room);
		if (usernames[socket.room] === undefined) {
			usernames[socket.room] = [];
			usernames[socket.room].push(socket.username);		
		} else {
			if (usernames[socket.room].indexOf(socket.username) < 0) {
				usernames[socket.room].push(socket.username);
			}
		}
	});
	
	socket.on('sendchat', function (data) {
		socket.broadcast.to(data.room).emit('updatechat', data.username, data.message);
	});
	
	socket.on('disconnect', function(){
		io.sockets.emit('updateusers', usernames);
		io.sockets.in(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		io.sockets.in(socket.room).emit('updateusers', usernames[socket.room]);
		socket.leave(socket.room);		
		if (socket.username !== undefined) {
			var user_index = usernames[socket.room].indexOf(socket.username);
		    if (user_index > -1) {
			    usernames[socket.room].splice(user_index, 1);
			}
		}
		io.sockets.in(socket.room).emit('updateusers', usernames[socket.room]);
	});

});

var indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;
            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }
    return indexOf.call(this, needle);
};