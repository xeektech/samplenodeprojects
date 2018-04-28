# samplenodeprojects
craigslistparser 
  - A web automation sample project. It navagates to: LA's Craigslist page -> cars+trucks -> By-Owner Only -> auto make model = "honda civic". 
  - Fetches the results (links to for sale honda civic car ads)
  - Loops over first 5 of the links/ads
  - Gets these bits of information:
    - Title
    - Transmission
    - Fuel
    - Odometer
    - Link to the ad itself
  - Furnishes the above info in a spreadsheet (using exceljs)
 
 
 
 
edix12parser
  - ANSI X12 Parser
  - Transforms the given EDI file into JSON
  - EDI filepath can be specified/configured in ./services/config/config.js
  - EDI delimiters can also be specified in the config file
  
 
 expressmysqlapi
  - A simple CRUD API build using express
  - Backend is MySQL
  - All the DB related helper methods are available in ./services/database/dal.js
  - The express routes are available in: ./services/routes/routes.js
  - DB connection details and the api port are configurable in : /services/config/<ENV>.js
  - Sample postman requests collection can be found at: ./resources/expressmysqlapi_requests.postman_collection
