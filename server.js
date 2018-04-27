'use strict';

const https = require('https');
const fs = require('fs');
const routes = require('./routes');
const express = require('express');

const { MqttLogger } = require('./logger');

let app = express();

let options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

let server = https.createServer(options, app);

const mqttHostInfo = require('./mqtt-connection-info.json');
let logger = new MqttLogger(mqttHostInfo.host, mqttHostInfo.userName, mqttHostInfo.password, mqttHostInfo.rootTopic);

console.log('Connecting to', mqttHostInfo.host);
logger.connect(mqttHostInfo.will)
        .then(()=>{
            console.log('Connected to MQTT');
            routes(app, logger);
            server.listen(4430);
            console.log('Proxy running');
        })
        .catch(e=>{
            console.error(e);
            process.exit(1);
        });

