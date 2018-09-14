var express = require('express');
var router = express.Router();
var user=require('../business/userInfo');
router.post('/login', user.login);

module.exports = router;