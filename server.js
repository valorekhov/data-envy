'use strict';

var https = require('https');
var fs = require('fs');
var routes = require('./routes');
var express = require('express');

var app = express();

var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

var server = https.createServer(options, app);
routes(app);
server.listen(4430);
console.log('proxy running');
