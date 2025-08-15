import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import pg from 'pg';

const app = express();
const mailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const today = new Date().toISOString().split("T")[0];
let posts = [
  {
    id: 1,
    title: "Sustainable living: Tips for an eco-friendly lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Gonçalo Amaro",
    date: "2025-08-07",
  },
];
let lastId = 1;

// middleware

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
dotenv.config({ path: ".env" });

// postgres

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
});

db.connect();

console.log(db.user, db.host, db.database, db.port)
// Entry route

app.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM escriba_notes");
  const notes = rows
  console.log(notes)
  try {
    const quote = await axios.get("https://zenquotes.io/api/today");
    const fullQuote = {
      message: quote.data[0].q,
      author: quote.data[0].a,
    };
    res.render("index.ejs", { notes, ...fullQuote });
  } catch (error) {
    res.render("index.ejs", {
      notes: notes,
      message: "Failed to load quote.",
      author: "Sorry",
      content: JSON.stringify(error),
    });
  }
});

// Todo routes

app.post("/post", async (req, res) => {
  const post = req.body.notepost?.trim();
  if (post) {
  const result = await db.query('INSERT INTO escriba_notes (title) VALUES ($1)',[post]) 
  }
  res.redirect("/");
});

app.post("/clear", async (req, res) => {
    const result = await db.query('DELETE FROM escriba_notes')
  
  res.redirect("/");
});

app.get("/notes", async (req, res) => {

  try {
    const { rows } = await db.query("SELECT * FROM escriba_notes");
    const notes = rows;
    res.render("notes.ejs", { notes });
  } catch (error) {
    res.render("notes.ejs", {
      notes: notes,
      content: JSON.stringify(error),
    });
  }
});

app.post("/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.id);
  if (!isNaN(idToDelete)) {
  const result = await db.query('DELETE FROM escriba_notes WHERE id = $1', [idToDelete])
    }
  res.redirect("/");
});

app.post("/notes/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.id);
  if (!isNaN(idToDelete)) {
  const result = await db.query('DELETE FROM escriba_notes WHERE id = $1', [idToDelete])
    }
  res.redirect("/notes");
});

app.get("/contact", (req, res) => {
  const showMessage = req.query.message === "sent"; // check if message=success
  res.render("contact.ejs", {
    messageSent: showMessage ? "Message sent." : "",
  });
});

// Mail routes (+rate limiter)

app.post("/sendmail", mailLimiter, async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_AUTH,
    },
  });

  const mailOptions = {
    from: `"${req.body.email}" <${process.env.MY_EMAIL}>`,
    replyTo: req.body.email,
    to: process.env.MY_EMAIL,
    subject: "New Message from Escriba",
    text: req.body.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/contact?message=sent");
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).send("Failed to send email.");
  }
});

// blog routes

app.get("/blog", (req, res) => {
  res.render("blog.ejs", { posts });
});

app.post("/blogpost", (req, res) => {
  const { title, content, author } = req.body;

  if (!title?.trim() || !content?.trim()) {
    // lembra-te do operador '?' para evitar curto-circuito.
    return res.status(400).send("Title/content required.");
  }

  lastId++;
  const newPost = {
    id: lastId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author || "Anonymous",
    date: today || "Timeless",
  };

  posts.unshift(newPost);
  res.redirect("/blog");
});

app.post("/blogpost/delete", (req, res) => {
  const findPostByIndex = posts.findIndex(
    (p) => p.id === parseInt(req.body.id)
  );
  if (findPostByIndex === -1)
    return res.status(404).json({ error: "Error. Couldn't delete." });
  posts.splice(findPostByIndex, 1);
  res.redirect("/blog");
});

// Jest

app.get("/health", (req, res) => res.status(200).json({ ok: true }));

// 404 HANDLER
app.use((req, res) => {
  res.status(404).send("Not found");
});

// GENERAL ERR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).send("Something broke");
});

export default app;
