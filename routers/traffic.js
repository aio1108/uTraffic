var express = require('express'),
    async = require('async'),
    landmark = require('../services/landmark'),
    population = require('../services/population'),
    audit = require('../services/audit'),
    router = express.Router();

router.post('/audit', function(req, res, next) {
  async.parallel(
      {
          train: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [301] }),
          shuttle: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [302] }),
          parking_lot: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [303] }),
          airport: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [304] }),
          MRT: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [306] }),
          THSR: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [307] }),
          highway: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [308] }),
          bus: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [10100] }),
          bike: (landmark.search).bind({ position: [[25.074020, 121.654129]], range: 5000, category: [10104] }),
          population_100m: (population.search).bind({ position: '25.074020, 121.654129', radius: 100 }),
          population_500m: (population.search).bind({ position: '25.074020, 121.654129', radius: 500 }),
          population_1km: (population.search).bind({ position: '25.074020, 121.654129', radius: 1000 }),
          population_5km: (population.search).bind({ position: '25.074020, 121.654129', radius: 5000 })
      },
      function(err, results){
            if(err){
              console.log(err);
              res.json({ message: 'Unknow Error.' });
              return;
            }

          async.parallel(
              {
                  '100 m': (audit.calculate).bind({ results: results, distance: '100 m', population: results['population_100m']['features'][0]['properties']['population'], center: [121.654129, 25.074020], weight: 0.5 }),
                  '500 m': (audit.calculate).bind({ results: results, distance: '500 m', population: results['population_500m']['features'][0]['properties']['population'], center: [121.654129, 25.074020], weight: 0.3 }),
                  '1 km': (audit.calculate).bind({ results: results, distance: '1 km', population: results['population_1km']['features'][0]['properties']['population'], center: [121.654129, 25.074020], weight: 0.15 }),
                  '5 km': (audit.calculate).bind({ results: results, distance: '5 km', population: results['population_5km']['features'][0]['properties']['population'], center: [121.654129, 25.074020], weight: 0.05 })
              },
              function(err, scores){
                  if(err){
                      console.log(err);
                      res.json({ message: 'Unknow Error.' });
                      return;
                  }
                  res.json({ score: (scores['100 m'] + scores['500 m'] + scores['1 km'] + scores['5 km']) });
              }
          );
      }
  );
});

module.exports = router;
