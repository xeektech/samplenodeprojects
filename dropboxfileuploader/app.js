/*
    A simple client application developed in node.js, uploads the files residing on the 
    local folder to dropbox over it's REST API using dropbox's own JS sdk
*/

/*
    Init block. 
    - isomorphic-fetch: needed by the dropbox client library. Fetch is an alternative 
    to XMLHttpRequest (for making web requests)
    - Config object: contains config, tucked away under ./config/config.js/ These configs 
    include: 
        - source folder: local folder on the user's machine where the files which need to 
        be uploaded, are sourced from
        - target folder: the destination/upload folder inside dropbox
        - chunksize: As per dbx api docs, the max size of the given file to be 
        uploaded via API is 150 mb, in other words if the give file has the size of 
        <=150 mb, it can be uploaded in one shot otherwise it has to be split into chunks 
        and then these chunks need to be uploaded in sequence to dbx. Max filesize that 
        can be uploaded via the chunked appraoch is 350 GB. Using this config, the max 
        chunk size can be altered in this client cli app. See maxchunksize variable below 
        also
        - accesstoken: The access token associated with the given user and is used for 
        authentication. Apparently this is the only method available for auth for a 
        node cli app. For reference, here is the link to their github isue: 
        https://github.com/dropbox/dropbox-sdk-js/issues/64 and you can see the reply to 
        my comment there as well
    - maxchunksize: Transforming the specified config value to its MB equivalent, e.g. 
    if the config value (config.chunksize is 1) then maxchunksize becomes 1 MB
    - Dropbox and dbx: Dropbox's JS sdk initializations with the given access token used 
    for authentication to the dropbox service
*/
require('isomorphic-fetch')
const config = require('./config/config.js')
let fs = require('fs')
const maxchunksize = config.chunksize * 1024 * 1024 
let Dropbox = require('dropbox').Dropbox;
let dbx = new Dropbox({ accessToken: config.accesstoken })

/*
    Utility method:
        - Checks if the folder with the given targetfolder name (ref config) exists.
        - If so, doesn't do anything, just prints out the message
        - If the folder doesn't exist, the code goes into catch block, where 
            - It is check if the error response has the statusText field set to `Conflict`
            meaning, the error is related to the folder name conflict type (came to 
            this understanding after playing around with the api a little), if so, 
            folder create command is issued via the api with autorename property set to 
            false
            - Otherwise: The error is thrown
*/
const foldercreatecheck = async () => {
    try {
        let metadata = await dbx.filesGetMetadata({ path: config.targetfolder })
        console.log(`folder exists with this metadata: ${JSON.stringify(metadata)}`)
    }
    catch (err) {
        if (err.response.statusText === `Conflict`) {
            try{
                await dbx.filesCreateFolderV2({ path: config.targetfolder, autorename: false })
                console.log(`the folder: ${config.targetfolder} is successfully created`)
            }
            catch(anothererr){
                throw anothererr
            }
        }
        else {
            throw err
        }
    }
}


/*
    - Main method
    - calls foldercreatecheck()
    - Reads the source folder on disk (config.sourcefolder)
    - Loops over every file in the source directory
    - For each file:
        - Open readstream to it
        - Start uploading a chunk read off the stream, to dbx over the rest api
        Note: Streams help us remain efficient while processing biger files. I am personally 
        not even a proponent of reading a 150 MB file in one go, it means the payload is 
        read fully in the memory of the program before its sent on its way over the rest 
        api to dropbox. Keeping a smaller chunk size may help with the memory usage of the 
        app but it will increase the load on the network bandwidth as the number of calls to 
        the api will increase for sure. There is no silver bullet here as is always the case 
        with coming up with the most suitable architecture, its not science rather it art in 
        my view. So keep these numbers (memory/chunk size etc) to an optimum level based on 
        your system and network specification.
 */

const fileupload = async () => {
    try {
        await foldercreatecheck()
        let uploadmetadataarr = []
        fs.readdir(config.sourcefolder, (err, files) => {
            if (err) {
                throw err
            }
            files.forEach(
                async file => {
                    /* Ah, well the mac user would know why */
                    if (file === `.DS_Store`) {
                        return
                    }
                    const filesize = fs.statSync(`${config.sourcefolder}/${file}`).size
                    //console.log(`Currently processing: ${file} with filesize: ${filesize}`)
                    /*
                        Pay close attention to the use of highWaterMark object parameter to the 
                        createReadStream method. This param helps in setting the size of the 
                        chunk. In our case it is also important to set the size of the chunk 
                        everytime the data is read off the stream. It helps us calculate the 
                        number of times we need to furnish the api calls to completely 
                        upload the file in chunked manner.
                    */
                    let rs = fs.createReadStream(`${config.sourcefolder}/${file}`, { highWaterMark: maxchunksize })

                    /*
                        This utility method: processdata, actually takes these params as input:
                        - rs: readstream handle
                        - file: source filename 
                        - filesize: is used to calculate the number of iterations (along with the 
                        maxchunksize value) needed to completely read and upload the stream to dbx
                    */
                   uploadmetadataarr.push(await processdata(rs, file, filesize))

                    /*
                        This metadata array is actually a list of all the files successfully 
                        uploaded to dropbox with their newly created paths, time of creation and 
                        the message/file id in dropbox. Helpful in situations where the requirement 
                        is to know the files uploaded with their corresponding dropbox metadata
                    */
                    console.log(`upload metadata arr is: ${JSON.stringify(uploadmetadataarr)}`)
                }
            )
        })
    }
    catch (err) {
        console.log(err)
    }
}

