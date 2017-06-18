var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var ip_path = __dirname + '/files/ips/ip_file.txt';

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
	var count = 0;
	var flag = false;

	self._interval = setInterval(function (){
		fs.stat(ip_path, function (err, stat){
			state = false;
			if (err == null)
			{
				file = fs.readFileSync(ip_path).toString().split('\n');

				state = (file.length >= 4)? true : false;

				if (ant_state !== state) self.emit('location_evt', state);

				ant_state = state;
			}
			else if (err.code == 'ENOENT')
			{
				// Archivo no encontrado!
			}
		});
	}, 3000);
};