import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
});

export const sendNotificationEmail = async (subject: string, text: string, html?: string, attachments?: any[]) => {
    try {
        if (!process.env.SMTP_USER || !process.env.NOTIFICATION_EMAIL) {
            console.log('Skipping email notification because SMTP is not configured in .env');
            return;
        }

        await transporter.sendMail({
            from: `"Haxxcel AutoMedia" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFICATION_EMAIL,
            subject: subject,
            text: text,
            html: html || text,
            attachments: attachments || [],
        });
        console.log(`Email notification sent: ${subject}`);
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};
