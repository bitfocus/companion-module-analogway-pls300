// Analog Way Pulse 300 TCP / UDP

const { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper, UDPHelper, combineRgb, Regex } = require('@companion-module/base')

class AnalogWayPLS300Instance extends InstanceBase {
	constructor(internal) {
		super(internal)
		
		this.socket = undefined
		this.udp = undefined
		this.frozen = false
	}

	async init(config) {
		this.config = config
		
		this.setActionDefinitions(this.getActions())
		this.setPresetDefinitions(this.getPresets())
		this.setVariableDefinitions([])
		this.setFeedbackDefinitions({})
		
		this.initConnection()
	}

	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			this.socket = undefined
		}

		if (this.udp !== undefined) {
			this.udp.destroy()
			this.udp = undefined
		}
	}

	async configUpdated(config) {
		this.config = config
		
		if (this.udp !== undefined) {
			this.udp.destroy()
			this.udp = undefined
		}

		if (this.socket !== undefined) {
			this.socket.destroy()
			this.socket = undefined
		}

		this.initConnection()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP
			},
			{
				type: 'dropdown',
				id: 'prot',
				label: 'Connect with TCP / UDP',
				default: 'tcp',
				choices: [
					{ id: 'udp', label: 'UDP' },
					{ id: 'tcp', label: 'TCP' }
				]
			}
		]
	}

	initConnection() {
		if (this.config.prot == 'tcp') {
			this.init_tcp()
		} else if (this.config.prot == 'udp') {
			this.init_udp()
		}
	}

	init_udp() {
		if (this.udp !== undefined) {
			this.udp.destroy()
			this.udp = undefined
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host !== undefined) {
			this.udp = new UDPHelper(this.config.host, 10500)

			this.udp.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			})

			// If we get data, thing should be good
			this.udp.on('data', () => {
				this.updateStatus(InstanceStatus.Ok)
			})

			this.udp.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})
		}
	}

	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			this.socket = undefined
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, 10500)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			})

			this.socket.on('connect', () => {
				this.updateStatus(InstanceStatus.Ok)
				this.log('info', 'Connected')
			})

			this.socket.on('data', (data) => {
				// Handle incoming data if needed
			})
		}
	}

	getActions() {
		const CHOICES_INPUTS = [
			{ id: '0', label: 'No Input' },
			{ id: '1', label: 'Input 1' },
			{ id: '2', label: 'Input 2' },
			{ id: '3', label: 'Input 3' },
			{ id: '4', label: 'Input 4' },
			{ id: '5', label: 'Input 5' },
			{ id: '6', label: 'Input 6' },
			{ id: '9', label: 'DVI 1' },
			{ id: '10', label: 'DVI 2' },
			{ id: '11', label: 'SDI 1' },
			{ id: '12', label: 'SDI 2' }
		]

		const CHOICES_LAYERS = [
			{ id: '2', label: 'BG Live' },
			{ id: '3', label: 'PiP 1 (BG Live 2 in Matrix)' }
		]

		const CHOICES_FRAMES = [
			{ id: '0', label: 'No Frame' },
			{ id: '1', label: 'Frame 1' },
			{ id: '2', label: 'Frame 2' },
			{ id: '3', label: 'Frame 3' },
			{ id: '4', label: 'Frame 4' },
			{ id: '5', label: 'Frame 5' },
			{ id: '6', label: 'Frame 6' }
		]

		const CHOICES_PRESETS = [
			{ id: '3', label: 'Preset 1' },
			{ id: '4', label: 'Preset 2' },
			{ id: '5', label: 'Preset 3' },
			{ id: '6', label: 'Preset 4' }
		]

		return {
			take: {
				name: 'Take',
				options: [],
				callback: (action) => {
					this.sendCommand('1TK \r\n 1TK')
				}
			},
			freeze: {
				name: 'Freeze (All Inputs)',
				options: [],
				callback: (action) => {
					let cmd = ''
					if (this.frozen == false) {
						for (let choice of CHOICES_INPUTS) {
							let id = choice.id
							cmd += id + ',1Sf \r\n ' + id + ',1Sf \r\n'
						}
						this.frozen = true
					} else {
						for (let choice of CHOICES_INPUTS) {
							let id = choice.id
							cmd += id + ',0Sf \r\n ' + id + ',0Sf \r\n'
						}
						this.frozen = false
					}
					this.sendCommand(cmd)
				}
			},
			in: {
				name: 'Input',
				options: [
					{
						type: 'dropdown',
						label: 'Layer',
						id: 'layer',
						default: '2',
						choices: CHOICES_LAYERS
					},
					{
						type: 'dropdown',
						label: 'Input',
						id: 'input',
						default: '0',
						choices: CHOICES_INPUTS
					}
				],
				callback: (action) => {
					const cmd = '1,' + action.options.layer + ',' + action.options.input + 'IN' + '\r\n' + '1,' + action.options.layer + ',' + action.options.input + 'IN'
					this.sendCommand(cmd)
				}
			},
			fr: {
				name: 'Background Frame',
				options: [
					{
						type: 'dropdown',
						label: 'Frame',
						id: 'frame',
						default: '0',
						choices: CHOICES_FRAMES
					}
				],
				callback: (action) => {
					const cmd = '1,0,' + action.options.frame + 'IN' + '\r\n' + '1,0,' + action.options.frame + 'IN'
					this.sendCommand(cmd)
				}
			},
			ps: {
				name: 'User Preset',
				options: [
					{
						type: 'dropdown',
						label: 'Preset',
						id: 'preset',
						default: '3',
						choices: CHOICES_PRESETS
					}
				],
				callback: (action) => {
					const cmd = '' + action.options.preset + 'Nf \r\n 1Nt1Nc' + '\r\n' + '' + action.options.preset + 'Nf \r\n 1Nt1Nc'
					this.sendCommand(cmd)
				}
			}
		}
	}

	sendCommand(cmd) {
		if (this.config.prot == 'tcp') {
			if (cmd !== undefined) {
				this.log('debug', `Sending TCP: ${cmd} to ${this.config.host}`)

				if (this.socket !== undefined && this.socket.isConnected) {
					this.socket.send(cmd)
				} else {
					this.log('warn', 'Socket not connected')
				}
			}
		}

		if (this.config.prot == 'udp') {
			if (cmd !== undefined) {
				if (this.udp !== undefined) {
					this.log('debug', `Sending UDP: ${cmd} to ${this.config.host}`)
					this.udp.send(cmd)
				}
			}
		}
	}

	getPresets() {
		const CHOICES_INPUTS = [
			{ id: '0', label: 'No Input', text: 'Black\\nLOGO' },
			{ id: '1', label: 'Input 1', text: 'In 1' },
			{ id: '2', label: 'Input 2', text: 'In 2' },
			{ id: '3', label: 'Input 3', text: 'In 3' },
			{ id: '4', label: 'Input 4', text: 'In 4' },
			{ id: '5', label: 'Input 5', text: 'In 5' },
			{ id: '6', label: 'Input 6', text: 'In 6' },
			{ id: '9', label: 'DVI 1', text: 'DVI 1' },
			{ id: '10', label: 'DVI 2', text: 'DVI 2' },
			{ id: '11', label: 'SDI 1', text: 'SDI 1' },
			{ id: '12', label: 'SDI 2', text: 'SDI 2' }
		]

		const CHOICES_LAYERS = [
			{ id: '2', label: 'BG Live', text: 'Bkgnd Live' },
			{ id: '3', label: 'PiP 1 (BG Live 2 in Matrix)', text: 'PiP 1/BG Live 2' }
		]

		const CHOICES_FRAMES = [
			{ id: '0', label: 'No Frame', text: 'No\\nFrame' },
			{ id: '1', label: 'Frame 1', text: 'Fr 1' },
			{ id: '2', label: 'Frame 2', text: 'Fr 2' },
			{ id: '3', label: 'Frame 3', text: 'Fr 3' },
			{ id: '4', label: 'Frame 4', text: 'Fr 4' },
			{ id: '5', label: 'Frame 5', text: 'Fr 5' },
			{ id: '6', label: 'Frame 6', text: 'Fr 6' }
		]

		const CHOICES_PRESETS = [
			{ id: '3', label: 'Preset 1', text: 'Preset\\n1' },
			{ id: '4', label: 'Preset 2', text: 'Preset\\n2' },
			{ id: '5', label: 'Preset 3', text: 'Preset\\n3' },
			{ id: '6', label: 'Preset 4', text: 'Preset\\n4' }
		]

		let presets = {}

		presets['take'] = {
			type: 'button',
			category: 'Program',
			name: 'Take',
			style: {
				text: 'Take',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 204, 0)
			},
			steps: [
				{
					down: [
						{
							actionId: 'take',
							options: {}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}

		presets['freeze'] = {
			type: 'button',
			category: 'Program',
			name: 'Freeze (All Inputs)',
			style: {
				text: 'Freeze (All Inputs)',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 204, 0)
			},
			steps: [
				{
					down: [
						{
							actionId: 'freeze',
							options: {}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}

		// Input presets
		for (let input of CHOICES_INPUTS) {
			presets[`input_${input.id}`] = {
				type: 'button',
				category: 'Inputs',
				name: input.label,
				style: {
					text: input.text,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'in',
								options: {
									layer: '2',
									input: input.id
								}
							}
						],
						up: []
					}
				],
				feedbacks: []
			}
		}

		// Frame presets
		for (let frame of CHOICES_FRAMES) {
			presets[`frame_${frame.id}`] = {
				type: 'button',
				category: 'Frames',
				name: frame.label,
				style: {
					text: frame.text,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'fr',
								options: {
									frame: frame.id
								}
							}
						],
						up: []
					}
				],
				feedbacks: []
			}
		}

		// Preset presets
		for (let preset of CHOICES_PRESETS) {
			presets[`preset_${preset.id}`] = {
				type: 'button',
				category: 'Presets',
				name: preset.label,
				style: {
					text: preset.text,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'ps',
								options: {
									preset: preset.id
								}
							}
						],
						up: []
					}
				],
				feedbacks: []
			}
		}

		return presets
	}
}

runEntrypoint(AnalogWayPLS300Instance, [])
