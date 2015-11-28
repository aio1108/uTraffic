var async = require('async'),
    _ = require('underscore'),
    Distance = require('geo-distance-safe'),
    density = {
        '100 m': 21.0,
        '500 m': 509.0,
        '1 km': 2035.0,
        '5 km': 50868.0
    },
    scores = {
        train: 2.0,
        bus: 11.0,
        MRT: 8.0,
        THSR: 1.0,
        airport: 1.0,
        highway: 7.0,
        shuttle: 2.0,
        bike: 6.0,
        parking_lot: 1.0,
        population: 1.0
    },
    TUNING_FACTOR = 0.8,
    TOTAL_SCORE = _.reduce(_.keys(scores), function(memo, key){ return memo + scores[key] }, 0);

function calculate(next){
    var results = this.results || null,
        center = this.center || null,
        weight = this.weight || 0.0,
        distance = this.distance || null,
        population = this.population || null;

    if(center === null || results === null || distance === null || population === null){
        next({ error: 'Wrong parameter.' });
        return;
    }

    async.parallel(
        {
            train: (_calculate).bind({ items: results.train, center: center, type: 'train', distance: distance }),
            shuttle: (_calculate).bind({ items: results.shuttle, center: center, type: 'shuttle', distance: distance }),
            parking_lot: (_calculate).bind({ items: results.parking_lot, center: center, type: 'parking_lot', distance: distance }),
            airport: (_calculate).bind({ items: results.airport, center: center, type: 'airport', distance: distance }),
            MRT: (_calculate).bind({ items: results.MRT, center: center, type: 'MRT', distance: distance }),
            THSR: (_calculate).bind({ items: results.THSR, center: center, type: 'THSR', distance: distance }),
            highway: (_calculate).bind({ items: results.highway, center: center, type: 'highway', distance: distance }),
            bus: (_calculate).bind({ items: results.bus, center: center, type: 'bus', distance: distance }),
            bike: (_calculate).bind({ items: results.bike, center: center, type: 'bike', distance: distance }),
            population: (_calculate_population).bind({ population: population, type: 'population', distance: distance })
        },
        function(err, scores){
            if(err){
                next(err);
                return;
            }
            next(null, (((scores.train + scores.shuttle + scores.airport + scores.MRT + scores.THSR + scores.highway + scores.highway + scores.bus + scores.bike + scores.population) * weight * 100) / TUNING_FACTOR));
        }
    );
}

function _calculate_population(next){
    var population = this.population,
        type = this.type,
        score = scores[type] || 0.0
        distance = this.distance,
        dens = density[distance];
    next(null, (population <= dens)?(score / TOTAL_SCORE):0.0);
}

function _calculate(next){
    var items = this.items,
        center = this.center,
        type = this.type,
        distance = this.distance;
    async.detect(
        items,
        function(item, cb){
            var from = { lon: center[0], lat: center[1]},
                to = { lon: item.geometry.coordinates[0], lat: item.geometry.coordinates[1]},
                dis = Distance.between(from, to);
            cb((dis < Distance(distance))?true:false);
        },
        function(result){
            var score = scores[type] || 0.0;

            if(typeof result === 'undefined'){
                next(null, 0.0);
                return;
            }

            next(null, (score / TOTAL_SCORE));
        }
    );
}

exports.calculate = calculate;