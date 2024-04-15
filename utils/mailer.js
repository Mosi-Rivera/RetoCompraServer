const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    // secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "grayce0@ethereal.email",
        pass: "8Yw4Eh5tbNz6WmtmB7",
    },
});

module.exports.sendEmail = async (destinationEmail, body) => {
    return await transporter.sendMail({
        from: 'Graphic Groove',
        to: destinationEmail,
        subject: "Order Confirmation",
        html: body
    });
}
