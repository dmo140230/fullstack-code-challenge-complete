const express           = require('express');
const path              = require('path');
const cookieParser      = require('cookie-parser');
const logger            = require('morgan');
const fileUpload        = require('express-fileupload');
const cors              = require('cors');
const seed              = require('./seed');
const routes            = require('./routes');
const app               = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({ createParentPath: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

seed();
app.use('/api/v1', routes)

module.exports = app;
