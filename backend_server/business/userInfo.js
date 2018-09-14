var Mongoose = require('mongoose');
var UserModel = require('../models/userModel');
var util = require('../utils/util');
var mongoose = require('mongoose');

exports.create = async (req, res, next)=> {
    let body=req.body;
    let r= await UserModel.find({email:body.email});
    if(r){
        res.json(util.resJson({
            IsSuccess: false,
            Data: '邮箱已存在'
        }));
        return;
    }
    var ObjectId = mongoose.Types.ObjectId;
    var id1 = new ObjectId;
    var temp = new UserModel({
        email: body.email,
        password:null,
        id: id1
    });
    temp.save(function (err, r) {
        console.log(err);
        if (!err) {
            res.json(util.resJson({
                IsSuccess: true,
                Data: r
            }));
        } else {
            res.json(util.resJson({
                IsSuccess: false,
                Data: null
            }));
        }
    });

};


exports.login = async (req, res, next)=> {
    let body=req.body;
    let r= await UserModel.find({email:body.email});
    if(!r){
        res.json(util.resJson({
            IsSuccess: false,
            Data: '用户名不存在'
        }));
        return;
    }
    if(r[0].password!=body.password){
        res.json(util.resJson({
            IsSuccess: false,
            Data: '用户名或密码错误'
        }));
        return;
    }

    if(r[0].password==body.password){
        
        res.json(util.resJson({
            IsSuccess: true,
            Data: null
        }));
        return;
    }
};