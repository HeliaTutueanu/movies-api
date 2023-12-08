const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());

const movies = [
  { title: 'Movie1',
  year: 2020,
  genre: ['Action', 'Fantasy'],
  description: 'An action and fantasy movie.',
  director: 'director1',
  imageUrl: 'movie1.jpg',
  featured: true },
  { title: 'Movie2',
  year: 2019,
  genre: 'Drama',
  description: 'A dramatic movie.', 
  director: 'director2',
  imageUrl: 'movie2.jpg', 
  featured: false },
  { title: 'Movie 3', year: 2007, genre: 'Fantasy' },
  { title: 'Movie 4', year: 2013, genre: 'Romance' },
  { title: 'Movie 5', year: 2023, genre: ['Thriller', 'Drama'] },
  { title: 'Movie 6', year: 2023, genre: 'Thriller' },
  { title: 'Movie 7', year: 2022, genre: 'Fantasy' },
  { title: 'Movie 8', year: 2009, genre: ['Teen', 'Drama'] },
  { title: 'Movie 9', year: 2001, genre: ['Thriller', 'Action'] },
  { title: 'Movie 10', year: 2021, genre: ['Mystery', 'Drama'] },
];

const users = [{
  userID: 'user1',
  username: 'user123',
  favorites: ['Movie1'],
}];

app.get('/', (req, res) => {
    res.send('Welcome to my movie database!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no, it looks like something went wrong!');
});

app.get('/movies', (req, res) => {
  res.send('List of all movies');
  res.json(movies);
});

app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const movie = movies.find((m) => m.title === title);
  if (movie) {
    res.send(`Movie details for ${title}`);
    res.json(movie);
  } else {
    res.status(404).json({ error: 'Movie not found' });
  }
});

app.get('/genres/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Genre details for ${name}`);
});

app.get('/directors/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Director details for ${name}`);
});

app.post('/users/register', (req, res) => {
  res.send('User registration successful');
});

app.put('/users/update/:userID', (req, res) => {
  const userID = req.params.userID;
  res.send(`User information updated for userID: ${userID}`);
});

app.post('/users/:userID/favorites/add/:movieID', (req, res) => {
  const userID = req.params.userID;
  const movieID = req.params.movieID;
  res.send(`Movie added to favorites for userID: ${userID}`);
});

app.post('/users/:userID/favorites/remove/:movieID', (req, res) => {
  const userID = req.params.userID;
  const movieID = req.params.movieID;
  res.send(`Movie removed from favorites for userID: ${userID}`);
});

app.delete('/users/delete/:userID', (req, res) => {
  const userID = req.params.userID;
  res.send(`User deregistration successful for userID: ${userID}`);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});