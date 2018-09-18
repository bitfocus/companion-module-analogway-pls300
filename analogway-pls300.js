// Analog Way Pulse 300 TCP / UDP

var tcp           = require('../../tcp');
var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	if (self.config.prot == 'tcp') {
		self.init_tcp();
	};
	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();

	if (self.config.prot == 'tcp') {
		self.init_tcp();
	};

	if (self.config.prot == 'udp') {
		self.init_udp();
	};
};

instance.prototype.init_udp = function() {
	var self = this;

	if (self.udp !== undefined) {
		self.udp.destroy();
		delete self.udp;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host !== undefined) {
		self.udp = new udp(self.config.host, 10500);

		self.udp.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		// If we get data, thing should be good
		self.udp.on('data', function () {
			self.status(self.STATE_OK);
		});

		self.udp.on('status_change', function (status, message) {
			self.status(status, message);
		});
	}
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 10500);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'dropdown',
			id: 'prot',
			label: 'Connect with TCP / UDP',
			default: 'tcp',
			choices:  [
				{ id: 'udp', label: 'UDP' },
				{ id: 'tcp', label: 'TCP' }
			]
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}
	if (self.udp !== undefined) {
		self.udp.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

		presets.push({
			category: 'Program',
			label: 'Take',
			bank: {
				style: 'text',
				text: 'Take',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,255,0)
			},
			actions: [
				{
					action: 'take',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'No Input',
			bank: {
				style: 'text',
				text: 'Black/LOGO',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in0',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 1',
			bank: {
				style: 'text',
				text: 'In 1',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in1',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 2',
			bank: {
				style: 'text',
				text: 'In 2',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in2',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 3',
			bank: {
				style: 'text',
				text: 'In 3',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in3',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 4',
			bank: {
				style: 'text',
				text: 'In 4',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in4',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 5',
			bank: {
				style: 'text',
				text: 'In 5',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in5',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'Input 6',
			bank: {
				style: 'text',
				text: 'In 6',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in6',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'DVI 1',
			bank: {
				style: 'text',
				text: 'DVI 1',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in7',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'DVI 2',
			bank: {
				style: 'text',
				text: 'DVI 2',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in8',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'SDI 1',
			bank: {
				style: 'text',
				text: 'SDI 1',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in9',
				}
			]
		});

		presets.push({
			category: 'Inputs',
			label: 'SDI 2',
			bank: {
				style: 'text',
				text: 'SDI 2',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,153,204)
			},
			actions: [
				{
					action: 'in10',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'No Frame',
			bank: {
				style: 'text',
				text: 'No\\nFrame',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr0',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 1',
			bank: {
				style: 'text',
				text: 'Fr 1',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr1',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 2',
			bank: {
				style: 'text',
				text: 'Fr 2',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr2',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 3',
			bank: {
				style: 'text',
				text: 'Fr 3',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr3',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 4',
			bank: {
				style: 'text',
				text: 'Fr 4',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr4',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 5',
			bank: {
				style: 'text',
				text: 'Fr 5',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr5',
				}
			]
		});

		presets.push({
			category: 'Frames',
			label: 'Frame 6',
			bank: {
				style: 'text',
				text: 'Fr 6',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(88,88,58)
			},
			actions: [
				{
					action: 'fr6',
				}
			]
		});

		presets.push({
			category: 'Presets',
			label: 'Preset 1',
			bank: {
				style: 'text',
				text: 'Preset\\n1',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(153,153,102)
			},
			actions: [
				{
					action: 'ps1',
				}
			]
		});

		presets.push({
			category: 'Presets',
			label: 'Preset 2',
			bank: {
				style: 'text',
				text: 'Preset\\n2',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(153,153,102)
			},
			actions: [
				{
					action: 'ps2',
				}
			]
		});
		presets.push({
			category: 'Presets',
			label: 'Preset 3',
			bank: {
				style: 'text',
				text: 'Preset\\n3',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(153,153,102
			},
			actions: [
				{
					action: 'ps3',
				}
			]
		});

		presets.push({
			category: 'Presets',
			label: 'Preset 4',
			bank: {
				style: 'text',
				text: 'Preset\\n4',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(153,153,102)
			},
			actions: [
				{
					action: 'ps4',
				}
			]
		});

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'take':    { label: 'Take' },
		'in0':     { label: 'No Input' },
		'in1':     { label: 'Input 1' },
		'in2':     { label: 'Input 2' },
		'in3':     { label: 'Input 3' },
		'in4':     { label: 'Input 4' },
		'in5':     { label: 'Input 5' },
		'in6':     { label: 'Input 6' },
		'in7':     { label: 'DVI 1' },
		'in8':     { label: 'DVI 2' },
		'in9':     { label: 'SDI 1' },
		'in10':    { label: 'SDI 2' },
		'fr0':     { label: 'No Frame' },
		'fr1':     { label: 'Frame 1' },
		'fr2':     { label: 'Frame 2' },
		'fr3':     { label: 'Frame 3' },
		'fr4':     { label: 'Frame 4' },
		'fr5':     { label: 'Frame 5' },
		'fr6':     { label: 'Frame 6' },
		'ps1':     { label: 'Preset 1' },
		'ps2':     { label: 'Preset 2' },
		'ps3':     { label: 'Preset 3' },
		'ps4':     { label: 'Preset 4' },
		
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch(action.action){

		case 'take':
			cmd = 'TK1';
			break;
		case 'in0':
			cmd = '1,2,0IN';
			break;
		case 'in1':
			cmd = '1,2,1IN';
			break;
		case 'in2':
			cmd = '1,2,2IN';
			break;
		case 'in3':
			cmd = '1,2,3IN';
			break;
		case 'in4':
			cmd = '1,2,4IN';
			break;
		case 'in5':
			cmd = '1,2,5IN';
			break;
		case 'in6':
			cmd = '1,2,6IN';
			break;
		case 'in7':
			cmd = '1,2,9IN';
			break;
		case 'in8':
			cmd = '1,2,10IN';
			break;
		case 'in9':
			cmd = '1,2,11IN';
			break;
		case 'in10':
			cmd = '1,2,12IN';
			break;
		case 'fr0':
			cmd = '1,0,0IN';
			break;
		case 'fr1':
			cmd = '1,0,1IN';
			break;
		case 'fr2':
			cmd = '1,0,2IN';
			break;
		case 'fr3':
			cmd = '1,0,3IN';
			break;
		case 'fr4':
			cmd = '1,0,4IN';
			break;
		case 'fr5':
			cmd = '1,0,5IN';
			break;
		case 'fr6':
			cmd = '1,0,6IN';
			break;
		case 'ps1':
			cmd = '3Nf';
			cmd = '1Nt1Nc';
			break;
		case 'ps2':
			cmd = '4Nf';
			cmd = '1Nt1Nc';
			break;
		case 'ps3':
			cmd = '5Nf';
			cmd = '1Nt1Nc';
			break;
		case 'ps4':
			cmd = '6Nf';
			cmd = '1Nt1Nc';
			break;

		

	}
	if (self.config.prot == 'tcp') {
		if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd);
			} else {
				debug('Socket not connected :(');
			}
		}
	};
	if (self.config.prot == 'udp') {

		if (cmd !== undefined ) {

			if (self.udp !== undefined ) {
				debug('sending',cmd,"to",self.config.host);

				self.udp.send(cmd);
			}
		}
	};

};



instance.module_info = {
	label: 'Analog Way Pulse 300',
	id: 'pulse300',
	version: '1.2.0'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
