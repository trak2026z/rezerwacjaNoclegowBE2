const express = require('express'); // Fast, unopinionated, minimalist web framework for node.
const app = express(); // Initiate Express Application
const router = express.Router(); // Creates a new router object.
const mongoose = require('mongoose'); // Node Tool for MongoDB
mongoose.Promise = global.Promise;
const config = require('./config/database'); // Mongoose Config
const path = require('path'); // NodeJS Package for file paths
const authentication = require('./routes/authentication')(router); // Import Authentication Routes
const rooms = require('./routes/rooms')(router); // Import Room Routes
const bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const cors = require('cors'); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const port = process.env.PORT || 3000;
// Database Connection
mongoose.connect(config.uri, { })
  .then(() => console.log('Connected to ' + config.db))
  .catch(err => console.error('Could NOT connect to database: ', err));

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(express.static(__dirname + '/public')); // Provide static directory for frontend
app.use('/authentication', authentication); // Use Authentication routes in application
app.use('/rooms', rooms); // Use Room routes in application

app.get("/health", (req,res) => res.json({status:"okOKok"}));

// Connect server to Angular 2 Index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




// Start Server: Listen on port 3000
app.listen(port, () => {
    console.log('Listening on port ' + port);
});