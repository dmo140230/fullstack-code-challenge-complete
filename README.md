# Completed Code Challenge
This is a fully functional RESTful API written in Node.js,with an accompanying React frontend to display data from the API.

## Installation

### Database
To set up the database, locate `db.js` inside `./server/main`, and add your local PostgreSQL credentials.
Once that is complete, the database will seed itself using with `./server/main/seed.js` upon startup by executing `schema.sql`.

### Application
To install the application, simply run `npm install` from the root directory

## Usage
From the root directory run the command `npm start` to start both the client and server. That's it!

### Signing In
To authenticate in the UI, enter any of the email/password credentials located in `./server/main/users.js`

### API Calls
Included in the repo is a Postman collection with all of the API requests set up for your convenience. 
You can import it into Postman and begin calling the API right away.

## Testing
All tests were written using Postman's built in API testing tools, which runs JavaScript underneath the hood. Upon importing the included Postman collection, the test scripts will be made available as well, although a Postman account may be required
https://learning.getpostman.com/docs/postman/scripts/test-scripts/

