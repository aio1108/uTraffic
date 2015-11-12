var request = require('request'),
    _ = require('underscore'),
    options = {
        uri: 'https://gist-geo.motc.gov.tw/Api/Buffer/V1/Population',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        strictSSL: false,
        json: true
    };

function search(next){
    var position = this.position || '',
        radius = this.radius || 5000,
        format = this.format || 'GeoJSON',
        opts = _.extend({}, options);

    opts.body = { position: position, radius: radius, format: format };
    request(opts, function(err, httpResponse, body){
        if(err){
            next(err);
            return;
        }
        next(null, body);
    });
}

exports.search = search;