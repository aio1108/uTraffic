var API_KEY = 'AIzaSyB5ll1UwpdHwmpCxzIapLWz0dOahyFxi-U',
    request = require('request'),
    _ = require('underscore'),
    options = {
        uri: 'https://maps.googleapis.com/maps/api/geocode/json',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        strictSSL: false,
        json: true
    };

function getCoordinate(next){
    var address = this.address || null,
        opts = _.extend({}, options);

    if(address === null){
        next({ err: 'Wrong Parameter.' });
        return;
    }

    opts.qs = { key: API_KEY, address: address };
    request(opts, function(err, httpResponse, body){
        if(err){
            next(err);
            return;
        }

        if(httpResponse.statusCode !== 200 || body['status'] !== 'OK'){
            next({ err: 'Unknow Error.' });
            return;
        }

        next(null, { lon: body['results'][0]['geometry']['location']['lng'], lat: body['results'][0]['geometry']['location']['lat']});
    });
}

exports.getCoordinate = getCoordinate;