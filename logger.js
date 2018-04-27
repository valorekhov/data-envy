'use strict';

const mqtt = require('async-mqtt');

class MqttLogger{

    constructor(host, userName, password, rootTopic){
        this.host = host;
        this.userName = userName;
        this.password = password;
        this.rootTopic = rootTopic || 'envd'
    }

    connect(will){
        if (will){
            will.payload = will.payload || '0';  
        }
        return new Promise((resolve, reject)=>{
            this.client = mqtt.connect(this.host, {
                clientId: 'envd-mqtt', 
                username: this.userName, 
                password: this.password,
                connectTimeout: 10*1000,
                will: will
            });

            this.client.on('connect', ()=>{
                if (will && will.topic){
                    console.log('Setting up will on', will.topic);
                    this.client.publish(will.topic, '1', null, resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    log(message){
        try {
            return this.client.publish(this.rootTopic, JSON.stringify(message));
        } catch (e){
            console.log(e.stack);
        }
    }
}

module.exports = { MqttLogger }