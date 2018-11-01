var mongoose = require('mongoose');
var request = require('request');
var device = require('../models/device');
var constants = require('../constants/constants.json');

exports.register = function(registrationId,currentHeartRate,currentSteps,currentCals,callback){


  var newData = new data({

    registrationId : registrationId,
		currentHeartRate : currentHeartRate,
		currentSteps   : currentSteps,
		currentCals : currentCals

	});



}
