# Movie API Documentation

## Description
This API provide users with access to information about different movies, directors, and genres. Users are able to sign up, update their personal information, and create a list of their favorite movies.

## Dependencies
* **Node.js**: JavaScript runtime for server-side scripting.
* **Express**: Back end web application framework for building RESTful APIs with Node.js.
* **MongoDB with Mongoose**: NoSQL database and Object Data Modeling library for Node.js.
* **Postman**: Allows you to design, develop, test and monitor APIs.
* **body-parser**: Express middleware for parsing request bodies.
* **express-validator**: Middleware for input validation in Express.
* **jsdoc**: Tool to generate documentation from JavaScript code.
* **jsonwebtoken**: Library for JWT ( JSON Web Token) generation and verification.
* **passport**: Authentication middleware for Node.js.
* **passport-jwt**: Passport strategy for JWT authentication.
* **passport-local**: Passport strategy for username/password authentication.

## Endpoints
### Get all movies
* **URL**: `/movies`
* **Request body**: None
* **Response body**: A JSON object holding data about all movies.

### Get a single movie
* **URL**: `/movies/[title]`
* **Request body**: None
* **Response body**: A JSON object holding data about a single movie, containing title, year, genre, director.

### Get genre information
* **URL**: `/movies/genre/[genreName]`
* **Request body**: None
* **Response body**: A JSON object holding data about a single genre, containing genre name, description.

### Get director information
* **URL**: `/movies/directors/[directorName]`
* **Request body**: None
* **Response body**: 	A JSON object holding data about a single director, containing director name, bio, birth and death year.

### Get all users
* **URL**: `/users`
* **Request body**: None
* **Response body**: A JSON object holding data about all users.

### Get a single user
* **URL**: `/users/[Username]`
* **Request body**: None
* **Response body**: 	A JSON object holding data about a single user, containing username, password, email, birthday, favorite movies.

### Post new user (register)
* **URL**: `/users`
* **Request body**: A JSON object holding data about the user to add.
* **Response body**: A JSON object holding data about the user that was added, including an ID.

### Put user information (update)
* **URL**: `/users/[Username]`
* **Request body**: A JSON object holding data about the user which needs to be updated.
* **Response body**: A JSON object holding data about the updated user information.

### Post movie to users favorite movies list
* **URL**: `/users/[Username]/movies/[MovieID]`
* **Request body**: None
* **Response body**: A JSON object holding data about the updated user information.

### Delete movie from users favorite movie list
* **URL**: `/users/[Username]/movies/[MovieID]`
* **Request body**: None
* **Response body**: A JSON object holding data about the updated user information.

### Delete user
* **URL**: `/users/[Username]`
* **Request body**: None
* **Response body**: Text message indicating whether the user deregister successfully.