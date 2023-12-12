import UserModel from '../models/user.schema.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

class UserController {
    // Method to render the registration page
    async getRegistrationPage(req, res) {
        res.render('registration', { errorMessage: null });
    }

    // Method to render the login page
    async getLoginPage(req, res) {
        res.render('login', { errorMessage: null });
    }

    // Method to render the index page
    async getIndexView(req, res) {
        res.render('index', { errorMessage: null });
    }

    // Method to render the reset password page
    async getResetPasswordPage(req, res) {
        res.render('reset-password', { errorMessage: null });
    }

    // Method to handle user registration
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            // Check if the email is already in use
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.render('registration', { errorMessage: 'Email already in use' });
            }

            // Validate password format
            if (!/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/.test(password)) {
                return res.render('registration', { errorMessage: 'Password should be between 8-12 characters and have a special character' });
            }

            // Create a new user and save to the database
            const newUser = new UserModel({ name, email, password });
            await newUser.save();

            // Render the login page after successful registration
            res.render('login', { errorMessage: null });
        } catch (error) {
            console.error(error);
            res.render('login', { errorMessage: 'Internal Server Error' });
        }
    }

    // Method to handle user login
    async signin(req, res) {
        try {
            const { email, password } = req.body;

            // Find the user with the provided email
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.render('login', { errorMessage: 'Invalid email or password' });
            }

            // Compare the provided password with the stored hashed password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.render('login', { errorMessage: 'Invalid email or password' });
            }

            // Set user session data and render the welcome page
            req.session.userEmail = user.email;
            req.session.userName = user.name;
            res.render('welcomePage', { userEmail: req.session.userEmail, userName: req.session.userName, errorMessage: '' });
        } catch (error) {
            console.error(error);
            res.render('login', { errorMessage: 'An unexpected error occurred' });
        }
    }

    // Method to handle user logout
    async logout(req, res) {
        try {
            // Destroy the user session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    res.render('login', { errorMessage: 'Internal Server Error' });
                } else {
                    // Redirect to the home page after logout
                    res.redirect('/');
                }
            });
        } catch (error) {
            console.error(error);
            res.render('login', { errorMessage: 'Internal Server Error' });
        }
    }

    // Method to handle reset password request
    async resetPasswordRequest(req, res) {
        try {
            const { email } = req.body;

            // Check if the user with the provided email exists
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.render('reset-password', { errorMessage: 'No user found with this email' });
            }

            // Generate a reset token, send reset email, and render mail-sent page
            const resetToken = generateResetToken(user);
            sendResetEmail(user.email, resetToken);
            return res.render('mail-sent', { errorMessage: null });
        } catch (error) {
            console.error(error);
            res.render('reset-password', { errorMessage: 'Internal Server Error' });
        }
    }

    // Method to render the reset password page with token
    async getResetPasswordWithTokenPage(req, res) {
        try {
            const { token } = req.params;

            // Check if the reset token is provided
            if (!token) {
                return res.render('reset-password', { errorMessage: 'Token not provided' });
            }

            // Verify the reset token and render the reset-password-token page
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    console.error(err); // Log the error for debugging
                    return res.status(401).json({ error: 'Invalid or malformed token' });
                }
                res.render('reset-password-token', { token, errorMessage: null });
            });
        } catch (error) {
            console.error(error);
            res.render('reset-password', { errorMessage: 'Internal Server Error' });
        }
    }

    // Method to handle resetting password with the provided token
    async postResetPasswordWithToken(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Verify the reset token
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.render('reset-password-token', { token, errorMessage: 'Invalid or expired reset token' });
                }

                // Update user's password
                const user = await UserModel.findById(decoded.userId);
                if (!user) {
                    return res.render('reset-password-token', { token, errorMessage: 'User not found' });
                }

                user.password = newPassword;
                await user.save();

                res.render('success-page', { token, errorMessage: 'Password reset successfully' });
            });
        } catch (error) {
            console.error(error);
            res.render('reset-password-token', { errorMessage: 'Internal Server Error' });
        }
    }
}

// Function to generate a reset token for a user
function generateResetToken(user) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

// Function to send a reset email to the user
function sendResetEmail(email, token) {
    const resetLink = `http://localhost:3005/reset-password/${token}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASS,
        },
    });

    // Compose email options
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: `
            <p>You have requested to reset your password.</p>
            <p>Click the following link to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
        `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export default UserController;
