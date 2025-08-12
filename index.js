import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";

const app = express();
const port = 3000;
const mailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
let notes = [];
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

// Entry route

app.get("/", async (req, res) => {
  const data = {
    notes: notes,
  };
  try {
    const quote = await axios.get("https://zenquotes.io/api/today");
    const fullQuote = {
      message: quote.data[0].q,
      author: quote.data[0].a,
    };
    res.render("index.ejs", { ...data, ...fullQuote });
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

app.post("/post", (req, res) => {
  const post = req.body.notepost?.trim();
  if (post) {
    notes.push(post);
  }
  res.redirect("/");
});

app.post("/clear", (req, res) => {
  notes = [];
  res.redirect("/");
});

app.get("/notes", (req, res) => {
  const data = {
    notes: notes,
  };
  res.render("notes.ejs", { ...data });
});

app.post("/delete", (req, res) => {
  // para escolher um index de um array (lista) e eliminar. Util para to-dos.
  const indexToDelete = parseInt(req.body.index);
  if (!isNaN(indexToDelete)) {
    notes.splice(indexToDelete, 1);
  }
  res.redirect("/");
});

app.post("/notes/delete", (req, res) => {
  // para escolher um index de um array (lista) e eliminar. Util para to-dos.
  const indexToDelete = parseInt(req.body.index);
  if (!isNaN(indexToDelete)) {
    notes.splice(indexToDelete, 1);
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

// 404 HANDLER
app.use((req, res) => {
  res.status(404).send("Not found");
});

// GENERAL ERR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).send("Something broke");
});

// SERVER START
app.listen(port, () => {
  console.log("Running on port: " + port);
});
