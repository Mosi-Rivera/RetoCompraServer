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
    },

    tls: {
        rejectUnauthorized:false
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
<div style="max-width: 600px;">
    <h1 style="text-align: center; margin: 0 auto;">Verify your email address</h1>
    <p style="text-align: center; margin: 0 auto;">Hello ${user.firstName}, thank you for signing up to Graphic Groove.<br>Please verify your email to have complete access to your new account.</p>
    <p style="margin: 0 auto; text-align: center;">Your verification code is:</p>
    <div style="display: block; margin: 0 auto; margin: 0 auto;">
        <h1 style="text-align: center;">${code.split("").join(' ')}</h1>
    </div>
</div>
`;
    module.exports.sendEmail(user.email, wrapWithEmailHTML(body), 'Email Verification');
}
