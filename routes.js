'use strict';

var xmlparser = require('express-xml-bodyparser');
var zlib = require('zlib');
//var fs = require('fs');
var qs = require('qs');
var request = require('request');
var libxml = require('libxmljs');
var logger = require('./logger')();
var moment = require('moment');

module.exports = function(app){
  
  //app.use(xmlparser());

  app.use(function(req, res, next) {
    var data = [];
    req.addListener("data", function(chunk) {
        data.push(new Buffer(chunk));
    });
    req.addListener("end", function() {
        var buffer = Buffer.concat(data);
        req.rawBody = buffer;

        if (req.headers['content-type'] === 'application/x-deflate'){

        	zlib.inflate(buffer, function(err, result) {
            	if (!err) {
                	req.body = qs.parse(result.toString());
                	next();
            	} else {
               	 next(err);
            	}
        	});
        } else {
		req.body = qs.parse(buffer.toString());
		next();
        }
    });
  });
  
  app.get('/ping', function(req,res){
      res.json(true);
  });
  
  app.post('/*', function (req, res, next) {
    // var ticks = (new Date().getTime() * 10000) + 621355968000000000;
    // var name = req.url.substring(1).replace('/', '_') + '_' + ticks;
    // fs.writeFile('./spool/' + name + '.xml', req.body.body);

    var xml = libxml.parseXmlString(req.body.body);
    var entries = xml.find('//reading');
    if (entries.length > 0){
	var ret = entries.map((node)=>{
	     var arr = node.attr('stats').value().split(',');
	     return {
            _id: parseInt(node.attr('id').value()),
            date: moment.unix( parseInt(node.attr('date').value()) ).toDate(),
            duration: parseInt(node.attr('duration').value()),
            source: parseInt(node.attr('eqid').value().replace('.1', '')),
            mVac: parseInt(arr[0]),
            freq: parseInt(arr[1]),
            mVdc: parseInt(arr[2]),  
            mAdc: parseInt(arr[3]),
            tempC: parseInt(arr[4]),
            joules: parseInt(arr[7]) 
        }});
    }
    
    logger.log(ret).then((savedCount)=>{
        console.log(req.url, req.body.emu_serial_num, ret.length, savedCount);

        var targetUrl = 'https://'+req.headers.host + req.url;

        delete req.headers.connection;
        //console.log(req.headers);

        if (req.rawBody && !req.headers['x-debug']){
            //console.log(targetUrl);
            request({
                body: req.rawBody,
                    url: targetUrl,
                    method: 'POST',
                    headers: req.headers
                }).pipe(res); 
            } else {
                res.end();
            }        
    });
    
  });
}
