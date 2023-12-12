// user.schema.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: { type: String, maxLength: [25, "Name can't be greater than 25 characters"] },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\../, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/.test(value)
            },
            message: "Password should be between 8-12 characters and have a special character"
        }
    },
    resetToken: String,
    resetTokenExpiry: Date,
});

// Method to hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
