# Modern Convent School — Website + Management + Role Portals

This package contains the public school website, administrator management area and role-based portals backed by a Google Apps Script API / Google Sheet.

## Included

- Responsive public school website.
- Administrator management pages.
- Student / parent portal pages.
- Teacher portal.
- Principal portal.
- Accountant portal.
- Staff portal.
- Role-based login routing.
- Cloudflare Turnstile integration.
- Additional generated CAPTCHA.
- Session and route protection.
- Shared CSS and JavaScript.
- Google Apps Script API client.
- CRUD module controller for management pages.
- Hosting/security documentation.

## Important architecture

Google Sheets remains the data source through the existing Google Apps Script API.

The browser is **not** treated as a trusted security boundary.

Authentication and authorization must be enforced by Google Apps Script.

### Browser layer

The browser provides:

- login form;
- account-type selector;
- CAPTCHA;
- Cloudflare Turnstile widget;
- route guard;
- session timeout;
- role-based redirection;
- user-friendly errors.

### Server layer

Google Apps Script must enforce:

- password verification;
- active account status;
- Turnstile Siteverify;
- role matching;
- session/token validation;
- CRUD permissions;
- student/parent record ownership;
- audit logging.

## Main folders

```text
/
├── admin/
├── portal/
├── assets/
├── css/
├── js/
├── backend/
├── login.html
├── SECURITY_SETUP.md
├── FRONTEND_SETUP.md
├── README.md
└── _headers
```

## Configuration

Edit:

```text
js/Config.js
```

Set:

```text
GOOGLE_APPS_SCRIPT_URL
```

and replace:

```text
REPLACE_WITH_YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
```

with the public Cloudflare Turnstile site key.

Never put the Turnstile secret key in this file.

## Backend security

Read:

```text
backend/SECURITY_INTEGRATION.md
```

Then add:

```text
backend/TurnstileSecurity.gs
```

to the existing Google Apps Script project.

Do not replace your existing working API without backing it up.

## Local testing

Do not open the site directly using `file://`.

Use an HTTP server, for example:

```bash
npx serve .
```

Then open the URL provided by the server.

## Production

Use HTTPS.

Before publishing, complete every item in:

```text
SECURITY_SETUP.md
```

## No demo credentials

This package does not include a production login username/password.

Use accounts from your existing Users sheet.

Do not keep sample passwords such as `admin123` in production.

## Maintenance principle

- HTML = page structure.
- CSS = visual design.
- JavaScript = behavior.
- Config.js = central configuration.
- api.js = Google Apps Script communication.
- auth.js = browser session / route guard.
- login.js = login form, CAPTCHA and Turnstile.
- module.js = shared admin CRUD UI.
- portal.js = portal navigation.
- backend = Apps Script security integration guidance.
