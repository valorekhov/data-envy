var xmlparser = require('express-xml-bodyparser');
var zlib = require('zlib');
var fs = require('fs');
var qs = require('qs');
var request = require('request');
var libxml = require("libxmljs");

module.exports = function(app){
  
  //app.use(xmlparser());

  app.use(function(req, res, next) {
    var data = [];
    req.addListener("data", function(chunk) {
        data.push(new Buffer(chunk));
    });
    req.addListener("end", function() {
        buffer = Buffer.concat(data);
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
  
  app.post('/*', function (req, res, next) {
    console.log(req.url, req.body.emu_serial_num);

    var ticks = (new Date().getTime() * 10000) + 621355968000000000;
    var name = req.url.substring(1).replace('/', '_') + '_' + ticks;
    fs.writeFile('./spool/' + name + '.xml', req.body.body);

    var xml = libxml.parseXmlString(req.body.body);
    var entries = xml.find('//reading');
    if (entries.length > 0){
	var ret = entries.map(function(node){
	     var arr = node.attr('stats').value().split(',');
	     return {
		duration: parseInt(node.attr('duration').value()),
		date: parseInt(node.attr('date').value()),
		id: parseInt(node.attr('id').value()),
		source: parseInt(node.attr('eqid').value().replace('.1', '')),
		mVac: parseInt(arr[0]),
		freq: parseInt(arr[1]) / 1000,
		mVdc: parseInt(arr[2]),  
		mAdc: parseInt(arr[3]),
		tempC: parseInt(arr[4]),
		wattSec: parseInt(arr[7]) 
	}});
	console.log(ret);
    }

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
    }/*, function(postError, response, body){
         if (postError || (response && response.statusCode !== 200)){
		console.log(postError, response && response.headers, body);
		next(postError);
         } else {
                console.log(response.headers, body);
		Object.keys(response.headers).forEach(function(key){
			if (key !== 'connection' && key !=='content-length')
				res.setHeader(key, response.headers[key]);
		});

		res.status(200).write(body);
		res.end();	
	 }
    }*/).pipe(res); 
    } else {
	res.end();
    }
  });
}
