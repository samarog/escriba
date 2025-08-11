# CHANGELOG

## 1.4.1 — 2025-08-11
- Fix: `/blogpost` validation (`title?.trim()`, `content?.trim()`)
- Fix: `/blog/delete` reads `req.body.id` (not `req.params.id`)

## 1.4.0 — 2025-08-08
- Mobile “hamburger” form layout (content → title → author → submit)
- Improved responsive CSS, fixed overflow issues
- Added rate limiter to `/sendmail`

## 1.3.6 — 2025-08-07
- Added **Blog** module (list, create, delete)
- Initial blog routes scaffold and UI

## 1.2.0 — 2025-08-03
- Added **Contact** feature via nodemailer
- Background rotation (Picsum ID approach)

## 1.0.0 — 2025-08-01
- Initial release: notes, contact form, dark theme, basic layout