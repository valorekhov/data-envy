'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var entrySchema = mongoose.Schema({
    _id: Number,
    date: Date,
    duration: Number,
    source: Number,
    mVac: Number,
    freq: Number,
    mVdc: Number,
    mAdc: Number,
    tempC: Number,
    joules: Number
});

var Entry = mongoose.model('Entry', entrySchema);

module.exports = function() {

    mongoose.connect('mongodb://localhost/envy');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('connected to db');
    });

    function log(batch){
        //console.log(batch);

        var promises = batch.map(entry=>Entry.findByIdAndUpdate(entry._id, entry, {upsert:true}));        
        return Promise.all(promises).then(()=>promises.length);
    }

    return {log: log};
}