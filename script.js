/* ==========================================================
   INFERNIFIED — script.js
   All password handling happens locally in the browser.
   The full password is never transmitted, stored, or logged.
   ========================================================== */

(function () {
  'use strict';

  /* ---------------- Elements ---------------- */

  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  const form = document.getElementById('analyzerForm');
  const passwordInput = document.getElementById('passwordInput');
  const toggleVisibilityBtn = document.getElementById('toggleVisibility');
  const clearBtn = document.getElementById('clearBtn');

  const scorePanel = document.getElementById('scorePanel');
  const scoreValueEl = document.getElementById('scoreValue');
  const scoreClassificationEl = document.getElementById('scoreClassification');
  const scoreFillEl = document.getElementById('scoreFill');

  const reportSection = document.getElementById('report');
  const reportSummary = document.getElementById('reportSummary');
  const compositionList = document.getElementById('compositionList');
  const patternText = document.getElementById('patternText');
  const entropyText = document.getElementById('entropyText');
  const exposureStatus = document.getElementById('exposureStatus');
  const exposureNote = document.getElementById('exposureNote');
  const recommendationText = document.getElementById('recommendationText');

  const genLength = document.getElementById('genLength');
  const genLengthValue = document.getElementById('genLengthValue');
  const genUpper = document.getElementById('genUpper');
  const genLower = document.getElementById('genLower');
  const genNumbers = document.getElementById('genNumbers');
  const genSymbols = document.getElementById('genSymbols');
  const generateBtn = document.getElementById('generateBtn');
  const generatedPassword = document.getElementById('generatedPassword');
  const copyBtn = document.getElementById('copyBtn');
  const copyFeedback = document.getElementById('copyFeedback');

  /* ---------------- Mobile nav ---------------- */

  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Show / hide password ---------------- */

  toggleVisibilityBtn.addEventListener('click', () => {
    const currentlyShowing = passwordInput.type === 'text';
    const willShow = !currentlyShowing;

    passwordInput.type = willShow ? 'text' : 'password';
    toggleVisibilityBtn.setAttribute('aria-pressed', String(willShow));
    toggleVisibilityBtn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    toggleVisibilityBtn.querySelector('.icon-eye').hidden = willShow;
    toggleVisibilityBtn.querySelector('.icon-eye-off').hidden = !willShow;
  });

  /* ==========================================================
     PASSWORD ANALYSIS (fully local — no network calls here)
     ========================================================== */

  const SEQUENTIAL_RUNS = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];

  const COMMON_PASSWORDS = new Set([
    'password', 'password1', '123456', '123456789', 'qwerty', 'letmein',
    'admin', 'welcome', 'monkey', 'dragon', 'football', 'iloveyou',
    'trustno1', 'abc123', '111111', '123123', 'sunshine', 'princess',
    'login', 'starwars', 'passw0rd', 'master', 'hello', 'freedom',
    'whatever', 'qazwsx', 'shadow', 'baseball', 'access', 'flower',
  ]);

  function analyzeComposition(pw) {
    return {
      length: pw.length,
      hasUpper: /[A-Z]/.test(pw),
      hasLower: /[a-z]/.test(pw),
      hasNumber: /[0-9]/.test(pw),
      hasSymbol: /[^A-Za-z0-9]/.test(pw),
    };
  }

  function longestRepeatedRun(pw) {
    let longest = 1;
    let current = 1;
    for (let i = 1; i < pw.length; i++) {
      if (pw[i] === pw[i - 1]) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    return pw.length ? longest : 0;
  }

  function hasSequentialRun(pw, minRun = 4) {
    const lower = pw.toLowerCase();
    for (const line of SEQUENTIAL_RUNS) {
      const forward = line;
      const backward = line.split('').reverse().join('');
      for (let i = 0; i <= lower.length - minRun; i++) {
        const chunk = lower.slice(i, i + minRun);
        if (forward.includes(chunk) || backward.includes(chunk)) {
          return true;
        }
      }
    }
    return false;
  }

  function isCommonPassword(pw) {
    return COMMON_PASSWORDS.has(pw.toLowerCase());
  }

  function estimateEntropyBits(pw, comp) {
    if (!pw.length) return 0;
    let poolSize = 0;
    if (comp.hasLower) poolSize += 26;
    if (comp.hasUpper) poolSize += 26;
    if (comp.hasNumber) poolSize += 10;
    if (comp.hasSymbol) poolSize += 32;
    if (poolSize === 0) poolSize = 1;
    return pw.length * Math.log2(poolSize);
  }

  function computeScore(pw) {
    const comp = analyzeComposition(pw);

    if (!pw.length) {
      return {
        score: 0,
        classification: 'Very Weak',
        comp,
        repeatedRun: 0,
        sequential: false,
        common: false,
        entropyBits: 0,
      };
    }

    const repeatedRun = longestRepeatedRun(pw);
    const sequential = hasSequentialRun(pw);
    const common = isCommonPassword(pw);
    const entropyBits = estimateEntropyBits(pw, comp);

    let score = 0;

    // Length contributes the most — up to 40 points.
    score += Math.min(40, pw.length * 2.5);

    // Character variety — up to 30 points.
    const varietyCount = [comp.hasUpper, comp.hasLower, comp.hasNumber, comp.hasSymbol]
      .filter(Boolean).length;
    score += varietyCount * 7.5;

    // Entropy bonus — up to 20 points, scaled against a 80-bit target.
    score += Math.min(20, (entropyBits / 80) * 20);

    // Penalties.
    if (repeatedRun >= 4) score -= 15;
    else if (repeatedRun === 3) score -= 6;

    if (sequential) score -= 15;
    if (common) score -= 40;
    if (pw.length < 8) score -= 15;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let classification;
    if (score < 20) classification = 'Very Weak';
    else if (score < 40) classification = 'Weak';
    else if (score < 60) classification = 'Moderate';
    else if (score < 80) classification = 'Strong';
    else classification = 'Very Strong';

    return { score, classification, comp, repeatedRun, sequential, common, entropyBits };
  }

  function stateSlugFor(classification) {
    return classification.toLowerCase().replace(/\s+/g, '-');
  }

  /* ---------------- SHA-1 (local, for HIBP k-anonymity only) ---------------- */

  async function sha1Hex(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  /**
   * Checks a password against the HIBP Pwned Passwords range API using
   * k-anonymity. Only the first 5 characters of the SHA-1 hash are ever
   * sent over the network — the full password and full hash never leave
   * the browser.
   */
  async function checkHIBP(pw) {
    if (!pw) return { status: 'not-found', count: 0 };

    try {
      const fullHash = await sha1Hex(pw);
      const prefix = fullHash.slice(0, 5);
      const suffix = fullHash.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        method: 'GET',
        headers: { 'Add-Padding': 'true' },
      });

      if (!response.ok) {
        return { status: 'unavailable', count: 0 };
      }

      const body = await response.text();
      const lines = body.split('\n');

      for (const line of lines) {
        const [suffixCandidate, countStr] = line.trim().split(':');
        if (suffixCandidate === suffix) {
          return { status: 'found', count: parseInt(countStr, 10) || 0 };
        }
      }

      return { status: 'not-found', count: 0 };
    } catch (err) {
      return { status: 'unavailable', count: 0 };
    }
  }

  /* ---------------- Render report ---------------- */

  function renderComposition(comp) {
    const rows = [
      ['Length', String(comp.length), comp.length >= 12],
      ['Uppercase', comp.hasUpper ? '✓' : '—', comp.hasUpper],
      ['Lowercase', comp.hasLower ? '✓' : '—', comp.hasLower],
      ['Numbers', comp.hasNumber ? '✓' : '—', comp.hasNumber],
      ['Symbols', comp.hasSymbol ? '✓' : '—', comp.hasSymbol],
    ];

    compositionList.innerHTML = '';
    rows.forEach(([label, value, present]) => {
      const div = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dd.dataset.present = String(present);
      div.appendChild(dt);
      div.appendChild(dd);
      compositionList.appendChild(div);
    });
  }

  function renderPatterns(result) {
    const notes = [];
    if (result.common) notes.push('This password matches a commonly used or leaked password.');
    if (result.sequential) notes.push('A sequential or keyboard-adjacent pattern was detected.');
    if (result.repeatedRun >= 3) notes.push(`A repeated run of ${result.repeatedRun} identical characters was found.`);
    if (!notes.length) notes.push('No obvious sequential or repeated pattern detected.');
    patternText.textContent = notes.join(' ');
  }

  function renderEntropy(result) {
    entropyText.textContent =
      `Approximate entropy: ${Math.round(result.entropyBits)} bits, based on password length and character pool size.`;
  }

  function renderScore(result) {
    scoreValueEl.textContent = String(result.score);
    scoreClassificationEl.textContent = result.classification;
    scoreFillEl.style.width = `${result.score}%`;
    scorePanel.dataset.state = stateSlugFor(result.classification);

    reportSummary.textContent =
      `${result.score}/100 — ${result.classification}. ${scoreDescriptionFor(result)}`;
  }

  function scoreDescriptionFor(result) {
    if (result.common) return 'This is a widely known or commonly used password.';
    if (result.score < 20) return 'This password is highly predictable and easy to guess.';
    if (result.score < 40) return 'This password is short or lacks character variety.';
    if (result.score < 60) return 'This password has moderate length and variety.';
    if (result.score < 80) return 'Good length and character variety.';
    return 'Strong length, variety, and unpredictability.';
  }

  function renderRecommendation(result) {
    const tips = [];
    if (result.comp.length < 12) tips.push('use at least 12 characters');
    if (!result.comp.hasSymbol) tips.push('add symbols');
    if (!result.comp.hasUpper || !result.comp.hasLower) tips.push('mix uppercase and lowercase');
    if (result.sequential) tips.push('avoid sequential or keyboard patterns');
    if (result.common) tips.push('avoid common or previously leaked passwords');

    if (!tips.length) {
      recommendationText.textContent = 'Use a unique password for this account and avoid reusing it elsewhere.';
    } else {
      recommendationText.textContent = `Consider: ${tips.join(', ')}. Use a unique password and avoid reusing credentials.`;
    }
  }

  function setExposurePending() {
    exposureStatus.textContent = 'Checking known breach data…';
    exposureStatus.dataset.status = '';
    exposureNote.textContent = '';
  }

  function renderExposure(hibpResult) {
    if (hibpResult.status === 'found') {
      exposureStatus.textContent = 'Found in known breach data';
      exposureStatus.dataset.status = 'found';
      exposureNote.textContent = 'This password has appeared in known breach data. Do not reuse this password.';
    } else if (hibpResult.status === 'not-found') {
      exposureStatus.textContent = 'Not found in known breach data';
      exposureStatus.dataset.status = 'not-found';
      exposureNote.textContent = 'This check does not guarantee that the password is secure.';
    } else {
      exposureStatus.textContent = 'Breach check unavailable';
      exposureStatus.dataset.status = 'unavailable';
      exposureNote.textContent = 'Could not reach the breach database right now. Try again later.';
    }
  }

  /* ---------------- Analyze flow ---------------- */

  async function runAnalysis(pw) {
    const result = computeScore(pw);

    renderScore(result);

    if (!pw) {
      reportSection.hidden = true;
      return;
    }

    reportSection.hidden = false;
    renderComposition(result.comp);
    renderPatterns(result);
    renderEntropy(result);
    renderRecommendation(result);

    setExposurePending();
    const hibpResult = await checkHIBP(pw);
    renderExposure(hibpResult);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runAnalysis(passwordInput.value);
  });

  clearBtn.addEventListener('click', () => {
    passwordInput.value = '';
    passwordInput.focus();
    reportSection.hidden = true;
    scoreValueEl.textContent = '—';
    scoreClassificationEl.textContent = 'Awaiting input';
    scoreFillEl.style.width = '0%';
    delete scorePanel.dataset.state;
  });

  /* ==========================================================
     PASSWORD GENERATOR (local — uses crypto.getRandomValues)
     ========================================================== */

  const CHAR_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
  };

  function generatePassword(length, useUpper, useLower, useNumbers, useSymbols) {
    let pool = '';
    if (useUpper) pool += CHAR_SETS.upper;
    if (useLower) pool += CHAR_SETS.lower;
    if (useNumbers) pool += CHAR_SETS.numbers;
    if (useSymbols) pool += CHAR_SETS.symbols;

    if (!pool) return '';

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += pool[randomValues[i] % pool.length];
    }
    return result;
  }

  genLength.addEventListener('input', () => {
    genLengthValue.textContent = genLength.value;
  });

  generateBtn.addEventListener('click', () => {
    const length = parseInt(genLength.value, 10);
    const pw = generatePassword(
      length,
      genUpper.checked,
      genLower.checked,
      genNumbers.checked,
      genSymbols.checked
    );

    if (!pw) {
      generatedPassword.value = '';
      copyFeedback.textContent = 'Select at least one character set.';
      return;
    }

    generatedPassword.value = pw;
    copyFeedback.textContent = '';
  });

  copyBtn.addEventListener('click', async () => {
    if (!generatedPassword.value) return;
    try {
      await navigator.clipboard.writeText(generatedPassword.value);
      copyFeedback.textContent = 'Copied to clipboard.';
    } catch (err) {
      copyFeedback.textContent = 'Could not copy automatically — select and copy manually.';
    }
    setTimeout(() => { copyFeedback.textContent = ''; }, 3000);
  });

}());
