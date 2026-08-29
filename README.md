# infernicated

**Privacy-conscious Password Security Analyzer**

infernicated is a client-side password security analyzer designed to help users understand the characteristics and potential exposure of a password.

It evaluates password length, character composition, common patterns, approximate entropy, and known breach exposure. The application does not have a backend or database, and password analysis is performed locally in the browser.

The optional breach check uses the **Have I Been Pwned Pwned Passwords API** with its k-anonymity range lookup. The password is hashed locally, and only a five-character prefix of the SHA-1 hash is sent to the API. The returned hash suffixes are compared locally in the browser.

---

## Features

### Local Password Analysis

The application analyzes a password locally for:

* Password length
* Uppercase characters
* Lowercase characters
* Numbers
* Symbols
* Repeated characters
* Sequential patterns
* Keyboard-style patterns
* Common password matches

The local analysis does not require an internet connection.

### Approximate Entropy

infernicated provides an approximate entropy estimate based on password length and the estimated character pool.

This is intended as an educational indicator rather than a guarantee of password strength.

### Security Score

The analyzer converts several password characteristics into a score from **0–100** with classifications:

* Very Weak
* Weak
* Moderate
* Strong
* Very Strong

The score is a heuristic and should not be interpreted as a formal security assessment.

### Breach Exposure Check

The optional breach check uses the **Have I Been Pwned Pwned Passwords API**.

The process is:

```text
Password
   ↓
SHA-1 hash generated locally
   ↓
First 5 characters of hash extracted
   ↓
5-character prefix sent to HIBP
   ↓
Matching hash suffixes returned
   ↓
Comparison performed locally
   ↓
Breach result displayed
```

The complete password is never sent to the HIBP API.

The complete SHA-1 hash is also not sent.

### Password Generator

infernicated includes a configurable password generator supporting:

* Uppercase letters
* Lowercase letters
* Numbers
* Symbols
* Custom password length

The generator uses the browser's `crypto.getRandomValues()` API rather than `Math.random()` for security-sensitive random number generation.

Generated passwords are not intentionally stored by the application.

### Accessibility

The interface includes:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Responsive layouts
* Reduced-motion support

### Responsive Design

The application uses CSS Grid and responsive CSS to adapt the interface between desktop and mobile layouts.

---

# Privacy & Security

infernicated was designed around minimizing the amount of sensitive information leaving the browser.

### Password analysis

The main password analysis runs entirely client-side.

The application does not require a database or backend to calculate:

* Password composition
* Patterns
* Approximate entropy
* Security score

### Breach checking

For the optional breach check, the password is hashed locally using SHA-1.

Only the first five characters of that hash are sent to the Have I Been Pwned range API.

The API returns possible matching hash suffixes, which are then compared locally in the browser.

This means the application does not send the complete password or complete password hash to HIBP.

### SHA-1 clarification

SHA-1 is not considered a suitable modern algorithm for password storage or other applications requiring strong collision resistance.

It is used here specifically because the Have I Been Pwned Pwned Passwords API uses SHA-1 hashes for its k-anonymity range lookup.

infernicated does **not** use SHA-1 as a password-storage mechanism.

### Failure handling

If the breach-check request fails or the API is unavailable, the application reports that the breach check is unavailable rather than treating the password as safe.

---

# How It Works

The application consists entirely of client-side code.

```text
User enters password
        ↓
JavaScript receives input
        ↓
Local password analysis
        ↓
 ┌─────────────────────────────┐
 │ Length                      │
 │ Character composition       │
 │ Repeated patterns           │
 │ Sequential patterns         │
 │ Common passwords            │
 │ Approximate entropy         │
 │ Security score              │
 └─────────────────────────────┘
        ↓
Optional breach check
        ↓
SHA-1 hash generated locally
        ↓
First 5 hash characters sent to HIBP
        ↓
Hash suffixes returned
        ↓
Local comparison
        ↓
Final security report
```

The majority of the application works completely offline. An internet connection is only required for the optional breach exposure check.

---

# Tech Stack

* **HTML5** — page structure and semantic markup
* **CSS3** — responsive layout, CSS Grid, custom properties, animations, and styling
* **Vanilla JavaScript (ES2017+)** — application logic and DOM interaction
* **Web Crypto API** — cryptographic hashing and secure random number generation
* **Fetch API** — communication with the HIBP breach-check endpoint
* **Have I Been Pwned Pwned Passwords API** — breach exposure lookup
* **Inter** — interface typography
* **IBM Plex Mono** — monospace/technical typography

There is:

* No frontend framework
* No backend
* No database
* No build step
* No external JavaScript framework dependencies

---

# Project Structure

```text
infernicated/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   └── preview.png
│
└── README.md
```

### `index.html`

Contains the application's structure and semantic markup.

### `style.css`

Contains the visual design, responsive layouts, typography, animations, and accessibility-related styling.

### `script.js`

Contains the application logic, including:

* Password analysis
* Pattern detection
* Entropy calculation
* Security scoring
* SHA-1 hashing
* HIBP API communication
* Breach result processing
* Password generation
* DOM updates
* Event handling

---

# Getting Started

No build tools are required.

### 1. Clone the repository

```bash
git clone <repository-url>
cd infernicated
```

### 2. Run locally

You can open `index.html` directly in a browser.

Alternatively, use a local development server:

```bash
npx serve .
```

or:

```bash
python3 -m http.server 8080
```

### 3. Open the application

Open the local URL provided by your development server.

The local password analysis works without an internet connection.

The breach exposure feature requires internet access to communicate with the Have I Been Pwned API.

---

# Limitations

infernicated is an educational project and its results have limitations.

* The entropy calculation is an approximation.
* The security score is heuristic rather than a formal security measurement.
* Pattern detection cannot identify every possible password-guessing strategy.
* A password not found in the HIBP database does not guarantee that it has never been compromised.
* SHA-1 is used because it is the hash format required by the HIBP Pwned Passwords API, not as a recommendation for password storage.
* The application is not intended to replace professional security auditing or password-management software.

---

# Roadmap

* [ ] Add automated tests for scoring and pattern detection
* [ ] Expand the common-password dataset
* [ ] Improve password-pattern analysis
* [ ] Explore more advanced password-strength estimation techniques
* [ ] Add a downloadable analysis report
* [ ] Add a theme toggle while maintaining the existing visual design

---

# Security Disclaimer

infernicated provides an **educational estimate** of password strength and known breach exposure.

A strong score or a negative breach result does not guarantee that a password is secure.

The application should not be treated as a professional cybersecurity audit, authentication system, or legal/security advice.

---

# Credits

### Main Author

**Namish Yadav** — Main Author / Lead Developer

GitHub: [@p3xz](https://github.com/p3xz)

Instagram: [@nam7sh](https://instagram.com/nam7sh)

### Contributors

| Contributor   | Role                         | GitHub                                                 |
| ------------- | ---------------------------- | ------------------------------------------------------ |
| Namish Yadav  | Main Author / Lead Developer | [@p3xz](https://github.com/p3xz)       |
| Harshiv Patel | Co-author / Contributor      | [@Harshiv-6967](https://github.com/Harshiv-6967)       |
| Lubna Nawaz   | Co-author / Contributor      | [@Lubnanawaz](https://github.com/Lubnanawaz)           |
| Rushda Khan   | Co-author / Contributor      | [@rushdakhan-byte](https://github.com/rushdakhan-byte) |

---

## License

Add your preferred open-source license here if you intend to distribute the project under one.
