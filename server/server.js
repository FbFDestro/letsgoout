const express = require('express');
const morgan = require('morgan');

const app = express();

// Initialize env variables
require('dotenv').config();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/users', require('./app/routes/users'));

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));
