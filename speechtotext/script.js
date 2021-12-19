/*
    init
*/

//Select the mic button
const micbtn = document.getElementById("start-btn")
//select the textarea
const txtarea = document.getElementById("textarea")

//Speechrecog object
//ensuring browser compatibility between mozilla and chrome
const SR = window.SpeechRecognition || window.webkitSpeechRecognition
const speechrecog = new SR() //we have the speech object created


/*
    The onstart property in effect is an event handler that fires off when the SR service has started listening for 
    the incoming audio
*/

speechrecog.onstart = ()=>{
    console.log('Hello, I am listening')
    micbtn.disabled = true
}

/*
    Just like the onstart property, the speech api has the onend property as well. The handler can be used to determine 
    if the speech service has disconnected/ended
*/

speechrecog.onend = ()=>{
    console.log('The speech service has ended')
    micbtn.disabled = false
}


/*
    This event handler is used to capture the positive speech recognition results.
*/

speechrecog.onresult = (evt)=>{
    console.log(evt)
    const _idx = evt.resultIndex
    txtarea.textContent = evt.results[_idx][0].transcript
    speak(txtarea.textContent)
}

micbtn.addEventListener('click', ()=>{
    txtarea.textContent = ''
    speechrecog.start()
})


const speak = (text) => {
    const speech = new SpeechSynthesisUtterance()
    speech.text = text
    window.speechSynthesis.speak(speech)
}


