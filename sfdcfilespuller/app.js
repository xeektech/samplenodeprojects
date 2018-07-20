/*
    SFDC client application developed in node.js which downloads the files related to the 
    given user on local disk.
*/

/*
    Ususal initializations
    jsforce, fs and config
*/
let jsforce = require('jsforce')
let fs = require('fs')
const config = require('./config/config.js')

/*
    This method is used to create a jsforce connection object and return the newly 
    created object back to the caller. The connection method must be passed the client id, 
    client secret and the redirect uri. These values are specified in the connected app 
    at the time of its creation in the salesforce admin/management console
*/
const createconnobject = () => {
    return new jsforce.Connection({
        oauth2: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            redirectUri: config.redirectUri
        }
    })
}

/*
    This method is passed the already created jsforce connection object which is used to 
    log into salesforce.com. The parameters to the login method are: username and the 
    password. It must be kept in mind that the password field is the concatenation of 
    the given user's password and it's token. This method return a promise 
*/

const sfdclogin = (conn) => {
    return conn.login(config.username, config.password)
}


/*
    This is the main method that starts things off.
    - Gets a connection object created
    - Logs into Salesforce
    - Gets the ids of all the files associated with the given user. In sfdc land, files 
    are known as contentdocument (s)
    - For ever content document retrieved, it gets the corresponding contentversion information.
    Again in sfdc land, contentversion, represents a specific version of the given document.
    Q: Why is needed? Ans: coz we need to gain the hanle of this object's version data 
    field which represents the blob (the base64 encoded binary data of the actual file)
    - For each contentversion id, it gets the stream (via the version data field) of the 
    given file object and has it saved to disk
    
*/
const startprocessing = async () => {
    try {
        let conn = createconnobject()
        let userinfo = await sfdclogin(conn)
        console.log(`User: ${userinfo.id} has been successfully signed in`)
        let filesarr = await getallfilesinfo(conn, userinfo.id)
        let contentversionarr = await getcontentversioninfo(conn, filesarr)
        console.log(`A total number of ${contentversionarr.length} files marked for downloading`)
        contentversionarr.forEach(
            element => {
                console.log(`Currently processing ${element.Title}.${element.FileExtension}`)
                savecontentversion(conn, element)
            })
    }
    catch (err) {
        console.log(`error while processing, details: ${err}`)
    }
}

/*
    This method is passed the filesarr which contains info regarding the contentdocumentids 
    retreived earlier.
    - Forms a query to select the Id, Title (filename) and FileExtension fields of the 
    ContentVersion object, based of the given ContentDocument Ids in the supplied filesarr 
    - Take notice of the use of template strings/literal to concatenate the bits of the 
    query string inside the loop running on filesarr, while forming the IN statment part
*/

const getcontentversioninfo = async (conn, filesarr) => {
    let contentversionquery = `Select Id, Title, FileExtension from ContentVersion where ContentDocumentId IN ( ${filesarr.map(
        element => `'${element.ContentDocument.Id}'`
    )} )`
    let contentversionidarr = await executequery(contentversionquery, conn)
    return contentversionidarr.records
}

/*
    - This method is give the handle to the connection object as well as the given 
    contentverion element (retrieved earlier by the getcontentversioninfo menthod)
    - It then obtains the reference to the stream of the file available on sfdc (based
    on the given ContentVersion Id)
    - Creates a writable stream to a file on disk
    - pipes the sfdc blobl stream to the write stream
    - The above step does the trick of downloaing the file off sfdc and saving/storing 
    it on disk 
*/

const savecontentversion = (conn, contentversion) => {
    let blobstream = conn.sobject('ContentVersion').record(contentversion.Id).blob('VersionData')
    let writableStream = fs.createWriteStream(`${config.targetfolder}/${contentversion.Title}.${contentversion.FileExtension}`)
    blobstream.pipe(writableStream)
    writableStream.on('finish', () => {
        console.log(`File: ${contentversion.Title}.${contentversion.FileExtension} is downloaded successfully`)
    })
}

/*
    - The following method, takes the connection object and the userid as params
    - The userid is taken off the userinfo method after the user is succesfully 
    authenticated and logged in
    - It then forms a query to obtain the info (such as ContentDocument's title, 
    OwnerId and LinkedEntityId) form the ContentDocumentLink object
    - Honestly, only the ContentDocument.Id would have sufficed, the rest of the info 
    is obtained, plainly for debugging purposes
    - Take note of the usage of ContentDocumentLink object. This provides the relationship 
    between files and the related objects (such as user in this case)
    - Excutes the query
    - Returns the records retreived as the result of the above step
*/

const getallfilesinfo = async (conn, userid) => {
    let filesquery = `SELECT ContentDocument.title, ContentDocument.Id, ContentDocument.OwnerId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId = '${userid}'`
    let filesresult = await executequery(filesquery, conn)
    return filesresult.records
}

/*
    Simple helper method to execute the given query based on the supplied connection 
    object
*/
const executequery = (querystring, conn) => {
    return conn.query(querystring)
}

/*
    Firing the engines
*/
startprocessing()
