var Mongoose = require('mongoose');
var FocusClickModel = require('../models/focusClickModel');
var _ = require('lodash');
var util = require('../utils/util');


exports.create = (data) => {
    var temp = new FocusClickModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};