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
app.use(express.urlencoded()); //  - express.urlencoded for ready the body of POST requests (EASY)

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



// :projectDirectory is a placeholder and will be put in req.params object
// app.get('/projects/:projectDirectory', (req, res) => {
//     const projectDirectory = req.params.projectDirectory;
//     const selectedProject = projects.find(p => {
//         return p.url === projectDirectory;
//     });
    
//     if (selectedProject === undefined){// TASK: check if selectedProject is undefined.
//         res.status(404).send("Wrong request"); //      if it is undefined. set statuscode 404 and send response.
//     }

//     res.render('show-lists', {
//         layout: "main",
//         helpers: {
//             getStylesHelper: "/stylesforprojects.css",
//             getActiveClass: (url) => {
//                 // console.log(selectedProject);
//                 if(selectedProject.url === url){
//                     return 'active';
//                 }  
//             }
//         }
//     });
// });


app.listen(3000, console.log("Petition: running server at 3000..."));


