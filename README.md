# Escriba

Escriba is a lightweight, Express-based web application for writing, saving, and deleting short notes. It also includes a built-in contact form that sends email messages using Nodemailer. Styled with a dark UI theme and responsive layout, Escriba is a sleek tool for personal note-taking and communication.

---

## Live Preview

*https://escriba.onrender.com/*

---

## Features

- **Note Logging:** Add, view, and delete personal notes.
- **Clear All:** Wipe all saved notes with one action.
- **Contact Form:** Submit a message and email address to the site owner.
- **Email Delivery:** Messages sent through Gmail via Nodemailer.
- **Custom Styling:** Stylish dark background, clear typography, responsive layout.
- **Secure Config:** Email credentials handled through environment variables.

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/escriba.git
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
MY_EMAIL=yourgmail@gmail.com
MY_AUTH=your_gmail_app_password
```

> ⚠️ You must use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if 2FA is enabled.

### 4. **Run the App**
```bash
node index.js
OR
nodemon index-js
```

The app will be available at `http://localhost:3000`.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** EJS templates, Bootstrap, FontAwesome
- **Email:** Nodemailer (via Gmail SMTP)
- **Styling:** Custom CSS (`main.css`)
- **Data Handling:** In-memory storage (notes stored in array)

---

## Project Structure

```
.
├── views/
│   ├── index.ejs         # Main page with notes
│   ├── notes.ejs         # Alternate view for notes
│   ├── contact.ejs       # Contact form
│   └── partials/
│       ├── header.ejs    # Header/nav with links
│       └── footer.ejs    # Footer + scripts
├── public/
│   └── styles/
│       └── main.css      # Custom stylesheet
├── index.js              # Express app entry point
└── .env                  # Environment variables (not committed)
```

---

## Usage

- Add a note from the homepage and submit it.
- Click a note to delete it individually.
- Use "Clear" to remove all notes.
- Visit the **Contact** page to send me an email.

---

## Security

- Email and credentials are never hardcoded.
- Uses `dotenv` to securely load environment variables.

---

## UI Preview

*!/(https://i.ibb.co/LzH18FWm/preview.png)*

---

## License

© Gonçalo Amaro
