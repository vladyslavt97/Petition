## Petition - Part 5

-   create new edit handlebars and according GET and POST route in your express app
<!-- - update your thanks handlebars page by showing additional links on bottom -->
-   add additional function to your db.js for updating/inserting data
    //////////////////////////////////////////////////

<!-- ## Create edit handlebars and GET and POST route in your express app

-   create handlebars file which will have multiple input fields wrapped in a form -->
    -   form will make POST request when form was submitted by clicking on the button
    -   your input fields will have predefined values when there are existing values (make sure you pass them in the GET route when you render the handlebars accordingly)
-   in the GET route you should probably first get all relevant values from the db
    -   write new function in your db.js for getting all the relevant data of the current logged in user
    -   pass the information then to your edit handlebars when you render it
    -   save the values of the current user in the session object (so you can later compare values from the form and the values that were in the database)
-   in your POST route you should make use of the saved user in the session object and check if values are different provided by the form

    -   You will have probably multiple checks in your POST route in order to do the correct action to your db: - Check if any password was set. If it was set: then update the password (create new function in db.js for this update)
        Check if values for the users table have changed. If there are changes: then update the users datatable (create new function in db.js for this update)
        Check if values for the user_profiles table have changed. If there are change: then update the table OR insert new dataset if no dataset exists for the user. (create new function(s) in db.js for this update)
        you can create one function in SQL which will handle INSERT OR UPDATE with one query or you can create multiple functions and distinguish in JS which function you would call.
        You could use Promise.all() for the updates to the DB, but it is not really necessary

    ## Update thanks handlbars

-   show a new link for getting to the edit handlebars page
-   show a new link for deleting your existing signature
    . You will need to make a POST request to your server (so you'll need a new POST route in your server) in order to execute the deletion of your signature
    . You can solve this in different ways:

    -   create a form and only a button inside the form. Style the button so it looks like a link
    -   create a form and only a link inside the form. Create a new client-side JS where you do extra logic:
        -   create click event listener for the link. In case of event you would call preventDefault() on the event and call the submit() function on the form element manually
    - create just a link inside the form. Create a new client-side JS where you do extra logic:
        - create click event listener for the link. In case of event you would call preventDefault() on the event and use JQuery ajax function to manually make a POST request.
- You will need a new function in your db.js in order to delete the signature from the signatures table
- after deletion don't forget to update the req.session object accordingly

    ## Additional functions in db.js

    functions were already mentioned in the two points before. But summerized you'll need multiple functions in your db.js something like:
    deleteSignature for deleting the signature from your signatures table
    getUserById for getting the current logged in user from your user table
    updateUser for updating users core information in your user table
    insertOrUpdateUserProfile for updating/inserting additional profile information in your user_profiles table OR updateUserProfile for just updating additional profile information in your user_profiles table
    which function you implement is your decision. If you want to handle the update or insert logic in SQL or in JS.
