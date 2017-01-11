/*

  This is the development configuration object. These configurations are used
  when the environment variable 'NODE_ENV' is set to 'development' which
  signifies that the code is running inside the development environment.
  This technique helps to isolate the environment specific configurations.

*/


module.exports = {
  dbconnectlimit: 10, /* The maximum number of connections to create at once */
  dbhost: '192.168.56.20', /* The hostname of the database */
  dbport: 3306, /* The DB host's port number */
  dbuser: 'root', /* The MySQL user to authenticate as */
  dbpassword: 'my-secret-pw', /* The password of the mysql user */
  db: 'testdb', /* Name of the database to use for this connection */
  apiport: 3000 /* The port number on which this api is listening for the
  incoming http requests */ 
};
