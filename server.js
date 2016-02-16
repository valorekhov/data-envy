var https = require('https');
var fs = require('fs');
var routes = require('./routes');
var express = require('express');

var app = express();

var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

/*
var server = https.createServer(options, function (req,res) {
   console.log(req.url);
   console.log(req.headers);
   
   req.on('data', function(chunk) {
      console.log("Received body data:");
      console.log(chunk.toString());
    });


   req.on('end', function() {
      // empty 200 OK response for now
      res.writeHead(200, "OK", {'Content-Type': 'text/html'});
      res.end();
    });


}).listen(4430);
*/

var server = https.createServer(options, app);
routes(app);
server.listen(4430);
console.log('proxy running');
