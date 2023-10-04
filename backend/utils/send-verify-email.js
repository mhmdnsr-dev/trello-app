import nodemailer from 'nodemailer';

// nodemailer

const transporter = nodemailer.createTransport({
  service: 'gmail',
  // port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
const main = async function (sendTo, link) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Trello-app 🚀" <monasr1997@gmail.com>', // sender address
    to: `${sendTo.email}`, // list of receivers
    subject: 'Verify your account', // Subject line
    // text: `Hi ${sendTo.name} your verify link is `, // plain text body
    html: `
    <div style="text-align:center;">
    <h1>Welcome ${sendTo.name} to Trello-app</h1>
    <hr>
    <p>
    Thank you for signing up. Please verify your email address by clicking the following link: <a href="${link}">verify</a>
    <p>
    <hr>
    <p>Thanks!</p>
    <h3>Trello-app</h3>
    </div>
    `, // html body
  });

  return info;
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
};

export default main;
