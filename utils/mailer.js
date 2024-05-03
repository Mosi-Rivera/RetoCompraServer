const nodemailer = require('nodemailer');
const { wrapWithEmailHTML } = require('./emailHTML');

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports.sendEmail = async (destinationEmail, body, subject) => {
    return await transporter.sendMail({
        from: 'Graphic Groove',
        to: destinationEmail,
        subject: subject,
        html: body
    });
}

module.exports.sendVerificationEmail = async (user, code) => {
    if (!code || typeof code !== 'string') throw new Error('Invalid code.');
    const body = `
<div style="display: flex; flex-flow: column nowrap; align-items: center; width: 100%;">
    <h1 style="text-align: center;">Verify your email address</h1>
    <p style="text-align: center;">Hello ${user.firstName}, thank you for signing up to Graphic Groove.<br>Please verify your email to have complete access to your new account.</p>
    <p>Your verification code is:</p>
    <div style="padding: 2rem; font-size: 2rem; font-weight: 700; border-radius: 5px; background-color: 'rgba(0, 0, 0, 0.3)'">
        ${code.split("").join(' ')}
    </div>
</div>
`;
    module.exports.sendEmail(user.email, wrapWithEmailHTML(body), 'Email Verification');
}
