const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const Models = require('./models.js');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Movie = Models.movies;
const User = Models.users;
mongoose.connect('mongodb://localhost:27017/mvDB', { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {   // welcome
    res.send('Welcome to my movie database!');
});

app.use((err, req, res, next) => {   // error
  console.error(err.stack);
  res.status(500).send('Oh no, it looks like something went wrong!');
});

app.get('/movies', async (req, res) => {   // gets all movies
  const movies = await Movie.find({});
  if (movies) {
    res.json({ message: 'List of all movies', movies: movies });
  } else {
    res.status(500).json({ error: 'Error fetching movies' });
  }
});

app.get('/movies/:title', async (req, res) => {   // gets specific movie
  const title = req.params.title;
  try {
    const movie = await Movie.findOne({ Title: title });

    if (movie) {
      res.json({ message: 'Movie details:', movie: movie });
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/genres/:name', async (req, res) => {   // gets specific genre
  const name = req.params.name;
  try {
    const genreDetails = await Movie.aggregate([
      {$match: {
          'Genre.Name': name,
        },},
      {$group: {
          _id: '$Genre.Name',
          name: { $first: '$Genre.Name' },
          description: { $first: '$Genre.Description' },
          movies: { $push: '$$ROOT' },
        },},]);
    if (genreDetails.length > 0) {
      res.json({ message: 'Genre details:', genre: genreDetails[0] });
    } else {
      res.status(404).json({ error: 'Genre not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/directors/:name', async (req, res) => {   // gets specific director
  const directorName = req.params.name;
  try {
    const directorDetails = await Movie.aggregate([
      {$match: {
          'Director.Name': directorName,
        },},
      {$group: {
          _id: '$Director.Name',
          name: { $first: '$Director.Name' },
          bio: { $first: '$Director.Bio' },
          movies: { $push: '$$ROOT' },
        },},]);
    if (directorDetails.length > 0) {
      res.json({ message: 'Director details:', director: directorDetails[0] });
    } else {
      res.status(404).json({ error: 'Director not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/users/register', async (req, res) => {   // creates userr
  await User.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(409).send(req.body.Username + 'already exists');
      } else {
        User.create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.get('/users/all', async (req, res) => {   // gets all users
  await User.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', async (req, res) => {   // gets specific user
  await User.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.put('/users/update/:Username', async (req, res) => {   // updates specific user
  await User.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })   // this line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

app.delete('/users/remove/:Username', async (req, res) => {   // deletes specific user
  try {
    const deletedUser = await User.findOneAndDelete({ Username: req.params.Username });

    if (!deletedUser) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});

app.post('/users/:Username/favorites/add/:MovieID', async (req, res) => {   // add favorite user movie
  await User.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true })   // this line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:'  + err);
  });
});

app.delete('/users/:Username/favorites/remove/:MovieID', async (req, res) => {   // remove favorite movie
  await User.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true })   // this line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:'  + err);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});