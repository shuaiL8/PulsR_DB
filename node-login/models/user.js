'use strict';

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({

	name 			: String,
	email			: {type: String, unique: true},
	hashed_password	: String,
	created_at		: String,
	temp_password	: String,
	temp_password_time: String

});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/node-android-push');

module.exports = mongoose.model('user', userSchema);
