# Daily Referendum

An independent South African civic participation and government accountability platform.

**Your voice. Your vote. Your government.**

The public website is currently an early-stage landing page. Voting, issue submissions, petitions and government-response tracking are planned platform capabilities and are not yet live.

## Brand colours

Inspired by the South African flag:

- Red: `#DE3831`
- Blue: `#002395`
- Green: `#007A4D`
- Yellow: `#FFB81C`
- Black: `#000000`
- White: `#FFFFFF`

## Website

The site is a static HTML page in `index.html`.

## Daily question editorial workflow

- Private suggestions are created in the editorial desk at `/admin/`.
- Editors can save drafts, send questions for review, add sources and private notes, approve and schedule, or archive.
- The public endpoint `/api/vote-of-day` returns only approved questions whose scheduled publication date has arrived in South African time.
- Unapproved suggestions and private editorial notes are never returned by the public endpoint.
- Editorial status changes are recorded in `editorial_audit`.

## Cloudflare Pages setup

1. Create a Cloudflare D1 database for this Pages project.
2. Bind it to the Pages project using the binding name `DR_DB`.
3. Apply `schema.sql` to that database using the D1 console or Wrangler.
4. Add a Cloudflare Pages secret named `ADMIN_TOKEN` with a long, unique random value.
5. Deploy the repository as a Cloudflare Pages project. Pages Functions are in `functions/`.
6. Open `/admin/` and sign in with the token.

The public site can run without the D1 binding, but the editorial desk and persistence require D1 and the secret. Do not put the admin token in source control or in public client code.

The South Africa flag-map artwork used in the hero is attributed in the page footer to Clapsus under CC BY-SA 3.0.
