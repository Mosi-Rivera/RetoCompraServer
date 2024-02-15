const bcrypt = require('bcryptjs');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
const schema = new passwordValidator();
schema
    .is().min(5)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()

module.exports.hashPassword = async password => {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

module.exports.compareHash = (password, hash) => bcrypt.compare(password, hash);

module.exports.validatePassword = password => password && schema.validate(password);

module.exports.validateEmail = email => email && emailValidator.validate(email);
