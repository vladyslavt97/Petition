change the appearence of the existing handlebars sites signers
create a new handlebars page with apropiate route in your express server to show users from a specific city
make changes to the table's structure of signatures
Create new table users_profile
adjust your init.sql file in order to setup a new table users_profiles
table will have the following columns
id (primary key)
user_id (foreign key and required)
city (string and optional)
age (string and optional)
homepage (string and optional)
adjust the init.sql for that -->

<!-- Additional profile information page
create handlebars file accordingly -->

<!-- create GET route in express app -->
<!-- create POST route when user is submitting the additional profile information -->
<!-- create new function in db.js in order to INSERT new data into the user_profiles table -->
<!-- Change appearence of signers page -->
<!-- show now information about age and city as well -->
<!-- create for that a new function in your db.js with FULL OUTER JOIN to get the data from users and user_profiles table -->
<!-- insert link in handlebars file for the name if the person has a homepage
insert link in handlebars file for the city if the person has provided a city -->

<!-- link should to go new route e.g. /signers/Berlin where you show information about all signers from a specific city
look into your portfolio project how we have dealt with dynamic parameters in the route. There is a way in express to listen to ANY route with /signers/:city and we have used it in our portfolio project (you will implement this dynamic route for the next bullet point) -->

<!-- ## Create new page for signers from a specific city -->
<!-- create handlebars file with appropiate GET route in your express app -->
<!-- you will need a new function in your db.js where you want to get signers from a specific city -->
<!-- here the name of the signer will also be a link when the person provided a value for the homepage -->

<!-- ## Change table structure of signatures table -->

<!-- we will not need the firstname and lastname anymore -->
<!-- we will get this information with the help of a query that uses JOIN on the users and signatures table -->

<!-- adjust your petition handlebars files accordingly (we don't need an input for firstname and lastname anymore) -->

change other queries accordingly where you'll need the firstname and lastname. Use a query that uses JOIN for the users and signatures table
