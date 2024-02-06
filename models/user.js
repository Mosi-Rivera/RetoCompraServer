const roleConstants = require('../constants/role');
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {type: String, required: true, enum: roleConstants.arr, default: roleConstants.obj.CUSTOMER},
    refreshTokens: [{
        token:{type: String, required: true},
        expiration:{type: Date, required: true},
    }]
})

const User = mongoose.model("User", UserSchema);

module.exports = User;