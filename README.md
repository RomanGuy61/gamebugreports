# ROM Games Bug Report Site

A static bug report form designed for GitHub Pages. No backend, no database, no build step.

Reporters can provide:

- Full name — optional
- Steam username — optional
- Bug description — **required**
- Steps to reproduce — **required**
- System specs — optional, with a "How do I find these?" helper for Windows, macOS and Linux
- Log files — optional, drag & drop, up to 10 MB in total

Submissions are emailed to **romgamereports@gmail.com** through [FormSubmit](https://formsubmit.co/).

## Set up on GitHub Pages

1. Create a new public GitHub repository and upload these files, keeping the folder structure:

   ```
   index.html
   thanks.html
   favicon.svg
   css/styles.css
   js/script.js
   README.md
   ```

2. In the repository, go to **Settings → Pages → Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and `/ (root)`, then save.

3. Visit your site at `https://<username>.github.io/<repository>/`.

4. **Activate the form (required, one time only).** Submit one real test report from the live site. FormSubmit will email `romgamereports@gmail.com` with an **Activate Form** link. Click that link. Until it's confirmed, FormSubmit holds submissions instead of delivering them. Check the inbox (and spam folder) for that email.

5. Test again after activation and confirm the report arrives in the inbox with all fields and any attached files.

### Changing the destination email

Replace the email in **two places**:

- `index.html`: the form's `action="https://formsubmit.co/romgamereports@gmail.com"`
- `README.md` / any documentation references

The JavaScript derives the AJAX endpoint from the form's `action` automatically, so no JS edit is needed. Remember to re-activate the form for the new address.

## Spam and bot protection

The site uses several layers:

- **Honeypot fields** (`_honey` and `company_website`) hidden from humans; bots that fill them are silently rejected.
- **Time-to-submit check** — submissions faster than 1.5 seconds are rejected.
- **Custom human question** — a random arithmetic question generated in the browser.
- **FormSubmit's built-in filtering** — content heuristics, rate limiting and duplicate detection.
- **reCAPTCHA** — FormSubmit adds its own reCAPTCHA to forms by default. To turn it off, add `<input type="hidden" name="_captcha" value="false">` inside the form (not recommended).
- **Domain allowlist** — FormSubmit's account dashboard can restrict submissions to your GitHub Pages domain. This is optional and needs a FormSubmit account; see their docs on domain allowlisting.

If spam becomes a problem, submit a report through FormSubmit and use the confirmation/management email to tune the form's spam sensitivity and blocked keywords.

## Notes and limits

- Attached files are capped at **10 MB total** per submission by FormSubmit, which also applies client-side in `js/script.js`. You can change `MAX_TOTAL` there, but the service's limit still applies.
- Email delivery depends on FormSubmit's free service and on the address being activated. If it ever stops working, replace the form endpoint with another static-form provider or a small serverless function.
- The "Send bug report" button uses AJAX when possible so the page stays put; if the request fails entirely it falls back to a normal form POST that lands on `thanks.html`.
- No analytics, cookies or tracking scripts are included.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the form |
| `css/styles.css` | Theme, layout, responsive styles |
| `js/script.js` | Validation, captcha, file handling, spec helper, submission |
| `thanks.html` | Fallback thank-you page |
| `favicon.svg` | Site icon |
