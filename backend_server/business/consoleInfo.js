var Mongoose = require('mongoose');
var ConsoleModel = require('../models/consoleModel');

exports.create = (data) => {
    var temp = new ConsoleModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};