const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const cron = require('node-cron');
const fs = require('fs');
const process = require('process');
require('dotenv').config()

app.use(express.json());
const port = 8080;

const myOAuth2Client = new OAuth2(
  process.env.client_id,
  process.env.client_secret,
  'https://developers.google.com/oauthplayground'
);

myOAuth2Client.setCredentials({ refresh_token: process.env.refresh_token });
const myAccessToken = myOAuth2Client.getAccessToken()
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
       type: 'OAuth2',
       user: process.env.user,
       clientId: process.env.client_id,
       clientSecret: process.env.client_secret,
       refreshToken: process.env.refresh_token,
       accessToken: myAccessToken
  }
});

const TYPE = process.env.type;
const SCHEDULE = process.env.schedule;
const PAYLOAD = process.env.payload;
const TARGETS = process.env.targets.split(',');

console.log(`TYPE: ${TYPE}`);
console.log(`SCHEDULE: ${SCHEDULE}`);
console.log(`PAYLOAD: ${PAYLOAD}`);
console.log(`TARGETS: ${TARGETS}`);

let subject = '';
try {
  subject = fs.readFileSync('./subject.txt', 'utf8');
  console.log(subject);
} catch (err) {
  console.error(err);
  process.exit(1);
}

let message = '';
try {
  message = fs.readFileSync('./message.txt', 'utf8');
  console.log(message);
} catch (err) {
  console.error(err);
  process.exit(1);
}
if (!subject || !message) process.exit(0);

const mailOptions = {
  from: process.env.user,
  to: TARGETS,
  subject: subject,
  text: message
};

function send() {
  transport.sendMail(mailOptions, function(err, result) {});
}

function bulkSend(payload = 1) {
  const safetyCap = 100;
  if (payload > safetyCap) {
    payload = safetyCap;
  }
  for (let i = 0; i < payload; i++) {
    send();
  }
}

function intervalSend(payload, schedule) {
  let expression = '';
  let message = '';
  switch (schedule) {
    case 'minute':
      expression = '* * * * *';
      if (payload > 5) {
        payload = 5;
      }
      message = `Sending ${payload} email(s) every minute`;
      break;
    case 'hour':
      expression = '0 * * * *'; 
      if (payload > 20) {
        payload = 20;
      }
      message = `Sending ${payload} email(s) every hour`;
      break;
    case 'day':
      expression = '0 9 * * *';
      if (payload > 50) {
        payload = 50;
      }
      message = `Sending ${payload} email(s) every day`;
      break;
    default:
      break;
  }

  if (expression) {
    const task = cron.schedule(expression, () =>  {
      console.log(message);
      bulkSend(payload);
    });
    task.start();
  }
}

function fibSend() {
  const fibSequence = [1, 3, 5, 8, 13, 21, 34, 55, 89, 144]; // Capped at 10
  let day = 0;
  const task = cron.schedule('0 9 * * *', () =>  {
    if (day >= 10) {
      process.exit(0);
    }
    const fib = fibSequence[day];
    console.log(`Fib-${day}: Sending ${fib} emails`);
    bulkSend(fib);
    day += 1;
  });
  task.start();
}

app.get('/bombsaway', async (req, res) => {
  transport.sendMail(mailOptions, function(err, result) {
    if (err) {
      res.status(400).json(err);
    } 
    transport.close();
    res.status(200).json('BOOM');
  });
});

app.listen(port, () => {
  console.log(`warmregards is listening at http://localhost:${port}`);

  // main
  if (!TYPE) return;
  switch (TYPE) {
    case 'bulk':
      console.log(`Bulk selected. Sending ${PAYLOAD} emails.`);
      bulkSend(PAYLOAD);
      break;
    case 'interval':
      console.log(`Interval selected. Sending ${PAYLOAD} emails per ${SCHEDULE}`);
      intervalSend(PAYLOAD, SCHEDULE);
      break;
    case 'fibonacci':
      console.log('Fibnacci selected. Sending fib emails per day.');
      fibSend();
      break;
    default:
      break;
  }
});