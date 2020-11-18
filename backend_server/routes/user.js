var express = require("express");
var router = express.Router();
var util = require("../utils/util");
var user = require("../business/userInfo");
router.post("/login", user.login);
router.post("/register", util.resolveToken, util.needAdminToken, user.create);
router.post("/logout", util.resolveToken, util.needToken, user.logout);

module.exports = router;
