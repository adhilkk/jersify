const express = require('express');
const mongoose = require('mongoose');

const path = require('path')
const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');
const nocache = require('nocache')
const  session = require('express-session')
const User = require("./models/userModel");
const flash = require('express-flash')

const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('css', express.static(path.join(__dirname, 'public/assets/css')));

app.use('js', express.static(path.join(__dirname, 'public/assets/js')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/asset', express.static(path.join(__dirname, 'public/asset')));
// app.use('asset', express.static(path.join(__dirname, 'public/asset')));

app.use(flash())
app.use(nocache());

app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static(path.join(__dirname, 'public')));



app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET 
}));

// View Engine
app.set('view engine', 'ejs');
// app.set('views','../views/users')

// Database connection
mongoose.connect(process.env.MONGODB)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
// user routes
const user_routes = require("./routes/userRoute");

app.use('/api',user_routes)

// Routes
  
//
const indexRoute = require('./routes/userRoute');
// app.use('/', indexRoute); 


//user login 
// app.use('/', userRouter);
// app.use('/admin', adminRouter);


//admin sign up

const Admin = require('./models/adminModel');
const bcryptjs = require("bcryptjs");


app.get('/qqqq', async (req, res) => {
  const securePassword = async (password) => {
    try {
      const passwordHash = await bcryptjs.hash(password, 10);
      return passwordHash;
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  // Create and save the admin document
  try {
    const apassword = await securePassword("12345");

    const admin = new Admin({
      email: 'admin@gmail.com',
      password: apassword
    });


    await admin.save();
    console.log('Admin saved to database');
    res.send('Admin saved to database');
  } catch (err) {
    console.error('Error saving admin:', err);
    res.status(500).send('Error saving admin');
  }
});



 
//blocckingg

app.use(express.static('public')); // To serve static files like CSS, JS, images
app.use('/admin', adminRouter);
app.use('/', userRouter);


app.get('*', (req, res) => {
    
  res.redirect('/404');

});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
