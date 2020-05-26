const { createWorker } = require("tesseract.js");

/* 
    Creating a workker here which in node.js is a child 
    process and helps in performing OCR related tasks
*/
const worker = createWorker();

/* 
    Sample function that does pretty much everthing: 
      - loads & initializes the worker
      - runs the image recognition (worker.recognize)
      - prints the extracted text on the terminal
      - terminates the worker at the end
*/
const runocr = async () => {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data } = await worker.recognize("receipt.jpg");
  console.log(data.text);
  await worker.terminate();
};

/*
    executing the runocr method
*/

runocr();
