// send-email.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Gmail API 설정
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

// ... (길고 긴 JavaScript 코드)
