'use strict'
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/clothingStore')
    .then(() => console.log('Connected to database.'))    
