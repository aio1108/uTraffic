var request = require('request'),
    _ = require('underscore'),
    options = {
        uri: 'https://gist-geo.motc.gov.tw/Api/Buffer/V1/Poi',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        strictSSL: false,
        json: true
    };

function search(next){
    var position = this.position || [],
        category = this.category || [],
        range = this.range || 5000,
        format = this.format || 'GeoJSON',
        opts = _.extend({}, options);

    opts.body = { position: position, category: category, range: range, format: format };
    request(opts, function(err, httpResponse, body){
        if(err){
            next(err);
            return;
        }
        next(null, (httpResponse.statusCode === 200)?body['features']:[]);
    });
}

exports.search = search;