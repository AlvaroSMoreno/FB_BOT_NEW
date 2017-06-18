var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var ip_path = __dirname + '/files/ip_file.txt';

module.exports = HomeAutomation;

function HomeAutomation () {
	if (! (this instanceof HomeAutomation)) return new HomeAutomation;

	EventEmitter.call(this);
}

inherits(HomeAutomation, EventEmitter);

HomeAutomation.prototype.start = function start () {
	var self = this;
	var file;
	var state = false;
	var ant_state = false;
	//var count = 0;

	self._interval = setInterval(function (){
		fs.stat(ip_path, function (err, stat){
			state = false;
			if (err == null)
			{
				file = fs.readFileSync(ip_path).toString().split('\n');

				for (var i = 2; i < file.length; i++)
				{
					if (file[i].toString().toLowerCase().includes('respuesta desde 192.168.1.253: bytes=32'))
					{
						state = true;
						break;
					}	
				}

				if (ant_state !== state) self.emit('location_evt', state);

				ant_state = state;
			}
		});
	}, 3000);
};