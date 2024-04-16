const nodemailer = require('nodemailer');
const { wrapWithEmailHTML } = require('./emailHTML');

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    // secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "grayce0@ethereal.email",
        pass: "8Yw4Eh5tbNz6WmtmB7",
    },
});

module.exports.sendEmail = async (destinationEmail, body, subject) => {
    return await transporter.sendMail({
        from: 'Graphic Groove',
        to: destinationEmail,
        subject: subject,
        html: body
    });
}

module.exports.sendVerificationEmail = async (user, originUrl) => {
    const body = `
<div style="display: flex; flex-flow: column nowrap; align-items: center; width: 100%;">
    <h1 style="text-align: center;">Verify your email address</h1>
    <p style="text-align: center;">Hello ${user.firstName}, thank you for signing up to Graphic Groove.<br>Please verify your email to have complete access to your new account.</p>
    <a style="padding: 1rem; background-color: black; color: white;" href="${originUrl}/verify/${user._id}/${user.emailVerificationId}">Verify</a>
</div>
`;
    module.exports.sendEmail(user.email, wrapWithEmailHTML(body), 'Email Verification');
}
