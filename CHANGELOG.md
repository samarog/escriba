# CHANGELOG

## 1.6.6 — 2025-08-18
### Added
- Health check endpoint: `GET /health` for uptime/CI checks.

### Changed
- All destructive actions are now **owner-scoped** at the SQL level:
  - Notes: `DELETE ... WHERE id = $1 AND user_id = $2`
  - Blog: `DELETE ... WHERE id = $1 AND user_id = $2`
- `POST /clear` now deletes **only the current user’s** notes.
- Blog deletion now targets the **database as the source of truth** (no in-memory delete path).
- Protected pages consistently redirect unauthenticated users to `/`.

### Migration notes
- Ensure the `blog` table exists as per the README SQL.
- If you previously relied on in-memory blog deletes, remove any array mutations and use DB writes only.
- Set `SESSION_SECRET` and Postgres env vars in your environment (production requires a persistent session store).

## 1.5.2 — 2025-08-14
- Implement database-backed notes for persistance (SQL).

## 1.4.1 — 2025-08-11
- Fix: `/blogpost` validation (`title?.trim()`, `content?.trim()`).
- Fix: `/blog/delete` reads `req.body.id` (not `req.params.id`).

## 1.4.0 — 2025-08-08
- Mobile “hamburger” form layout (content → title → author → submit).
- Improved responsive CSS, fixed overflow issues.
- Added rate limiter to `/sendmail`.

## 1.3.6 — 2025-08-07
- Added **Blog** module (list, create, delete).
- Initial blog routes scaffold and UI.

## 1.2.0 — 2025-08-03
- Added **Contact** feature via nodemailer.
- Background rotation (Picsum ID approach).

## 1.0.0 — 2025-08-01
- Initial release: notes, contact form, dark theme, basic layout.
