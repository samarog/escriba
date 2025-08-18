import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import axios from "axios";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import flash from "connect-flash";

dotenv.config({ path: ".env" });

// vars

const app = express();
const mailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const saltRounds = 10;
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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(passport.initialize());
app.use(passport.session());

// postgres

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

db.connect();

// root

app.get("/", (req, res) => {
  res.render("root.ejs");
});

// GET routes

app.get("/login", (req, res) => {
  const warning = "";
  res.render("login.ejs", { warning });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/register", (req, res) => {
  const warning = "";
  res.render("register.ejs", { warning });
});

app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});

app.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    const userinfo = await db.query("SELECT * FROM users WHERE email = $1", [
      req.user.email,
    ]);
    const { rows } = await db.query("SELECT * FROM notes WHERE user_id = $1", [
      req.user.id,
    ]);
    const notes = rows;
    const username = userinfo.rows[0].name;
    try {
      const quote = await axios.get("https://zenquotes.io/api/today");
      const fullQuote = {
        message: quote.data[0].q,
        author: quote.data[0].a,
      };
      res.render("dashboard.ejs", { notes, username, ...fullQuote });
    } catch (error) {
      res.render("dashboard.ejs", {
        notes: notes,
        message: "Failed to load quote.",
        author: "Sorry",
        content: JSON.stringify(error),
      });
    }
  }
});

app.get("/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    try {
      const { rows } = await db.query(
        "SELECT * FROM notes WHERE user_id = $1",
        [req.user.id]
      );
      const notes = rows;
      res.render("notes.ejs", { notes });
    } catch (error) {
      res.render("notes.ejs", {
        notes: notes,
        content: JSON.stringify(error),
      });
    }
  }
});

app.get("/contact", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    const showMessage = req.query.message === "sent"; // check if message=success
    res.render("contact.ejs", {
      messageSent: showMessage ? "Message sent." : "",
    });
  }
});

app.get("/blog", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  try {
    // do both DB calls in parallel with a Promisse.all // +efficiency, less retrieving time
    const [userResult, postsResult] = await Promise.all([
      db.query("SELECT name FROM users WHERE id = $1", [req.user.id]),
      db.query("SELECT * FROM blog WHERE user_id = $1 ORDER BY id DESC", [
        req.user.id,
      ]),
    ]);

    console.log(posts)
    const username = userResult.rows[0]?.name ?? req.user.email;
    const posts = postsResult.rows;

    return res.render("blog.ejs", { posts, username, error: null });
  } catch (err) {
    console.error(err);
    return res.render("blog.ejs", {
      posts: [],
      username: req.user?.email ?? "User",
      error: "Posts couldn't be fetched from the database.",
    });
  }
});

// POST routes

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkResult.rows.length > 0) {
      const warning = "Email already in use.";
      res.render("register.ejs", { warning: warning });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/profile");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login"); // guard route
  }

  const name = req.body.name;
  const email = req.user.email;

  if (!name?.trim()) {
    // only call trim() if name is NOT missing or empty/whitespace. if name is a string, call trim() // adding ! flips the logic, means 'if this name?.trim() is falsy. geez this is confusing.
    return res.status(400).send("Name is required");
  } else {
    try {
      await db.query("UPDATE users SET name = $1 WHERE email = $2", [
        name,
        email,
      ]);
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/post", async (req, res) => {
  const post = req.body.notepost?.trim();
  const userId = req.user.id;
  if (post) {
    const result = await db.query(
      "INSERT INTO notes (title, user_id) VALUES ($1, $2)",
      [post, userId]
    );
  }
  res.redirect("/dashboard");
});

app.post("/clear", async (req, res) => {
  const result = await db.query("DELETE FROM notes WHERE user_id = $1", [
    req.user.id,
  ]);
  res.redirect("/dashboard");
});

app.post("/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.id);
  if (!isNaN(idToDelete)) {
    const result = await db.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [idToDelete, req.user.id]
    );
  }
  res.redirect("/dashboard");
});

app.post("/notes/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.id);
  if (!isNaN(idToDelete)) {
    const result = await db.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [idToDelete, req.user.id]
    );
  }
  res.redirect("/notes");
});

app.post("/blogpost", async (req, res) => {
  const { title, content, author } = req.body;
  const userId = req.user.id;

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

  const newPostOnDB = await db.query(
    "INSERT INTO blog (title, content, author, user_id) VALUES ($1, $2, $3, $4)",
    [newPost.title, newPost.content, newPost.author, userId]
  );

  posts.unshift(newPost);
  res.redirect("/blog");
});

app.post("/blogpost/delete", async (req, res) => {
  // const findPostByIndex = posts.findIndex(
  //   (p) => p.id === parseInt(req.body.id)
  // );
  // if (findPostByIndex === -1)
  //   return res.status(404).json({ error: "Error. Couldn't delete." });
  // posts.splice(findPostByIndex, 1);

  const id = req.body.id;
  if (Number.isNaN(id)) {
    return res.status(400).send("Invalid id");
  } else {
    await db.query("DELETE FROM blog WHERE id = $1 AND user_id = $2", [
      id,
      req.user.id,
    ]);
  }
  res.redirect("/blog");
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

passport.use(
  "local",
  new Strategy({ usernameField: "email" }, async function verify(
    email,
    password,
    cb
  ) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length === 0) {
        // auth failure on email prob
        return cb(null, false, { message: "User not found" });
      }

      const user = result.rows[0];
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) {
          return cb(err);
        }
        if (!valid) {
          return cb(null, false, { message: "Invalid password" }); // pass failure
        }
        return cb(null, user); // great success!
      });
    } catch (err) {
      return cb(err);
    }
  })
);
// serialization cycle

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Jest

app.get("/health", (req, res) => res.status(200).json({ ok: true }));

// error handlers

app.use((req, res) => {
  res.status(404).send("Not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).send("Something broke");
});

export default app;
