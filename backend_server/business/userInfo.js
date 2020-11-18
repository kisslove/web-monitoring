var Mongoose = require("mongoose");
var UserModel = require("../models/userModel");
var util = require("../utils/util");
var mongoose = require("mongoose");
var AES = require("crypto-js/aes");

exports.createAdmin = async (email) => {
  let r = await UserModel.find({
    id: util.adminUserId,
  });
  if (r && r.length > 0) {
    return;
  }
  var ObjectId = mongoose.Types.ObjectId;
  var id1 = new ObjectId(util.adminUserId);
  let token = util.encrypt(id1 + "@" + new Date());
  var temp = new UserModel({
    email: email,
    password:`9f2c1604c8ceec9943fd69f96220a8d1`,
    id: id1,
    token: token,
  });

  temp.save(function (err, r) {
    console.log(err);
    if (!err) {
      console.log("管理员初始化成功");
    } else {
      console.log("管理员初始化失败");
    }
  });
};

exports.create = async (req, res, next) => {
  let body = req.body;
  let r = await UserModel.find({
    email: body.email,
  });
  if (r && r.length > 0) {
    res.json(
      util.resJson({
        IsSuccess: false,
        Data: "邮箱已存在",
      })
    );
    return;
  }
  var ObjectId = mongoose.Types.ObjectId;
  var id1 = new ObjectId();
  let token = util.encrypt(id1 + "@" + new Date());
  var temp = new UserModel({
    email: body.email,
    password: body.password,
    id: id1,
    token: token,
  });

  temp.save(function (err, r) {
    console.log(err);
    if (!err) {
      res.json(
        util.resJson({
          IsSuccess: true,
          Data: {
            userName: body.email,
            userId: id1,
            token: token,
          },
        })
      );
    } else {
      res.json(
        util.resJson({
          IsSuccess: false,
          Data: null,
        })
      );
    }
  });
};

exports.login = async (req, res, next) => {
  let body = req.body;
  let r = await UserModel.find({
    email: body.email,
  });
  if (r && r.length == 0) {
    res.json(
      util.resJson({
        IsSuccess: false,
        Data: "用户名不存在",
      })
    );
    return;
  }
  if (r[0].password != body.password) {
    res.json(
      util.resJson({
        IsSuccess: false,
        Data: "用户名或密码错误",
      })
    );
    return;
  }

  if (r[0].password == body.password) {
    let token = util.encrypt(r[0].id + "@" + new Date());
    UserModel.findOneAndUpdate(
      {
        id: new mongoose.Types.ObjectId(r[0].id),
      },
      {
        token: token,
      },
      (err) => {
        if (!err) {
          res.json(
            util.resJson({
              IsSuccess: true,
              Data: {
                userName: r[0].email,
                userId: r[0].id,
                token: token,
              },
            })
          );
        } else {
          res.json(
            util.resJson({
              IsSuccess: false,
              Data: "更新token失败",
            })
          );
        }
      }
    );
  }
};

exports.validToken = async (userId) => {
  let r = await UserModel.find({
    id: new mongoose.Types.ObjectId(userId),
  });
  if (r && r.length == 0) {
    return false;
  }
  return r[0];
};

exports.logout = async (req, res, next) => {
  let query = req.query;
  let r = await UserModel.findOneAndUpdate(
    {
      id: new mongoose.Types.ObjectId(query.id),
    },
    {
      token: null,
    }
  );
  if (r) {
    res.json(
      util.resJson({
        IsSuccess: true,
        Data: null,
      })
    );
  } else {
    res.json(
      util.resJson({
        IsSuccess: false,
        Data: "更新出错",
      })
    );
  }
};
