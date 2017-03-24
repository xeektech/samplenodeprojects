/*
  Setting up, initializing!
*/

var stream = require('stream')
var transformStream = new stream.Transform( { objectMode: true } )
/*
  Config holds the values the segement and element terminator characters.
*/

var config = require('../../services/config/config');


/*
  This _transform prototype method's implementation is where the raw EDI is
  converted into its corresponding JSON representation
*/

transformStream._transform = function (data, encoding, done) {
  var jsonedi = {};
  /*
    First step in processing. The edi content is sliced up on the basis of
    the segment terminator/delimiter, in an array.
  */
  var segmentsarr = data.toString().split(config.segmentTerminator);
  /*
    Going over the segments array
  */
  segmentsarr.forEach(function(element){
    /*
      Slicing up the elements of each segment in an elements array
    */
    var elementarr = element.split(config.elementTerminator);
    /*
      First element is the name of the segment in an X12 interchange. Putting
      that aside in the following varilable to be used later, hence removed
      from the elements array.
    */
    var firstsegmentelement = elementarr[0];
    var removedelement = elementarr.splice(0,1);
    /*
      The follwoing if condition becomes true only when there is a repeating
      segment that shows up for processing. This repeating segement becomes
      another array along-side the existing one.

      Putting it in another way, if there already exists an element arr with the
      given segment name, then this array "underprocessing" will be
      added along-side the existing arry, against the given segment name.
      Example: consider the following repeating segments:

      REF*DP*038
      REF*PS*R

      The following 'if' condition will come into play when the parser is
      processing the second instance of REF as the first instance is already
      processed.

      Before if condition:
      REF:{"data":[["DP","038"]}
      After if condition
      REF:{"data":[["DP","038"],["PS","R"]]}

    */
    if(typeof jsonedi[firstsegmentelement] != 'undefined'){
      if(!(Array.isArray(jsonedi[firstsegmentelement].data[0]))){

        var arr = [];
        arr = jsonedi[firstsegmentelement].data;
        jsonedi[firstsegmentelement].data = [];
        jsonedi[firstsegmentelement].data.push(arr);
      }
      jsonedi[firstsegmentelement].data.push(elementarr);
    }
    /*
      The following else block keeps composing the JSONified EDI one segment
      at a time. Caveat, the segments have to be unique, for repeating segments,
      the above if block becomes true
    */
    else {
      jsonedi[firstsegmentelement] = {
        data: {}
      };

      jsonedi[firstsegmentelement].data = elementarr;

    }

  });

/*
  The following push method is inhertied from the readable stream. Simply put,
  the jsonified data is pushed to the consumer of this stream
*/

  this.push(JSON.stringify(jsonedi));
  done();
}


module.exports = transformStream;
