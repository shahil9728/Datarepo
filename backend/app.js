const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
require('./conn'); // Ensure MongoDB connection
const bodyParser = require('body-parser');
const { Register } = require('./conn');
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 4000;
const session = require('express-session');
// Set up paths
const static_path = path.join(__dirname, '../templates/views');
const partial_path = path.join(__dirname, '../templates/partials');

// Set up HBS
app.set('view engine', 'hbs');
app.set('views', static_path);
hbs.registerPartials(partial_path);


// Middleware for parsing the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'yourSecretKey',
    resave: true,
    saveUninitialized: true,
}));

// Middleware for checking authentication
const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        next(); // User is authenticated, proceed to the next middleware/route
    } else {
        if (req.path !== '/login' && req.path !== '/contact') {
            res.redirect('/login'); // User is not authenticated, redirect to login page
        } else {
            next();
        }
    }
};
// Use the authentication middleware for all routes except /login
app.use((req, res, next) => {
    if (req.path !== '/login') {
        authenticateUser(req, res, next);
    } else {
        next();
    }
});
// Routes
app.get('/', (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        res.render('index');
    } else {
        res.redirect('/login');
    }
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/more', (req, res) => {
    res.render('more');
});

app.post('/', async (req, res) => {
    try {
        const reg = req.body.reg;
        const hashedReg = await bcrypt.hash(reg, 10);

        const newRegister = new Register({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            roll: req.body.roll,
            section: req.body.section,
            reg: hashedReg, // Save the hashed registration number
        });

        await newRegister.save();
        req.session.user = req.body.firstname;
        res.send("Registration successful");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const firstname = req.body.firstname;
        const reg = req.body.reg;

        const user = await Register.findOne({ firstname: firstname });
        
        if (user && (await bcrypt.compare(reg, user.reg))) {
            req.session.user = firstname;
            res.render('index');
        } else {
            res.render('error');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, (req, res) => {
    console.log("Server is runnning at 4000");
})