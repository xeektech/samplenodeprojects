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


dropboxfileuploader
  - A simple client app developed in node.js
  - It is used to upload files available in the given folder on the user's local file system to dropbox over it's REST API
  - Supports both one shot uploads and chunked uploads

sfdcfilespuller
  - Salesforce client 
  - Uses force.js to connecte upto sfdc over the REST API
  - Downloads files associated with the given user, on salesforce to a folder on the local file system

receiptscannerjs
	- Sample app to scan the given receipt using tesseract.js
