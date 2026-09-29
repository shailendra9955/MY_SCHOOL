# Modern Convent School — Security & Hosting Setup

This package keeps the existing visual design and Google Sheets API approach while adding a stronger authentication flow.

## Security layers

1. Cloudflare Turnstile on login.
2. Server-side Turnstile validation in Apps Script.
3. Additional generated CAPTCHA.
4. Account-type selection.
5. Server-side role matching.
6. Short-lived server-side session token.
7. Protected admin routes.
8. Protected portal routes.
9. Role-based API authorization.
10. Login attempt throttling.
11. No school records in localStorage.
12. No passwords in frontend source.
13. Safer API error handling.
14. Same-origin return-path protection.
15. Session inactivity timeout in the browser.

## What the browser cannot secure

The following must be enforced by Google Apps Script:

- Password verification.
- Active/inactive account checks.
- Cloudflare Turnstile Siteverify.
- Role matching.
- Permission checks.
- Student/parent record ownership.
- CRUD authorization.
- Audit logging.
- Password hashing.

The HTML/JavaScript route guard is only a second layer. A user can always inspect or modify browser JavaScript.

## Cloudflare

Create a Turnstile widget for your production hostname.

Put only the public site key in:

```text
js/Config.js
```

Put the private secret in:

```text
Apps Script → Project Settings → Script Properties
```

Use:

```text
TURNSTILE_SECRET_KEY
TURNSTILE_ALLOWED_HOSTNAME
```

Never commit the secret key to GitHub.

## Google Apps Script

Use:

```text
backend/TurnstileSecurity.gs
backend/SECURITY_INTEGRATION.md
```

as the integration guide.

Your existing API can remain the source of truth for the Google Sheet.

## Role routing

The login page sends the requested account type.

The server must return the real role.

The browser then routes:

```text
SUPER_ADMIN / ADMIN → admin/dashboard.html
PRINCIPAL             → portal/principal.html
TEACHER               → portal/teacher.html
ACCOUNTANT            → portal/accountant.html
STAFF                 → portal/staff.html
STUDENT               → portal/student.html
PARENT                → portal/parent.html
```

## Before production

- Replace the Turnstile site key placeholder.
- Configure the Turnstile secret in Apps Script.
- Verify your production hostname.
- Confirm your Apps Script API validates `sessionToken`.
- Confirm every protected API action checks the session.
- Confirm every role is checked server-side.
- Confirm students can only see their own records.
- Confirm parents can only see linked students.
- Remove any old plaintext passwords.
- Revoke old/demo credentials.
- Test the API from the production domain.
- Test login failure and rate limiting.
- Test session expiry.
- Test logout.
- Test direct navigation to admin pages while logged out.
- Test direct navigation to another role's page.
- Test API calls with a missing/invalid session token.
- Back up the Google Sheet.
- Keep the Apps Script project restricted to trusted administrators.

## Hosting

The site is static and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or another HTTPS static host.

Use HTTPS in production.

`_headers` is included for hosts that support Cloudflare-style header configuration. GitHub Pages does not apply `_headers`; configure equivalent security headers at your hosting/CDN layer when available.

## QC

Before publishing:

```text
1. Run the site through an HTTP server.
2. Open login.html.
3. Confirm CAPTCHA changes with the refresh button.
4. Confirm Turnstile loads.
5. Confirm an invalid CAPTCHA blocks login.
6. Confirm incomplete Turnstile blocks login.
7. Confirm wrong credentials are rejected.
8. Confirm wrong account type is rejected.
9. Confirm successful login opens the correct role portal.
10. Open an admin URL in a private/incognito window.
11. Confirm unauthenticated users are redirected to login.
12. Log out and confirm the session is removed.
13. Check browser console for errors.
14. Test all admin CRUD pages against the real Sheet API.
15. Test mobile navigation.
16. Test desktop navigation.
17. Test all internal links.
18. Confirm no school records are stored in localStorage.
```
