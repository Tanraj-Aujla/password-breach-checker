# Password Breach Checker

A web app that checks password strength and detects if it has appeared in known data breaches, using the [Have I Been Pwned](https://haveibeenpwned.com/) API. Built with React and Vite.

## How It Works

### Strength check
The password is scored locally (in the browser) based on length, uppercase letters, numbers, and symbols. The score is bucketed into **Weak**, **Medium**, or **Strong**, shown with colored bars.

### Breach check
Your actual password is never sent anywhere. Instead:

1. The password is hashed locally in the browser using SHA-1 (via the Web Crypto API).
2. Only the **first 5 characters** of that hash are sent to the Have I Been Pwned API.
3. The API responds with every hash suffix in its breach database that shares that same 5-character prefix (usually hundreds of them).
4. The app checks locally whether the rest of your password's hash matches any of those suffixes, and reports how many times it's been seen in a breach (or that it's clean).

This is called **k-anonymity** — it lets you check a secret against a remote database without ever revealing the secret itself to the server.

## Running Locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in the terminal.

## Tech Stack

- React 19
- Vite
- Have I Been Pwned Pwned Passwords API
- Web Crypto API (for local SHA-1 hashing)
