var express = require('express');
var router = express.Router();

var site = require('../business/site');

/* dashboard */
router.post('/SiteList', site.list);
router.get('/SiteList', site.list);
router.post('/RegisterSite', site.create);

module.exports = router;