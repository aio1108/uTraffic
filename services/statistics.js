var async= require('async'),
    _ = require('underscore'),
    Distance = require('geo-distance-safe');

function classify(coordinate, obj, cb){
    var DEFAULT_RESULT = {
            "500m": {
                train: 0,
                shuttle: 0,
                parking_lot: 0,
                airport: 0,
                MRT: 0,
                THSR: 0,
                highway: 0,
                bus: 0,
                bike: 0
            },
            "1km": {
                train: 0,
                shuttle: 0,
                parking_lot: 0,
                airport: 0,
                MRT: 0,
                THSR: 0,
                highway: 0,
                bus: 0,
                bike: 0
            },
            "5km": {
                train: 0,
                shuttle: 0,
                parking_lot: 0,
                airport: 0,
                MRT: 0,
                THSR: 0,
                highway: 0,
                bus: 0,
                bike: 0
            }
        },
        result = _.extend({}, DEFAULT_RESULT);

    async.forEachOf(
        obj,
        function(item, key, next){
            result['5km'][key] += item.length;
            async.each(
                item,
                function(landmark, callback){
                    var from = coordinate,
                        to = { lon: landmark.geometry.coordinates[0], lat: landmark.geometry.coordinates[1]},
                        dis = Distance.between(from, to);

                    if(dis <= Distance('500 m')){
                        result['500m'][key] += 1;
                    }

                    if(dis <= Distance('1 km')){
                        result['1km'][key] += 1;
                    }

                    callback(null);
                },
                function(err){
                    if(err){
                        console.log(err);
                        next(err);
                        return;
                    }
                    next(null);
                }
            );
        },
        function(err){
            if(err){
                console.log(err);
                cb(err);
                return;
            }
            cb(null, result);
        }
    );
}

exports.classify = classify;