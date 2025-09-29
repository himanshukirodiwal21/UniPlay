import { Verification_Email_Template, Welcome_Email_Template } from "../db/EmailTemplate.js";
import { transporter } from "../middlewares/Email.config.js";

export const SendVerficationCode = async(email, verificationCode) =>{
    try {
        
        const response = await transporter.sendMail({
                    from: '"Uniplay" <raviswami0932@gmail.com>',
                    to: email,
                    subject: "Verify your email",
                    text: "Verify your Email", // plain‑text body
                    html: Verification_Email_Template.replace("{verificationCode}", verificationCode), // HTML body
                });
                console.log("Email send Successfully", response)

    } catch (error) {
        console.log('Email error')
    }
}

export const WelcomeEmail = async(email, name) =>{
    try {
        
        const response = await transporter.sendMail({
                    from: '"Uniplay" <raviswami0932@gmail.com>',
                    to: email,
                    subject: "Verify your email",
                    text: "Verify your Email", // plain‑text body
                    html: Welcome_Email_Template.replace("{name}", name), // HTML body
                });
                console.log("Email send Successfully", response)

    } catch (error) {
        console.log('Email error')
    }
}