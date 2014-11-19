var usernames = {};
var rooms = [];
var watching = {}

io.sockets.on('connection', function (socket) {
	socket.on('watchingAuction', function(auction) {
		socket.auction = auction;
		socket.join(auction);
		io.sockets.in(auction).emit('updateAuctionData', 'connected');
		if (watching[auction] == undefined) {
			watching[auction] = [];
			watching[auction].push(socket.id);			
		} else {
			watching[auction].push(socket.id);			
		}
	});
	
	socket.on('disconnect', function(){
		var index = watching[socket.auction].indexOf(socket.id);
	    if (index > -1) {
		    watching[socket.auction].splice(index, 1);
		}
		socket.leave(socket.room);		
	});

});

function updateUsers(room) {
	io.sockets.in(room).emit('updateusers', usernames[room]);
}

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