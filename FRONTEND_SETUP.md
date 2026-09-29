# Frontend Setup — Modern Convent School

## 1. Google Apps Script API

Edit:

```text
js/Config.js
```

Set the existing working Google Apps Script Web App URL in:

```javascript
API_CONFIG.GOOGLE_APPS_SCRIPT_URL
```

## 2. Cloudflare Turnstile

Create a Turnstile widget for your production hostname.

Place only the public site key in:

```javascript
TURNSTILE_CONFIG.siteKey
```

in `js/Config.js`.

Keep the Turnstile secret key in Apps Script Script Properties.

## 3. Existing Google Sheet

Keep your existing sheet names and headers.

The frontend sends the same API action names already used by this project.

Do not rename sheet columns unless the backend is updated at the same time.

## 4. Login request

The login page sends:

```text
action
username
password
requestedRole
turnstileToken
```

The backend must:

1. verify Turnstile;
2. check rate limits;
3. find the user;
4. verify the password;
5. check active status;
6. compare the actual role with `requestedRole`;
7. create a short-lived server session;
8. return the session/token.

## 5. Protected requests

After login, `api.js` automatically includes:

```text
sessionToken
```

when the session contains one.

The Apps Script backend must validate it before every protected operation.

## 6. No local school database

The project does not use localStorage for student, parent, fee, attendance or other school records.

## 7. Local server

Use an HTTP server instead of opening HTML files directly:

```bash
npx serve .
```

Cloudflare Turnstile requires HTTP/HTTPS rather than a `file://` page.

## 8. Production checks

Before deployment:

- Configure Turnstile.
- Configure Apps Script Script Properties.
- Test login.
- Test each role.
- Test direct access to protected pages.
- Test invalid sessions.
- Test logout.
- Test every CRUD page.
- Test mobile navigation.
- Check the browser console.
