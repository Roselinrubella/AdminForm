const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// In-memory storage for feedback
let feedbackData = [];

// Hardcoded admin credentials
const adminCredentials = {
    username: 'admin',
    password: 'password'
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key', // Change this to a random secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.static(path.join(__dirname)));

// Middleware to protect admin routes
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// API endpoint for admin login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.loggedIn = true;
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// API endpoint to submit feedback
app.post('/api/feedback', (req, res) => {
    const { name, email, feedback } = req.body;
    if (!name || !email || !feedback) {
        return res.status(400).send('All fields are required.');
    }
    const newFeedback = { id: Date.now(), name, email, feedback, date: new Date().toISOString() };
    feedbackData.push(newFeedback);
    res.status(201).send('Feedback submitted successfully.');
});

app.get('/admin.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin endpoint to get feedback data
app.get('/api/feedback', requireLogin, (req, res) => {
    res.json(feedbackData);
});

// Admin endpoint to export feedback as an Excel file
app.get('/api/feedback/export', requireLogin, (req, res) => {
    const worksheet = xlsx.utils.json_to_sheet(feedbackData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    const filePath = path.join(__dirname, 'feedback.xlsx');
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'feedback.xlsx', (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        // Clean up the file after sending
        fs.unlinkSync(filePath);
    });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin.html');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});