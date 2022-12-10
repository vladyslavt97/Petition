const express = require("express"); // require modules that you will need and set up your express app (EASY)
const app = express();
const { getAllSignatures,addSignature } = require('./db');

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
    getAllSignatures();
    res.render("petition", {
        layout: "main",
        cohortName,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-petition.css" 
        }
    });
});
app.get("/petition/signers", (req, res) => { // 2. - one route for rendering the signers page with handlebars (EASY); make sure to get all the signature data from the db before (MEDIUM)
    getAllSignatures();
    res.render("signers", {
        layout: "main",
        cohortName,
        createdBy, 
        helpers: {
            getStylesHelper: "/styles-signers.css" 
        }
    });
});
app.get("/petition/thanks", (req, res) => { // 3. - one route for rendering the thanks page with handlebars (EASY); make sure to get information about the number of signers (MEDIUM)
    addSignature();
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
app.post('/update', (req, res) => {
    // Get the user input from the request body
    const input = req.body;
    // Use the connection to update the database
    addSignature(input);
    (error, results) => {
        if (error) throw error;

        // Return the updated data as a response
        res.json(results);
    };
    
});


app.listen(3000, console.log("Petition: running server at 3000..."));


