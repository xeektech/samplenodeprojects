/*
  This file, 'api.js' is the entrypoint of the application. Here some of the
  objects are getting Initialized, out of which some are then passed around in
  the helper modules. It is these helper modules where majority of the work is
  happening which makes this api function as designed.
*/


/*****************************Initialization Block*****************************/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./services/config/' + (process.env.NODE_ENV || 'development'));

/*
'dal' is the data access layer. It is a helper module built from scratch for this
api. It houses methods that provide abstraction on the core database functions
*/
var dal = require('./services/database/dal');
var pool = dal.createpool();

/*
  'router' is another helper module. All the http routes that are needed to
  service the incoming http requests, are implemented inside this module
*/
var router = require('./services/routes/routes')(pool);

/**********************End of Initialization Block*****************************/

/*
  Configuring the app to use bodyParser which will help in getting us the data
  from a POST request
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
  prefixing all routes with /api
*/
app.use('/api', router);

/*
  enabling CORS
*/
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


/*
  Starting off the webserver
*/

var server = app.listen(config.apiport, function(){

  console.log('The server is listening on: ' + server.address().port);

});
