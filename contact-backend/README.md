# DATA C0RE secure contact backend

The public website contains no destination email address and no Turnstile secret.

## Private values

Keep these only in Google Apps Script > Project Settings > Script Properties:

- `DESTINATION_EMAIL` — private inbox that receives contact messages
- `TURNSTILE_SECRET` — Cloudflare Turnstile secret key
- `ALLOWED_HOSTNAME` — `datac0re.is-a.dev`

Never commit those values to GitHub.

## Google Apps Script

1. Create a new standalone Apps Script project.
2. Replace `Code.gs` with the repository file `contact-backend/Code.gs`.
3. Add the three Script Properties above.
4. Deploy as **Web app**.
5. Execute as **Me**.
6. Access: **Anyone** / anonymous visitors, depending on the wording shown by the account UI.
7. Authorize the MailApp / external-request permissions.
8. Copy the production `/exec` deployment URL. Do not use the `/dev` testing URL.

## Cloudflare Turnstile

1. Create a Turnstile widget named `DATA C0RE / Contact`.
2. Authorized hostname: `datac0re.is-a.dev`.
3. Mode: Managed.
4. Copy the public **sitekey**.
5. Put the private **secret key** only in Apps Script Script Properties.

## Activate the website

Only the following two public values belong in `assets/js/contact-config.js`:

- Apps Script `/exec` endpoint URL
- Turnstile sitekey

Then set `enabled: true`.

The build automatically publishes Contact in EN / FR / ES, adds it to navigation and sitemap, and changes the contact routes from `noindex` to `index,follow`.

## Security model

- Cloudflare Turnstile is validated server-side through Siteverify.
- Validation checks both the expected `contact` action and `datac0re.is-a.dev` hostname.
- A honeypot is included.
- Required fields and field lengths are validated server-side.
- A short SHA-256-based per-sender cooldown is used without storing the plain email in cache.
- `MailApp` sends the message and sets the visitor address as Reply-To.
- Form contents and destination addresses are not intentionally logged.