/*
    this method:
    - Performs the necessary calcluations such as:
        * total number of iterations required to complete read the source stream and upload the chunks to dbx accordingly
        number of bytes read at any given point in time
        * Handles all the upload scenarios such as:
            - Small file (<=maxchunksize) that gets uploaded in one shot
            - First chunk identification: this scenario is important as it enables us to 
            open up the upload channel on dbx which responds back with the session id that 
            is to be used and provided in all the subsequent chunk uploads of the given 
            source file.
            API Method: dbx.filesUploadSessionStart
            - Last chunk id: the last chunk of the given file, which is supplied to api 
            with an additional commit object letting the dbx service know about the end of 
            the upload along with its filename there
            API method: dbx.filesUploadSessionFinish
            - Everything betwen the first and the last chunk: 
            API method: dbx.filesUploadSessionAppendV2
            Note: after the first call, its the responsibility of the client to keep a 
            track of the number of bytes read and uploaded (offset) as it needs to be 
            provided in every call to dbx so that it places the given chunk in its 
            rightful place on dbx also
        * responds back with a promise which if resolved, provides the metadata of the 
        newly created/uploaded file on dbx otherwise it is rejected with error
*/
const processdata = (rs, file, filesize) => {
    return new Promise((resolve, reject)=>{

        let session_id = '', chunk, readpos = 0, firstchunk = true
        let totaliterations = Math.ceil(filesize/maxchunksize)
        let chunkcount = 0 
        rs.on(`data`, chunk => {
            chunkcount++
            console.log(`chunk length is ${chunk.length}`)
            
            /*
                Case: The given file is <= maxchunksize. Upload in one shot
            */
            if (filesize <= maxchunksize) {
                dbx.filesUpload({ path: config.targetfolder + '/' + file, contents: chunk })
                    .then(
                        response => {
                            //console.log(`file: ${file} uploaded successfully!`)
                            resolve(reqfilemetadata(file,response))
                        }
                    )
                    .catch(
                        err=>reject(err)
                    )
            }
    
            else{
                rs.pause()
                if (chunkcount === 1) {
                    /* first chunk determined */
                    dbx.filesUploadSessionStart({
                        contents: chunk,
                        close: false
                    })
                    .then(
                        response => {
                            session_id = response.session_id
                            console.log(`The response is: ${JSON.stringify(response)}`)
                            rs.resume()
                        }
                    )
                    .catch(
                        err=>reject(err)
                    )
                }
                
                else if(chunkcount === totaliterations){
                    /* last chunk determined */
                    dbx.filesUploadSessionFinish(
                        {
                            cursor: {
                                session_id: session_id,
                                offset: filesize - chunk.length
                            },
                            commit: {
                                path: config.targetfolder + '/' + file,
                                mode: 'add',
                                autorename: true,
                                mute: false
                            },
                            contents: chunk
                        })
                        .then(
                            metadata=>{
                                rs.resume()
                                resolve(reqfilemetadata(file,metadata))
                            }
                        )
                        .catch(
                            err => reject(err)
                        )
                }
                else{
                    console.log(`current offset is: ${readpos}`)
                    dbx.filesUploadSessionAppendV2(
                        {
                            cursor: {
                                session_id: session_id,
                                offset: readpos
                            },
                            close: false,
                            contents: chunk
                        }
                    )
                    .then(
                        () => {
                            rs.resume()
                        }
                    )
                    .catch(
                        err => reject(err)
                    )
                }
            }
            readpos += chunk.length
        })
    })

}

/*
    Simple utility method that furnishes an object with info related to the file being 
    uploaded and returns it. This object has these fields:
    - Source filename
    - Target path (in dbx where is file is uploaded)
    - Target field id (when a file is created in dbx, it assigns it a unique id, this field captures the newly created id)
    - Client modified time 
    - Server modified time
*/
const reqfilemetadata = (file, metadata) => {
    let metadataobj = {
        sourcefilename: file,
        targetpath: metadata.path_lower,
        targetfileid: metadata.id,
        targetclientmod: metadata.client_modified,
        targetservermod: metadata.server_modified
    }
    return metadataobj
}

fileupload()