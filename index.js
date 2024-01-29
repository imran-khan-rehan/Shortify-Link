const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static('public'));

app.use(session({ secret: 'bcsf20a018', resave: true, saveUninitialized: true }));

mongoose.connect("mongodb://127.0.0.1:27017/ShortenerLink", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("connected to db")).catch(console.error);

const User = require('./models/user');

const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');

app.use('/', authRoutes);
app.use('/', linksRoutes);
app.get('/', (req, res) => {
  res.render('signup',{message:""});
})
app.get('/signin', (req, res) => {
//  console.log('signin');
  res.render('signin',{message:""});
})

app.get('/home', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (userId) {
      res.render('home', { links: [], message: "" });
    }
    else {
      res.redirect('/signin');

    }
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
})

app.listen(3005, () => {
  console.log('Server is running on port 3005');
});
