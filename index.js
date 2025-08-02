import express from "express";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config({ path: '.env' })

const app = express();
const port = 3000;
let notes = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  const data = {
    notes: notes,
  }
  res.render('index.ejs', {...data})
});

app.post('/post', (req, res) => {
  const post = req.body.blogPost?.trim();
  if (post) {
    notes.push(post);
  };
  res.redirect('/');
});

app.post('/clear', (req, res) => {
  notes = []
  res.redirect('/');
});

app.get('/notes', (req, res) => {
    const data = {
    notes: notes,
  }
  res.render('notes.ejs', {...data})
});

app.post('/delete', (req, res) => { // para escolher um index de um array (lista) e eliminar. Util para to-dos.
  const indexToDelete = parseInt(req.body.index);
  if (!isNaN(indexToDelete)) {
    notes.splice(indexToDelete, 1);
  }
  res.redirect('/');
});

app.post('/notes/delete', (req, res) => { // para escolher um index de um array (lista) e eliminar. Util para to-dos.
  const indexToDelete = parseInt(req.body.index);
  if (!isNaN(indexToDelete)) {
    notes.splice(indexToDelete, 1);
  }
  res.redirect('/notes');
});

app.get('/contact', (req, res) => {
  const showMessage = req.query.message === 'sent'; // check if message=success
  res.render('contact.ejs', { messageSent: showMessage ? 'Message sent.' : '' });
});

app.post('/sendmail', async (req, res) => {
  console.log(req.body);
  console.log('EMAIL:', process.env.MY_EMAIL);
  console.log('PASS:', process.env.MY_AUTH);
  
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL ,
    pass: process.env.MY_AUTH,
  },
});

  const mailOptions = {
    from: `"${req.body.email}" <${process.env.MY_EMAIL}>`,
    to: process.env.MY_EMAIL, 
    subject: 'New Message from Escriba',
    text: req.body.message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/contact?message=sent');
  } catch (err) {
    console.error('Email failed:', err);
    res.status(500).send("Failed to send email.");
  }
});

app.listen(port, () => {
  console.log("Running on port: " + port)
})
