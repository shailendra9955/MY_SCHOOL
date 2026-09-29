# Security integration for the existing Google Apps Script API

The ZIP already contains the front-end security layer, but **Cloudflare Turnstile must be verified by the Google Apps Script backend**. The browser cannot safely verify the Turnstile secret.

Cloudflare's current documentation states that server-side Siteverify validation is mandatory, tokens are single-use, and tokens expire after 5 minutes.  
Source: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## 1. Add the backend helper

Copy `backend/TurnstileSecurity.gs` into the same Apps Script project that currently powers your Google Sheet API.

Do not delete your existing `doGet`, `doPost`, CRUD functions, or sheet functions.

## 2. Add Script Properties

In Apps Script:

**Project Settings → Script Properties → Add script property**

Add:

| Property | Value |
|---|---|
| `TURNSTILE_SECRET_KEY` | Your Cloudflare Turnstile secret key |
| `TURNSTILE_ALLOWED_HOSTNAME` | Your production hostname, for example `school.example.com` |

Do not put the secret key in `js/Config.js`.

## 3. Protect the login action

Inside your existing `doPost(e)` logic, after parsing the JSON body and before checking the username/password, run:

```javascript
if (payload.action === "login") {
    const security = enforceLoginSecurity_(payload);

    if (!security.success) {
        return jsonResponse_(security);
    }
}
```

Use your existing JSON-response helper name if it is different.

## 4. Validate the real user role

Your login request now contains:

```text
requestedRole
```

This is only the user's selection on the login page.

After you find the user in the Users sheet and verify the password and active status, compare:

```javascript
assertRequestedRole_(
    user.role,
    payload.requestedRole
);
```

Do not trust `requestedRole` as the user's actual role.

## 5. Create a server-side session

After successful credential and role validation:

```javascript
clearLoginFailures_(security.rateLimit);

const session = createSession_(user);

return jsonResponse_({
    success: true,
    session: session
});
```

The important point is that the server creates the session/token. Do not create a fake authentication token in browser JavaScript.

## 6. Protect every management API action

At the beginning of every protected action, validate the session.

Administrator example:

```javascript
const session = requireSession_(
    payload.sessionToken,
    ["SUPER_ADMIN", "ADMIN"]
);
```

Teacher example:

```javascript
const session = requireSession_(
    payload.sessionToken,
    ["TEACHER"]
);
```

Accountant example:

```javascript
const session = requireSession_(
    payload.sessionToken,
    ["ACCOUNTANT"]
);
```

Student/parent example:

```javascript
const session = requireSession_(
    payload.sessionToken,
    ["STUDENT", "PARENT"]
);
```

### Important

Role checking must happen on the server.

A hidden button, HTML page restriction, JavaScript redirect, or `data-required-roles` attribute is not sufficient security.

## 7. Enforce record ownership

Role checking alone is not enough.

For example, a student should not be able to send another student's ID and receive that student's marks.

Your Apps Script must check ownership before returning private records.

Example concept:

```javascript
if (session.role === "STUDENT") {
    if (String(requestedStudentId) !== String(session.userId)) {
        throw new Error("Not authorized.");
    }
}
```

For parents, check that the requested student is actually linked to the authenticated parent.

## 8. Password security

If the Users sheet currently stores plaintext passwords, migrate away from plaintext storage.

Recommended direction:

- `password_hash`
- per-user `password_salt`
- server-side verification
- never return the password in an API response
- never log passwords
- never place passwords in URLs
- never place passwords in JavaScript source

If your existing API uses another password mechanism, keep it only if it is properly salted and hashed on the server.

## 9. Failed-login handling

The supplied helper limits repeated attempts by username.

For stronger protection, also consider:

- Cloudflare WAF/rate limiting
- monitoring suspicious login volume
- account lockout rules
- administrative audit logs
- alerting for repeated failures

Do not permanently lock accounts solely because a public attacker can repeatedly submit a username; prefer a temporary cooldown or additional verification.

## 10. Turnstile hostname

Create the Turnstile widget for the actual production hostname.

For example:

```text
school.example.com
www.school.example.com
```

Do not use a production secret key in a test/public repository.

## 11. Local development

Turnstile does not work correctly when the site is opened with:

```text
file://
```

Run the site through a local HTTP server.

Example:

```text
npx serve .
```

or another local static server.

## 12. Important Google Apps Script limitation

Google Apps Script is useful for a lightweight school system, but it is not the same as a dedicated authentication backend.

For a larger production deployment, consider moving authentication and sensitive authorization to a proper backend/database while keeping Google Sheets for reporting or administrative exports.

## 13. Front-end files added/changed in this ZIP

Security-related files:

- `js/Config.js`
- `js/api.js`
- `js/auth.js`
- `js/login.js`
- `backend/TurnstileSecurity.gs`
- `backend/SECURITY_INTEGRATION.md`

Protected areas:

- `/admin/*`
- `/portal/*`

The public website remains accessible without authentication.

## 14. Cloudflare references

Cloudflare Turnstile client-side setup:
https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/

Cloudflare server-side validation:
https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

Cloudflare login-form tutorial:
https://developers.cloudflare.com/turnstile/tutorials/login-pages/
