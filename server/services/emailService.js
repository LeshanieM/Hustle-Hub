const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    try {

        // 👇 ADD THESE 2 LINES HERE
        console.log("USER:", process.env.EMAIL_USER);
        console.log("PASS:", process.env.EMAIL_PASS);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        await transporter.sendMail({
            from: `"Hustle Hub System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification OTP - Hustle Hub",
            text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
            html: `<h3>Welcome to Hustle Hub!</h3>
                   <p>Your SLIIT Verification OTP is <b>${otp}</b></p>
                   <p>It will expire in 10 minutes.</p>`,
        });

        console.log("\n================ PRODUCTION EMAIL ================");
        console.log(`✅  Successfully sent real OTP to your SLIIT email: ${email}`);
        console.log("==================================================\n");

    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};

module.exports = { sendOTP };