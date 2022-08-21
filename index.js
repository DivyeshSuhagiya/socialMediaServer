require('dotenv').config()
require('./config/db')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const corsOptionsDelegate = require('./middleware/cors')
const multer = require('multer')
const path = require('path')

// app.use('/uploads', express.static('uploads'));
app.use(
    express.json({
        limit: '1024mb',
    }),
)
app.use(bodyParser.json());

app.use(cors(corsOptionsDelegate))

const routes = require('./routes/index')
app.use('/api', routes)


const port = process.env.PORT || 4000;
app.listen(port, function () {
    console.log(`The web server has started on port ${port}`);
});
