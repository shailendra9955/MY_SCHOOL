# Modern Convent School — Complete Multi-Page Website & Management System

This ZIP contains a multi-page school public website plus Student/Parent, Teacher and Administrator portals.

## Included
- Public multi-page website
- Responsive design
- Student/Parent portal
- Teacher portal
- Admin portal
- Google Sheets database schema
- Google Apps Script API
- Demo authentication
- Shared CSS/JS
- Setup documentation

## Reference-site structure
The public information architecture follows the same broad categories found on the supplied reference site: About School, Vision/Mission, Academic System, Messages, Student Zone, Campus, Gallery, School Information, Downloads and Contact. The implementation uses original code and placeholder graphics rather than copying the reference site's source code.

## Run locally
Because the pages use root-relative paths (`/css/...`, `/js/...`), serve this folder with a local static server rather than opening HTML files directly.

Example:
1. Install Node.js.
2. Run `npx serve .`
3. Open the local URL shown by the server.

## Google Sheets setup
1. Create a Google Sheet.
2. Create the tabs listed in `api/SHEETS_SCHEMA.md`.
3. Put the headers in row 1.
4. Add a demo user in Users:
   - ID: 1
   - UserID: admin
   - Password: change-this
   - Role: admin
   - Name: School Administrator
   - Active: TRUE
5. Open Extensions → Apps Script.
6. Copy `api/Code.gs` into the Apps Script project.
7. Set the spreadsheet to the script's bound spreadsheet.
8. Deploy → New deployment → Web app.
9. Copy the Web App URL.
10. Open `js/app.js` and replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`.
11. Redeploy the site.

## Demo logins
These are front-end demo credentials only and should NOT be used in production:
- admin / admin123
- teacher / teacher123
- student / student123

For production, remove the hard-coded demo login and use a proper authentication provider or a hardened backend.

## Important production security
Google Sheets is suitable for a lightweight internal database, but it is not a full enterprise database. Before production:
- Do not store plaintext passwords.
- Use hashed credentials or Google Identity/OAuth.
- Add server-side authorization for every operation.
- Validate all input.
- Add audit logs.
- Restrict Apps Script access.
- Avoid exposing sensitive student information publicly.
- Back up the spreadsheet.
- Configure custom domain and HTTPS.
