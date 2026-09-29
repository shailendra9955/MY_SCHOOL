# QC Report — Modern Convent School

QC performed on the prepared package before ZIP creation.

## Automated checks

| Check | Result |
|---|---|
| HTML files discovered | 55 |
| JavaScript files discovered | 9 |
| CSS files discovered | 3 |
| Internal local links | PASS |
| Missing local script/style targets | PASS |
| Inline `style` attributes | PASS |
| Inline JavaScript blocks | PASS |
| `None` JavaScript literal from old generator | PASS |
| School data in localStorage | PASS |
| JavaScript syntax (`node --check`) | PASS |
| Apps Script security helper syntax | PASS |
| Protected admin pages have route guard | PASS |
| Protected portal pages have route guard | PASS |
| Login has Cloudflare integration | PASS |
| Login has generated CAPTCHA | PASS |
| Role selector and role routing | PASS |
| Logout handler | PASS |

## Manual tests still required

The following require your real Google Sheet and Apps Script deployment and cannot be honestly completed from a static ZIP alone:

1. Cloudflare Turnstile Siteverify.
2. Real username/password authentication.
3. User-role matching against the Users sheet.
4. Server-side session creation.
5. Server-side authorization for every API action.
6. Student/parent ownership checks.
7. Google Sheet CRUD operations.
8. Production-domain hostname validation.
9. Production CORS/network behavior.
10. Email/notification integrations if present in your backend.

## Important result

The frontend package is prepared, but the backend must implement the security functions in:

```text
backend/TurnstileSecurity.gs
```

A static HTML/JavaScript application cannot make the Cloudflare secret or Google Sheet authorization logic secure by itself.
