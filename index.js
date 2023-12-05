const express = require('express');
const morgan = require('morgan');
const app = express();

const topMovies = [
  { title: 'Movie 1', year: 2020, genre: ['Action', 'Fantasy'] },
  { title: 'Movie 2', year: 2019, genre: 'Drama' },
  { title: 'Movie 3', year: 2007, genre: 'Fantasy' },
  { title: 'Movie 4', year: 2013, genre: 'Romance' },
  { title: 'Movie 5', year: 2023, genre: ['Thriller', 'Drama'] },
  { title: 'Movie 6', year: 2023, genre: 'Thriller' },
  { title: 'Movie 7', year: 2022, genre: 'Fantasy' },
  { title: 'Movie 8', year: 2009, genre: ['Teen', 'Drama'] },
  { title: 'Movie 9', year: 2001, genre: ['Thriller', 'Action'] },
  { title: 'Movie 10', year: 2021, genre: ['Mystery', 'Drama'] },
];

app.use(morgan('dev'));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json({ movies: topMovies });
});

app.get('/', (req, res) => {
    res.send('Welcome to my movie database!');
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no, it looks like something went wrong!');
});

  
app.listen(8080, () => {
  console.log('This app is listening on port 8080.');
});