require('dotenv').config();
const {CUSTOMER} = require('../constants/role.js').obj;
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { parseInputStrToInt } = require('../utils/input.js');

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
        const [_, __, firstName, lastName, email, password, count] = process.argv;
        if (!emailValidator.validate(email) || !PasswordSchema.validate(password))
            throw new Error("Invalid email or password.");
        const hashpass = await bcrypt.hash(password, 10);
        const users = [];
        const max = parseInputStrToInt(count, 10);
        for (let i = 1; i < max; i++) {
            users.push({firstName: firstName + i, lastName, role: CUSTOMER, email: i + email, password: hashpass, emailVerified: true, emailVerificationId: crypto.randomBytes(20).toString('hex')});
        }
        await User.insertMany(users);
        console.log('DONE');
    } catch (error) {
       console.log(error);
    } finally {
        mongoose.disconnect();
    }
})();
