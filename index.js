const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const Models = require('./models.js');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectionURI = process.env.CONNECTION_URI
mongoose.connect(connectionURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const Movie = Models.movies;
const User = Models.users;

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://movies-api-sqg3.onrender.com', 'https://mymovies0.netlify.app', 'https://HeliaTutueanu.github.io', 'https://HeliaTutueanu.github.io/movies-api-angular-client/welcome', 'https://HeliaTutueanu.github.io/movies-api-angular-client/movies', 'https://HeliaTutueanu.github.io/movies-api-angular-client/profile'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric()


app.get('/', (req, res) => {   // welcome
  res.send('Welcome to my movie database!');
});

app.use((err, req, res, next) => {   // error
  console.error(err.stack);
  res.status(500).send('Oh no, it looks like something went wrong!');
});

app.get('/movies', async (req, res) => {   // gets all movies
  await Movie.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {   // gets specific movie
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

app.get('/genres/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {   // gets specific genre
  const name = req.params.name;
  try {
    const genreDetails = await Movie.aggregate([
      {
        $match: {
          'Genre.Name': name,
        },
      },
      {
        $group: {
          _id: '$Genre.Name',
          name: { $first: '$Genre.Name' },
          description: { $first: '$Genre.Description' },
          movies: { $push: '$$ROOT' },
        },
      },]);
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

app.get('/directors/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {   // gets specific director
  const directorName = req.params.name;
  try {
    const directorDetails = await Movie.aggregate([
      {
        $match: {
          'Director.Name': directorName,
        },
      },
      {
        $group: {
          _id: '$Director.Name',
          name: { $first: '$Director.Name' },
          bio: { $first: '$Director.Bio' },
          movies: { $push: '$$ROOT' },
        },
      },]);
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

const Users = mongoose.model('User', userSchema);
app.post('/users/register', [   // creates user
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await User.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(409).send(req.body.Username + 'already exists');
      } else {
        User.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => { res.status(201).json(user) })
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

app.get('/users/all', passport.authenticate('jwt', { session: false }), async (req, res) => {   // gets all users
  await User.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.put('/users/update/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {   // gets specific user
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  await User.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
    { new: true })   // makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    })
});

app.delete('/users/remove/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {   // deletes specific user
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

app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {   // add favorite user movie
  await User.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true })   // this line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {   // remove favorite movie
  await User.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true })   // this line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});