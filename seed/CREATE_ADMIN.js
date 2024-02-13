require('dotenv').config();
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const PasswordSchema = new PasswordValidator();
PasswordSchema
.is().min(5)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits();
(async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        const [_, __, firstName, lastName, email, password] = process.argv;
        if (!emailValidator.validate(email) || !PasswordSchema.validate(password))
            throw new Error("Invalid email or password.");
        const hashpass = await bcrypt.hash(password, 10);
        const user  = await User.create({firstName, lastName, role: "admin", email, password: hashpass});
        console.log(user);
    } catch (error) {
       console.log(error);
    } finally {
        mongoose.disconnect();
    }
})();
