var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    API_PREFIX = '/useful/api',
    API_VERSION = '/v1',
    trafficRouter = require('./routers/traffic'),
    app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(API_PREFIX + API_VERSION + '/traffic', trafficRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;