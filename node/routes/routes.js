'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');
const register = require('../functions/register');
const login = require('../functions/login');
const profile = require('../functions/profile');
const password = require('../functions/password');
const config = require('../config/config.json');
var constants = require('../constants/constants.json');
var registerDevice = require('../functions/registerDevice');
var devicesFunction = require('../functions/devices');
var deleteFunction = require('../functions/delete');
var sendFunction = require('../functions/send-message');


module.exports = function(app,io) {


	io.on('connection', function(socket){

		console.log("Client Connected");
		socket.emit('update', { message: 'Hello Client',update:false });

  		socket.on('update', function(msg){

    		console.log(msg);
  		});
	});

	app.get('/',function(req,res) {

		res.sendFile('index.html');

	});

	app.get('/devices',function(req,res) {

		devicesFunction.listDevices(function(result) {

			res.json(result);

		});
	});

	app.delete('/devices/:device',function(req,res) {

		var registrationId = req.params.device;

		deleteFunction.removeDevice(registrationId,function(result) {

			res.json(result);

		});


	});

	app.post('/send',function(req,res){

		var message = req.body.message;
		var registrationId = req.body.registrationId;

		sendFunction.sendMessage(message,registrationId,function(result){

			res.json(result);
		});
	});

	app.post('/authenticate',function (req, res) {

		const credentials = auth(req);

		if (!credentials) {

			res.status(400).json({ message: 'Invalid Request !' });

		} else {

			login.loginUser(credentials.name, credentials.pass)

			.then(result => {

				const token = jwt.sign(result, config.secret, { expiresIn: 1440 });

				res.status(result.status).json({ message: result.message, token: token });

			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	app.post('/users',function (req, res) {

		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;

		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

			res.status(400).json({message: 'Invalid Request !'});

		} else {

			register.registerUser(name, email, password)

			.then(result => {

				res.setHeader('Location', '/users/'+email);
				res.status(result.status).json({ message: result.message })
			})

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	app.get('/users/:id',function (req,res) {

		if (checkToken(req)) {

			profile.getProfile(req.params.id)

			.then(result => res.json(result))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			res.status(401).json({ message: 'Invalid Token !' });
		}
	});

	app.put('/users/:id',function (req,res) {

		if (checkToken(req)) {

			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

				res.status(400).json({ message: 'Invalid Request !' });

			} else {

				password.changePassword(req.params.id, oldPassword, newPassword)

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));

			}
		} else {

			res.status(401).json({ message: 'Invalid Token !' });
		}
	});

	app.post('/devices',function(req,res) {

		var deviceName = req.body.deviceName;
		var deviceId   = req.body.deviceId;
		var registrationId = req.body.registrationId;

		if ( typeof deviceName  == 'undefined' || typeof deviceId == 'undefined' || typeof registrationId  == 'undefined' ) {

			console.log(constants.error.msg_invalid_param.message);

			res.json(constants.error.msg_invalid_param);

		} else if ( !deviceName.trim() || !deviceId.trim() || !registrationId.trim() ) {

			console.log(constants.error.msg_empty_param.message);

			res.json(constants.error.msg_empty_param);

		} else {

			registerDevice.register( deviceName, deviceId, registrationId, function(result) {

				res.json(result);

				if (result.result != 'error'){

					io.emit('update', { message: 'New Device Added',update:true});

				}
			});
		}
	});

	app.post('/users/:id/password',function (req,res) {

		const email = req.params.id;
		const token = req.body.token;
		const newPassword = req.body.password;

		if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

			password.resetPasswordInit(email)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));

		} else {

			password.resetPasswordFinish(email, token, newPassword)

			.then(result => res.status(result.status).json({ message: result.message }))

			.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	function checkToken(req) {

		const token = req.headers['x-access-token'];

		if (token) {

			try {

					var decoded = jwt.verify(token, config.secret);

					return decoded.message === req.params.id;

			} catch(err) {

				return false;
			}

		} else {

			return false;
		}
	}
}
