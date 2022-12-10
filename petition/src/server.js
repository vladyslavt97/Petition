const express = require("express"); // require modules that you will need and set up your express app (EASY)
const app = express();
const { selectAllDataFromSignaturesDB,insertDataIntoSignatureDB } = require('./db');

// setup handlebars for your express app correctly (EASY)
// Handlebars Setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
// End of setup


// apply different middlewares like:
app.use(express.static("../public")); //  - express.static for static files (EASY)
// app.use(express.urlencoded()); 
const urlEncodedMiddleware = express.urlencoded({ extended: false });//  - express.urlencoded for ready the body of POST requests (EASY)
app.use(urlEncodedMiddleware);


//my redirect
app.get('/', (req, res) => {
    res.redirect('/petition');
});
// Create multiple routes for your express app:


const cohortName = "Mint";
const createdBy = 'Vladyslav Tsurkanenko';

app.get("/petition", (req, res) => { //  1 . - one route for renderering the petition page with handlebars (EASY)
    res.render("petition", {
        layout: "main",
        cohortName,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-petition.css" 
        }
    });
});
app.post('/petition', (req, res) => {
    let firstNameValuesSaved = req.body.firstNameValues;
    let secondNameValuesSaved = req.body.secondNameValues;
    let drawingCanvas = "test";
    console.log("First name: ", firstNameValuesSaved, "Last name: ", secondNameValuesSaved, 'drawingCanvas: ', drawingCanvas);
    insertDataIntoSignatureDB(firstNameValuesSaved, secondNameValuesSaved, drawingCanvas);
    res.redirect("/petition/signers");
});
let numberofItems;
let allDataRows;
app.get("/petition/signers", (req, res) => { // 2. - one route for rendering the signers page with handlebars (EASY); make sure to get all the signature data from the db before (MEDIUM)
    selectAllDataFromSignaturesDB()
        .then(allData => {
            // data is the resolved value of the promise
            numberofItems = allData.rows.length;
            allDataRows = allData.rows;
            // console.log('server.js', numberofItems); 
        })
        .catch(err => {
            console.log('error appeared for query: ', err);
        });
    res.render("signers", {
        layout: "main",
        numberofItems,
        cohortName,
        createdBy,
        allDataRows, 
        helpers: {
            getStylesHelper: "/styles-signers.css" 
        }
    });
});
app.get("/petition/thanks", (req, res) => { // 3. - one route for rendering the thanks page with handlebars (EASY); make sure to get information about the number of signers (MEDIUM)
    res.render("thanks", {
        layout: "main",
        cohortName,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-thanks.css" 
        }
    });
});


// 4. - one route for POSTing petition data -> update db accordingly (MEDIUM)
// ## Form should make POST request: !!!
// 2. add another POST route in your express app where you will listen for the data the form will be sending for first name, last name and signature
// 4. in the POST route you should read out the body from the request and save the information in the petition database with the help of the function you have written before in the db.js file!



app.listen(3000, console.log("Petition: running server at 3000..."));


