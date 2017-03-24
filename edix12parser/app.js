
/*
Setting up, initializing!
*/

/*
  fs is needed to create the read stream on the EDI file stored on disk
*/
var fs = require('fs');

/*
  config holds the filepath to the EDI file
*/
var config = require('./services/config/config');

/*
  Following is referencing the transform stream which parses the source raw EDI
  to its corresponding JSONified representation
*/
var parser = require('./services/parser/x12parser');

/*
  Creating a read stream on the source EDI file available on disk
*/
var source = fs.createReadStream(config.edifilepath);

/*
  Piping streams together:
  read -> transform -> write (source->parser->process.stdout)
*/
source
  .pipe(parser)
  .pipe(process.stdout);
