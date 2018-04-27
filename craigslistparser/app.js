/*
    Initializing and building the selenium webdriver with firefox options
    along with the exceljs object that will later be used to create the 
    spreadsheet
*/

const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

const firefox = require('selenium-webdriver/firefox');


const firefoxOptions = new firefox.Options();

/*
    Path to FF bin
*/
firefoxOptions.setBinary('/Applications/Firefox.app/Contents/MacOS/firefox-bin');
/*
    Uncomment the following line to enable headless browsing
*/
//firefoxOptions.headless();


const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(firefoxOptions)
    .build();

const excel = require('exceljs')
/*
    End of initialization
*/


/*
    The following method retrieves the ad links on the first page, 120 of them
    LA Craigslist main page -> 
        cars+truks -> 
        By-Owner Only -> 
        auto make model = "honda civic"
*/
async function getcarlinks() {

    await driver.get('https://losangeles.craigslist.org/')
    await driver.findElement(By.linkText('cars+trucks')).click()
    await driver.findElement(By.linkText('BY-OWNER ONLY')).click()
    await driver.findElement(By.name('auto_make_model')).sendKeys('honda civic')
    /*
        Its important to note here is that the string "honda civic" when furnished 
        inside the auto_make_model textbox, it turns into a link that needs to be 
        clicked in order for the honda civic specific ads page to load. The 
        following function call handles the click part when string "honda civic" 
        turns into a link
    */
    await driver.wait(until.elementLocated(By.linkText('honda civic')), 50000)
        .then(
            elem => elem.click()
        )
    
    /*
        class 'result-info' helps in retrieving all those webelements that contain 
        the car ad link
    */
    let elems = await driver.findElements(By.className('result-info'))
    /*
        further parsing of the webelements to obtain the anchor ('a') tags
    */
    let linktagarr = await Promise.all(elems.map(
        async anelem => await anelem.findElements(By.tagName('a'))
    ))

    /*
        parse the actual links off the anchor tags into an array and return 
        the array
    */
    return await Promise.all(
        linktagarr.map(
            async anhref => await anhref[0].getAttribute('href')
        )
    )
}


/*
    The following method:
    - Is passed a car links array
    - Sets up a new workbook
    - Adds a new worksheet to the workbook, named 'CL Links Sheet'
    - These columns are added to the worksheet: Sr Num, Title, Transmission, 
        Fuel, Odometer and link to the car's ad page
    - for each link in the links array all the way till 5 elements (otherwise 
    the app will take a long time to process all the 120 links, this setting 
    can be changed however to whichever number is deemed feasible), it does the 
    following:
        - Increments the sr (Sr Num) field in the spreadsheet 
        - 'gets' the given link
        - Inside each ad page, look for these: title, transmission, Fuel,  
            Odometer and the link
        - Add a new row with the fetched/furnished info
    - After processing the given links, it saves the spreadsheet with this 
        name: output.xlsx
    
*/

async function processlinks(links) {
    /* 
        init workbook, worksheet and the columns
    */
    const workbook = new excel.Workbook()
    let worksheet = workbook.addWorksheet('CL Links Sheet')
    worksheet.columns = [
        { header: 'Sr Num', key: 'sr', width: 5 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Transmission', key: 'transmission', width: 25 },
        { header: 'Fuel', key: 'fuel', width: 25 },
        { header: 'Odometer', key: 'odometer', width: 25 },
        { header: 'link', key: 'link', width: 150 }
    ]

    /*
        end init
    */

    for (let [index, link] of links.entries()) {
        /*
            The following if condition limits the number of links to be processed.
            If removed, the loop will process all 120 links
        */
        if (index < 5) {
            let row = {}
            row.sr = ++index
            row.link = link
            await driver.get(link)
            let elems = await driver.findElements(By.className('attrgroup'))
            /*
                There are only two elements/sections that match 'attrgroup' 
                className search criterion, the first one contains the title 
                info and the other contains the info related to the remaining 
                elements: transmission, fuel odometer and the ad's link.
                As there are always going to be two attrgoup elements therefore 
                I have directly used the elems indexes rather than appllying a 
                loop to iterate over the array
            */
            if (elems.length === 2) {
                /*
                    fetching row.title form elems[0]
                */
                row.title = await elems[0].findElement(By.tagName('span')).getText()
                /*
                    gathering the remaining spans from elems[1] index. These 
                    span tags contain the pieces of information we are looking for
                */
                let otherspans = await elems[1].findElements(By.tagName('span'))

                /*
                    Looping over each span and fetching the values associated with 
                    transmission, fuel, odometer and the link
                */
                for (aspan of otherspans) {
                    let text = await aspan.getText()
                    /*
                        An example of the given spans text.
                            Odometer: 16000
                        the value is the piece after ':'.
                        The following regex is seperating the value form the 
                        complete string and leaving the result in an array
                    */
                    let aspanval = text.match('(?<=:).*')
                    if (text.toUpperCase().includes('TRANSMISSION')) {
                        row.transmission = aspanval.pop()
                    }
                    else if (text.toUpperCase().includes('FUEL')) {
                        row.fuel = aspanval.pop()
                    }
                    else if (text.toUpperCase().includes('ODOMETER')) {
                        row.odometer = aspanval.pop()
                    }
                }
            }
            /*
                The given row is now furnished. It's time to add it to the 
                worksheet
            */
            worksheet.addRow(row).commit()
        }
    }
    /*
        All the rows in the worksheet are now furnished. Save the workbook now
    */
    workbook.xlsx.writeFile('output.xlsx')
}


/*
    The following method chains the getcarlinks and processcarlinks methods 
    by calling them in a sequence (JS internally promise chaining these 
    functions under the hood)
*/

async function startprocessing() {
    try {

        let carlinks = await getcarlinks();
        await processlinks(carlinks);
        console.log('Finished processing')
        await driver.quit()
    }
    catch (err) {
        console.log('Exception occured while processing, details are: ', err)
        await driver.quit()
    }
}

/*
    Starting the engines 
*/
startprocessing()

