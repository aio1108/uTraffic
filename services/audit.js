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
        train: 3.0,
        bus: 5.0,
        MRT: 5.0,
        THSR: 2.0,
        airport: 1.0,
        highway: 3.0,
        shuttle: 3.0,
        bike: 4.0,
        parking_lot: 2.0,
        population: 1.0
    },
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
            train: (_calculate).bind({ items: results.train, center: [121.654129, 25.074020], type: 'train', distance: distance }),
            shuttle: (_calculate).bind({ items: results.shuttle, center: [121.654129, 25.074020], type: 'shuttle', distance: distance }),
            parking_lot: (_calculate).bind({ items: results.parking_lot, center: [121.654129, 25.074020], type: 'parking_lot', distance: distance }),
            airport: (_calculate).bind({ items: results.airport, center: [121.654129, 25.074020], type: 'airport', distance: distance }),
            MRT: (_calculate).bind({ items: results.MRT, center: [121.654129, 25.074020], type: 'MRT', distance: distance }),
            THSR: (_calculate).bind({ items: results.THSR, center: [121.654129, 25.074020], type: 'THSR', distance: distance }),
            highway: (_calculate).bind({ items: results.highway, center: [121.654129, 25.074020], type: 'highway', distance: distance }),
            bus: (_calculate).bind({ items: results.bus, center: [121.654129, 25.074020], type: 'bus', distance: distance }),
            bike: (_calculate).bind({ items: results.bike, center: [121.654129, 25.074020], type: 'bike', distance: distance }),
            population: (_calculate_population).bind({ population: population, type: 'population', distance: distance })
        },
        function(err, scores){
            if(err){
                next(err);
                return;
            }
            console.log(scores);
            next(null, ((scores.train + scores.shuttle + scores.airport + scores.MRT + scores.THSR + scores.highway + scores.highway + scores.bus + scores.bike + scores.population) * weight * 100));
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