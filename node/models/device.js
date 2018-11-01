var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deviceSchema = mongoose.Schema({

	deviceName 		: String,
	deviceId		: String,
	registrationId	: String

});

mongoose.createConnection('mongodb://localhost:27017/node-PulsR');

module.exports = mongoose.model('device', deviceSchema);
