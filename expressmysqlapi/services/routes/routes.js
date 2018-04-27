
/*
  This is the api routes layer. This file has the methods which help in
  servicing the incoming http requests for purposes such as creating, updating,
  reading and deleting records in the table housed inside the backend database.
*/


/**************Initialization Block********************************************/
var router = require('express').Router();
var dal = require('../database/dal');
var config = require('../config/' + (process.env.NODE_ENV || 'development'));
/**************End of Initialization Block*************************************/


/*


  The following method encapsulates the http routing functionality. These are
  the routes that this api implements.

  '/readall' --> This routes returns all the records the person's table is
  housing

  '/getrow' --> Retrieves just one record based on it's id

  '/createrow' --> Creates one row

  '/deleterow' --> Deletes the given row based on it's id

  '/updaterow' --> Updates the given row based on the row's id, with the updated
  row data


*/
module.exports = function(pool){


  /*

    the following route '/readall':
      - - Is mapped to http's 'get' method
      - Gets the connection off the pool,
      - Calls the dal's 'getall' method which returns all the rows inside the
    person's table
      - In turn retuns all the rows back to the caller, packaged inside the
      http response
      - Releases the connection, so that it is reclaimed by the pool
      - Sends the errors back to the http caller if there is an error in any of
      the above

  */

  router.get('/readall' ,function(req, res){
    pool.getConnection(function(err, conn){
      if(err){
        res.status(501).send({error: JSON.stringify(err)});
      }
      else {
        dal.getall(conn, function(error, result){
          if(error){
            res.status(501).send({error: JSON.stringify(error)});
          }
          else {
            res.status(200).send({result: JSON.stringify(result)});
            conn.release();
          }
        });
      }
    });
  });


  /*

    the following route '/getrow':
      - - Is mapped to http's 'get' method
      - Gets the connection off the pool,
      - Calls the dal's 'getrow' method which returns the row that is retrieved
      based on the given id
      - In turn retuns returns the retrieved row in http response
      - Releases the connection, so that it is reclaimed by the pool
      - Sends the errors back to the http caller if there is an error in any of
      the above

  */

  router.get('/getrow/:id/', function(req, res){

    pool.getConnection(function(err, conn){
      if(err){
        res.status(501).send({error: JSON.stringify(err)});
      }
      else {
        dal.getrow(conn, req.params.id, function(error, result){
          if(error){
            res.status(501).send({error: JSON.stringify(error)});
          }
          else {
            res.status(200).send({result: JSON.stringify(result)});
            conn.release();
          }
        });
      }
    });

  });



  /*

    the following route '/createrow':
      - Is mapped to http's 'post' method
      - Gets the connection off the pool,
      - Calls the dal's 'createrow' method which creates the given row inside
      the 'persons' table
        - The row data is retrieved from the http request's body
        - The result of the insert db operation is returned back as http
          response
      - Releases the connection, so that it is reclaimed by the pool
      - Sends the errors back to the http caller if there is an error in any of
      the above

  */

  router.post('/createrow', function(req, res){

    pool.getConnection(function(err, conn){
      if(err){
        res.status(501).send({error: JSON.stringify(err)});
      }
      else {
        dal.createrow(conn, req.body, function(error, result){
          if(error){
            res.status(501).send({error: JSON.stringify(error)});
          }
          else {
            res.status(200).send({result: JSON.stringify(result)});
            conn.release();
          }
        });
      }
    });
  });


  /*

    the following route '/deleterow':
      - Is mapped to http's 'delete' method
      - Gets the connection off the pool,
      - Calls the dal's 'deleterow' method which deletes the given row inside
      the 'persons' table based on the row's id
        - The row id is taken from the http request's params
        - The result of the delete db operation is returned back as http
          response
      - Releases the connection, so that it is reclaimed by the pool
      - Sends the errors back to the http caller if there is an error in any of
      the above

  */


  router.delete('/deleterow/:id/', function(req, res){

    pool.getConnection(function(err, conn){
      if(err){
        res.status(501).send({error: JSON.stringify(err)});
      }
      else {
        dal.deleterow(conn, req.params.id, function(error, result){
          if(error){
            res.status(501).send({error: JSON.stringify(error)});
          }
          else {
            res.status(200).send({result: JSON.stringify(result)});
            conn.release();
          }
        });
      }
    });

  });



  /*

    the following route '/updaterow':
      - Is mapped to http's 'put' method
      - Gets the connection off the pool,
      - Calls the dal's 'updaterow' method which updates the given row inside
      the 'persons' table based on the row's id
        - The row id along with the updated object is taken from the http
          request's body
        - The result of the update db operation is returned back as http
          response
      - Releases the connection, so that it is reclaimed by the pool
      - Sends the errors back to the http caller if there is an error in any of
      the above

  */


  router.put('/updaterow', function(req, res){

    pool.getConnection(function(err, conn){
      if(err){
        res.status(501).send({error: JSON.stringify(err)});
      }
      else {
        dal.updaterow(conn, req.body, function(error, result){
          if(error){
            res.status(501).send({error: JSON.stringify(error)});
          }
          else {
            res.status(200).send({result: JSON.stringify(result)});
            conn.release();
          }
        });
      }
    });

  });

  return router;
}
