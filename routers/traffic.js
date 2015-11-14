var express = require('express'),
    async = require('async'),
    landmark = require('../services/landmark'),
    population = require('../services/population'),
    geocoding = require('../services/geocoding'),
    audit = require('../services/audit'),
    WEIGHTS = {
        '500 m': 0.80,
        '1 km': 0.15,
        '5 km': 0.05
    },
    router = express.Router();

router.post('/audit/address', function(req, res){
    var address = req.body.address;
    async.waterfall(
        [
            (geocoding.getCoordinate).bind({ address: address }),
            scoring
        ],
        function(err, result){
            if(err){
                res.status(500).json(err);
                return;
            }
            res.json(result);
        }
    );
});

router.post('/audit/position', function(req, res) {
    var lon = req.body.lon, //121.654129
        lat = req.body.lat; //25.074020

    scoring({lon: lon, lat: lat}, function(err, result){
        if(err){
            res.status(500).json(err);
            return;
        }
        res.json(result);
    });
});

function scoring(coordinate, cb){
    var lon = coordinate.lon,
        lat = coordinate.lat;
    async.parallel(
        {
            train: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [301] }),
            shuttle: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [302] }),
            parking_lot: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [303] }),
            airport: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [304] }),
            MRT: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [306] }),
            THSR: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [307] }),
            highway: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [308] }),
            bus: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [10100] }),
            bike: (landmark.search).bind({ position: [[lat, lon]], range: 5000, category: [10104] }),
            population_100m: (population.search).bind({ position: lat + ', ' + lon, radius: 100 }),
            population_500m: (population.search).bind({ position: lat + ', ' + lon, radius: 500 }),
            population_1km: (population.search).bind({ position: lat + ', ' + lon, radius: 1000 }),
            population_5km: (population.search).bind({ position: lat + ', ' + lon, radius: 5000 })
        },
        function(err, results){
            if(err){
                console.log(err);
                cb({ message: 'Unknow Error.' });
                return;
            }

            async.parallel(
                {
                    '500 m': (audit.calculate).bind({ results: results, distance: '500 m', population: results['population_500m']['features'][0]['properties']['population'], center: [lon, lat], weight: WEIGHTS['500 m'] }),
                    '1 km': (audit.calculate).bind({ results: results, distance: '1 km', population: results['population_1km']['features'][0]['properties']['population'], center: [lon, lat], weight: WEIGHTS['1 km'] }),
                    '5 km': (audit.calculate).bind({ results: results, distance: '5 km', population: results['population_5km']['features'][0]['properties']['population'], center: [lon, lat], weight: WEIGHTS['5 km'] })
                },
                function(err, scores){
                    if(err){
                        console.log(err);
                        cb({ message: 'Unknow Error.' });
                        return;
                    }
                    cb(null, { score: (scores['500 m'] + scores['1 km'] + scores['5 km']) });
                }
            );
        }
    );
}

module.exports = router;
