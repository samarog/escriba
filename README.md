# Escriba

Escriba is a lightweight, Express-based web application for writing personal notes and publishing micro‑blog posts. It includes local authentication, persistent sessions, PostgreSQL backend, and rate‑limited contact form via Nodemailer, all styled in a minimalist dark-themed UI, fully responsive, that follows a classical dashboard layout.

## Disclaimer

Even though Escriba tries to emulate some of the current industry-standard security practices, it is a demo project created for study and recreational purposes only. Passwords are fully encrypted, but you should not expose or store personal or sensitive information in Escriba under any circumstances.

---

## Live Preview

*https://escriba.onrender.com/*

![CI](https://github.com/samarog/escriba/actions/workflows/ci.yml/badge.svg)

---

## Features

- **Local Authentication** (Passport Local + bcrypt) with sessions. OAuth is in the cards for the future.
- **PostgreSQL persistence** for notes and blog posts (no more in‑memory data).
- **Notes CRUD**: add, list, and delete notes **scoped to the logged‑in user**.
- **Microblog**: create and delete posts, **tied to the current user**.
- **Nodemailer**: Contact form with **rate limiting** (express‑rate‑limit)
- **Sleek Styling:** Dark filtered background, clear typography, responsive layout.
- **Dynamic BG** Dynamic background images via Lorem Picsum.
- **Secure defaults**: parameterized queries, session secret, and production session store guidance. Credentials handled through environment variables.

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/samarog/escriba.git
cd escriba
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Create a `.env` File**
```bash
touch .env
```
Add the following variables:
```
# App
SESSION_SECRET=replace_with_a_long_random_string

# Postgres
PGUSER=your_db_user
PGHOST=localhost
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=(usually 5432)

# If deploying on Render/Heroku, you may also need:
# PGSSLMODE=require

# Mail (Nodemailer)
MY_EMAIL=yourgmail@gmail.com
MY_AUTH=your_gmail_app_password

```
> ⚠️ You must use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if 2FA is enabled.

### 4. **Run the App**
```bash
node app.js
OR
node server.js
```

The app will be available at `http://localhost:3000`.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Auth:** Passport Local, bcrypt, express-session, connect-flash
- **DB:** PostgreSQL (`pg`)
- **Views:** EJS
- **Styling:** Vanilla CSS, Bootstrap and FontAwesome
- **Email:** Nodemailer (Gmail SMTP or provider of your choice)
- **Utilities:** axios, morgan, express-rate-limit
- **Tests:** Jest + Supertest

---

## Routes

### Pages (GET)

- `GET /` – Landing page
- `GET /login` – Login form
- `GET /logout` – End session (redirects to `/`)
- `GET /register` – Registration form
- `GET /profile` – Profile page
- `GET /dashboard` – **Requires auth**; shows notes + daily quote
- `GET /notes` – **Requires auth**; list notes
- `GET /contact` – **Requires auth**; contact form (supports `?message=sent`)
- `GET /blog` – **Requires auth**; blog list + new post form
- `GET /health` – JSON `{ ok: true }` for uptime checks

### Auth & Profile (POST)

- `POST /register` – Create user (email, password); logs in on success
- `POST /login` – Passport Local (email/password)
- `POST /profile` – Update display name (requires auth)

### Notes (POST)

- `POST /post` – Add note (`notepost`)
- `POST /delete` – Delete note by `id` **for current user**
- `POST /notes/delete` – Same as above (from `/notes` page)
- `POST /clear` – Delete **all notes for current user**

### Blog (POST)

- `POST /blogpost` – Create blog post (`title`, `content`, `author`*)
- `POST /blogpost/delete` – Delete blog post by `id` **for current user**

### Mail (POST)

- `POST /sendmail` – Send message to `MY_EMAIL` (**rate‑limited**)

---

## Security & Hardening

- **Session Secret:** required. Set `SESSION_SECRET` in `.env`.
- **Production Sessions:** use `connect-pg-simple` (Postgres) or Redis;
- **Password Hashing:** bcrypt with loads of `saltRounds`.
- **Sanitized Auth:** all mutations are scoped to `req.user.id` in SQL (e.g., `DELETE ... WHERE id = $1 AND user_id = $2`) to prevent SQL injetion.
- **Rate Limiting:** applied to `/sendmail`; consider adding to `/login`.
- **Validation:** sanitize/validate inputs for email/password/names/titles.

---

## Project Structure

```
.
├── views/
│   ├── root.ejs         # Landing page
│   ├── login.ejs        # Login form
│   ├── register.ejs     # Sign-up form
│   ├── profile.ejs      # Profile (Set your profile name)
│   ├── dashboard.ejs    # Notes + Daily quote
│   ├── notes.ejs        # Notes view
│   ├── contact.ejs      # Contact form
│   ├── blog.ejs         # Microblog list + form
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── public/
│   └── styles/
│       └── main.css
├── app.js               # Express app (exports app)
├── server.js            # app.listen
└── .env                 # Environment variables (not committed)
```

---

## UI Preview

![escriba](https://i.ibb.co/LzH18FWm/preview.png)

---

## Shout-out

To [@mariodmpereira](https://github.com/mariodmpereira) for testing and reviewing this project.

![Thanks!](https://img.shields.io/badge/Thanks-@mariodmpereira-blue.svg)

---

## License

MIT / Gonçalo Amaro
