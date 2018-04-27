/*
  This is the data access layer (dal). This file has the methods which help in
  creating, updating, reading and deleting records in the table housed inside
  the database. This file also has methods to create and end the connection pool.
*/


/*
  The following method 'getall', retrieves all the records in the person's table.
  It furnishes the supplied callback with either the error, if encountered one
  during exection or the result of the query itself.
*/

module.exports.getall = function(conn, apicallback){

  conn.query('select * from persons', function(error, result){
    if(error){
      apicallback(error, null);
    }
    else {
      apicallback(null, result);
    }
  });

}

/*
  The following method 'getrow', retrieves the given record from the person's
  table, based on the record's id.
  It furnishes the supplied callback with either the error, if encountered one
  during exection or the result of the query itself.
*/

module.exports.getrow = function(conn, id, apicallback){

  conn.query('select * from persons where id = ?', [id], function(error, result){
    if(error){
      apicallback(error, null);
    }
    else {
      apicallback(null, result);
    }
  });

}


/*
  The following method 'createrow', creates the given record inside the person's
  table, based on the given record. The given record is a javascript object
  that has the details of all the fields of the given row, populdated.
  It furnishes the supplied callback with either the error, if encountered one
  during exection or the result of the query itself.
*/

module.exports.createrow = function(conn, record, apicallback){

  conn.query('insert into persons set ?', record, function(error, result){
    if(error){
      apicallback(error, null);
    }
    else {
      apicallback(null, result);
    }
  });

}


/*
  The following method 'deleterow', deletes the given record from the person's
  table, based on the record's id.
  It furnishes the supplied callback with either the error, if encountered one
  during exection or the result of the query itself.
*/

module.exports.deleterow = function(conn, id, apicallback){

  conn.query('delete from persons where id = ?', [id], function(error, result){
    if(error){
      apicallback(error, null);
    }
    else {
      apicallback(null, result);
    }
  });

}


/*
  The following method 'deleterow', updates the given record from the person's
  table, based on the record's id, with the supplied updated record.
  The updated record is a javascript object that has the details of all the
  fields of the given record, populdated.
  It furnishes the supplied callback with either the error, if encountered one
  during exection or the result of the query itself.
*/

module.exports.updaterow = function(conn, person, apicallback){

  conn.query('update persons set ? where id = ?', [person, person.id], function(error, result){
    if(error){
      apicallback(error, null);
    }
    else {
      apicallback(null, result);
    }
  });

}

/*
  The following method 'creatpool', as the name suggests creates the connection
  pool for the mysql instance. The pool is created based on the configurations,
  retained inside the config files

*/
module.exports.createpool = function(){

  /*
    pulling in the configs based on the given environment
  */
  var config = require('../config/' + (process.env.NODE_ENV || 'development'));

  /*
    requiring 'mysql' package
  */
  var mysql = require('mysql');


  var pool  = mysql.createPool({
    connectionLimit: config.dbconnectlimit, /* The maximum number of connections
                                            to create at once */
    host: config.dbhost, /* The hostname of the database */
    port: config.dbport, /* The database port number on which the instance
                          is listening */
    user: config.dbuser, /* The MySQL user to authenticate as */
    password: config.dbpassword, /* The password of the mysql user */
    database: config.db /* Name of the database to use for this connection */
  });

  /* Returning the created pool object back to the caller */
  return pool;

}
