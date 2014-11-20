var watching = {}

io.sockets.on('connection', function (socket) {
	socket.on('watchingAuction', function(auction) {
		socket.auction = auction;
		socket.join(auction);
		io.sockets.in(auction).emit('updateViewersData', 'connected');
		if (watching[auction] == undefined) {
			watching[auction] = [];
			watching[auction].push(socket.username);
		} else {
			watching[auction].push(socket.username);			
		}
		updateCurrentWatchers(auction);
	});
	
	socket.on('disconnect', function(){
		auction = socket.auction;
		if (watching[auction] != undefined) {
			var user_index = watching[auction].indexOf(socket.username);
		    if (user_index > -1) {
			    watching[auction].splice(user_index, 1);
			}
			updateCurrentWatchers(auction);
		}
		socket.leave(socket.auction);		
	});

});

function updateCurrentWatchers(auction) {
	currentWatchers = watching[auction].length;
	io.sockets.in(auction).emit('updateCurrentWatchers', currentWatchers);
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
