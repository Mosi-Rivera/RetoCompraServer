require('dotenv').config();
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
const PasswordSchema = new PasswordValidator();
PasswordSchema
.is().min(5)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits();
const usageLog = () => console.log("Usage: node CREATE_ADMIN.js [firstName] [lastName] [email] [password]");
(async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        const [_, __, firstName, lastName, email, password] = process.argv;
        if (!firstName || ! lastName || !email || !password)
            throw new Error("Err: Missing arguments.");
        if (!emailValidator.validate(email))
            throw new Error("Invalid email.");
        if(!PasswordSchema.validate(password))
            throw new Error("Invalid password.");
        const hashpass = await bcrypt.hash(password, saltRounds);
        const user  = await User.create({firstName, lastName, role: "admin", email, password: hashpass});
        console.log(user);
    } catch (error) {
        console.log(error.message);
        usageLog();
    } finally {
        mongoose.disconnect();
    }
})();
