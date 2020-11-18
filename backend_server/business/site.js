var Mongoose = require("mongoose");
var SiteModel = require("../models/siteModel");
var ScheduleTask = require("../business/scheduleTask");
var util = require("../utils/util");
var mongoose = require("mongoose");
/* system listing. */
exports.list = function (req, res, next) {
  if (req.userId === util.adminUserId) {
    SiteModel.find(function (err, r) {
      if (!err) {
        res.json(
          util.resJson({
            IsSuccess: true,
            Data: r,
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
  } else {
    SiteModel.find({ userId: req.userId }, function (err, r) {
      if (!err) {
        res.json(
          util.resJson({
            IsSuccess: true,
            Data: r,
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
  }
};

exports.create = function (req, res, next) {
  var ObjectId = mongoose.Types.ObjectId;
  var id1 = new ObjectId();
  var temp = new SiteModel({
    appName: req.body.appName,
    disableHook: false,
    disableJS: false,
    appKey: id1,
    id: id1,
    userId: req.userId,
  });
  temp.save(function (err, r) {
    console.log(err);

    if (!err) {
      res.json(
        util.resJson({
          IsSuccess: true,
          Data: r,
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

exports.update = function (req, res, next) {
  let id = new Mongoose.Types.ObjectId(req.body.id);
  SiteModel.findOneAndUpdate(
    {
      id: id,
    },
    {
      disableHook: req.body.disableHook,
      disableJS: req.body.disableJS,
      disableResource: req.body.disableResource,
    },
    function (err, r) {
      if (!err) {
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
            Data: null,
          })
        );
      }
    }
  );
};

//js错误报警
exports.alarmJsErrorUpdate = function (req, res, next) {
  let id = new Mongoose.Types.ObjectId(req.body.id);
  ScheduleTask.createTask({
    appKey: req.body.id,
    email: req.body.email,
    alarmType: "jsError",
    times: req.body.alarmTimes,
    state: req.body.alarmState,
    limitValue: req.body.alarmLimit,
  });

  SiteModel.findOneAndUpdate(
    {
      id: id,
    },
    {
      alarmJsState: req.body.alarmState,
      alarmJsLimit: req.body.alarmLimit,
      alarmJsTimes: req.body.alarmTimes,
      alarmJsEmail: req.body.email,
    },
    function (err, r) {
      if (!err) {
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
            Data: null,
          })
        );
      }
    }
  );
};

//api错误报警
exports.alarmApiErrorUpdate = function (req, res, next) {
  let id = new Mongoose.Types.ObjectId(req.body.id);
  ScheduleTask.createTask({
    appKey: req.body.id,
    email: req.body.email,
    alarmType: "apiError",
    times: req.body.alarmTimes,
    state: req.body.alarmState,
    limitValue: req.body.alarmLimit,
  });

  SiteModel.findOneAndUpdate(
    {
      id: id,
    },
    {
      alarmApiState: req.body.alarmState,
      alarmApiLimit: req.body.alarmLimit,
      alarmApiTimes: req.body.alarmTimes,
      alarmApiEmail: req.body.email,
    },
    function (err, r) {
      if (!err) {
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
            Data: null,
          })
        );
      }
    }
  );
};

//perf报警
exports.alarmPerfSpeedUpdate = function (req, res, next) {
  let id = new Mongoose.Types.ObjectId(req.body.id);
  ScheduleTask.createTask({
    appKey: req.body.id,
    email: req.body.email,
    alarmType: "perfSpeed",
    times: req.body.alarmTimes,
    state: req.body.alarmState,
    limitValue: req.body.alarmLimit,
  });

  SiteModel.findOneAndUpdate(
    {
      id: id,
    },
    {
      alarmPerfState: req.body.alarmState,
      alarmPerfLimit: req.body.alarmLimit,
      alarmPerfTimes: req.body.alarmTimes,
      alarmPerfEmail: req.body.email,
    },
    function (err, r) {
      if (!err) {
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
            Data: null,
          })
        );
      }
    }
  );
};
