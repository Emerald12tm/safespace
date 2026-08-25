// ==========================================================
// SafeSpace — main script
// Runs on every page. Each section below guards itself with
// `if (elementExists)` checks, so it's safe for one file to handle
// logic for all pages — a block just does nothing on pages that
// don't have the elements it's looking for.
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
  // ==========================================================
  // 1. Custom Cursor Movement
  // ==========================================================
  // The site hides the real OS cursor (see `cursor: none` in style.css)
  // and draws this div instead, moved to match the mouse on every move.
  const cursor = document.querySelector('.custom-cursor');
  if (cursor) {
    window.addEventListener('mousemove', function(e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  }
  // Note: on touch devices there's no mousemove, so style.css hides this
  // element entirely under a `(hover: none)` media query — otherwise it
  // would sit frozen in the top-left corner forever.

  // ==========================================================
  // 1b. Footer Copyright Year
  // ==========================================================
  // Keeps the footer's "© 2026 SAFESPACE" year correct automatically,
  // instead of it going stale every January.
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // ==========================================================
  // 1c. Mobile Nav Menu
  // ==========================================================
  // Below 700px (see style.css) the nav links are hidden by default and
  // this hamburger button toggles them open as a dropdown.
  const navToggleBtn = document.getElementById('navToggleBtn');
  const navLinks = document.querySelector('.nav-links');

  if (navToggleBtn && navLinks) {
    // Open/close on hamburger click.
    navToggleBtn.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('open');
      navToggleBtn.classList.toggle('open', isOpen);
      navToggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu once a link is actually clicked (otherwise it stays
    // open while the browser navigates to the new page).
    navLinks.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
        navToggleBtn.classList.remove('open');
        navToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close the menu if you tap/click anywhere outside of it.
    document.addEventListener('click', function(event) {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(event.target) || navToggleBtn.contains(event.target)) return;
      navLinks.classList.remove('open');
      navToggleBtn.classList.remove('open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // ==========================================================
  // 1e. Shared Status Message Helper
  // ==========================================================
  // Every form on the site (check-in journal, login/signup, password
  // reset) shows a one-line status message under its submit button.
  // This one helper drives all of them so the "success" / "error"
  // colors stay theme-aware (see .status-success / .status-error in
  // style.css) instead of being hardcoded hex values baked into JS.
  function setStatus(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('status-success', 'status-error');
    if (kind === 'success') el.classList.add('status-success');
    else if (kind === 'error') el.classList.add('status-error');
  }

  // ==========================================================
  // 1d. Spotify Embed Skeleton
  // ==========================================================
  // Shows a pulsing placeholder over the Spotify iframe until it
  // actually finishes loading, so the Activities page doesn't just
  // show an empty gap while the embed fetches over the network.
  const spotifyFrame = document.getElementById('spotifyFrame');
  const spotifySkeleton = document.getElementById('spotifySkeleton');

  if (spotifyFrame && spotifySkeleton) {
    spotifyFrame.addEventListener('load', function() {
      spotifySkeleton.remove();
    });
    // Safety net in case the load event doesn't fire (e.g. blocked embed) -
    // don't leave the skeleton pulsing forever.
    setTimeout(function() {
      if (spotifySkeleton.isConnected) spotifySkeleton.remove();
    }, 6000);
  }

  // ==========================================================
  // 2. Theme Persistence & Switching
  // ==========================================================
  // Dark mode is the default (see :root in style.css). Adding the
  // `light-theme` class to <body> swaps every CSS variable to the
  // light palette. The choice is remembered in localStorage so it
  // carries over between visits.
  //
  // Note: a tiny *inline* script at the very top of <body> (see the
  // HTML files) already applies this class before the page paints, so
  // there's no flash of dark mode while this deferred script loads.
  // The code below just keeps that in sync and updates the toggle
  // button's label.
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('safespace_theme');

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = 'Dark Mode';
  } else if (themeToggleBtn) {
    themeToggleBtn.textContent = 'Light Mode';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('safespace_theme', isLight ? 'light' : 'dark');
      themeToggleBtn.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    });
  }

  // ==========================================================
  // 3. Landing Page CTA Navigation
  // ==========================================================
  // The "Begin Check-In" button on index.html.
  const checkInBtn = document.getElementById('checkInBtn');
  if (checkInBtn) {
    checkInBtn.addEventListener('click', function() {
      window.location.href = 'check-in.html';
    });
  }

  // ==========================================================
  // 4. Check-In Selection & Redirection to Activities Page
  // ==========================================================
  // check-in.html: pick one mood card, then "Continue" saves it to
  // localStorage and sends you to activities.html, which reads it
  // back (see section 5) to tailor the page. "Skip" just clears
  // whatever was saved and moves on with no mood selected.
  const emotionCards = document.querySelectorAll('.emotion-card');
  const submitBtn = document.getElementById('submitCheckInBtn');
  const skipBtn = document.getElementById('skipCheckInBtn');
  let selectedEmotion = null;

  if (emotionCards.length > 0) {
    emotionCards.forEach(card => {
      card.addEventListener('click', function() {
        emotionCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedEmotion = this.getAttribute('data-emotion');

        // "Continue" starts out disabled until a mood is actually picked.
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      if (selectedEmotion) {
        localStorage.setItem('safespace_selected_mood', selectedEmotion);
      }
      window.location.href = 'activities.html';
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', function() {
      localStorage.removeItem('safespace_selected_mood');
      window.location.href = 'activities.html';
    });
  }

  // ==========================================================
  // 5. Activities Page Dynamic Tailoring
  // ==========================================================
  // Reads whatever mood was saved during check-in (if any) and swaps
  // the activities.html heading/subtext, plus highlights one
  // recommended card by adding the `.recommended` class (see the
  // glowing border style in style.css).
  const moodGreeting = document.getElementById('moodGreeting');
  const moodSubtext = document.getElementById('moodSubtext');
  const currentMood = localStorage.getItem('safespace_selected_mood');

  if (moodGreeting) {
    if (currentMood) {
      const moodMap = {
        bright: { title: "Feeling Bright", text: "Let's channel that positive energy with music, expression, and joy.", recommend: "music-section" },
        steady: { title: "Feeling Steady", text: "A balanced space to reflect, write, and stay grounded.", recommend: "demo-supabase-section" },
        heavy: { title: "Feeling Heavy", text: "Take things slow. Soft soundscapes and breathing are here for you.", recommend: "breathing-section" },
        overloaded: { title: "Feeling Overloaded", text: "Let's pause together. Unwind with box breathing or a focus game.", recommend: "breathing-section" }
      };

      const config = moodMap[currentMood];
      if (config) {
        moodGreeting.textContent = config.title;
        moodSubtext.textContent = config.text;

        const recCard = document.getElementById(config.recommend);
        if (recCard) recCard.classList.add('recommended');
      }
    } else {
      // No mood saved (e.g. came straight to Activities, or hit "Skip").
      moodGreeting.textContent = "Welcome to Activities";
      moodSubtext.textContent = "Take your time exploring breathing exercises, music, journaling, and games.";
    }
  }

  // ==========================================================
  // 6. Box Breathing Logic
  // ==========================================================
  // A simple 4-4-4-4 box breathing timer: each phase (inhale, hold,
  // exhale, hold) lasts 4 seconds, counting down once per second, then
  // advances to the next phase. The circle's CSS class ("inhale" /
  // "exhale") drives the actual scale animation in style.css.
  const startBreathingBtn = document.getElementById('startBreathingBtn');
  const breathingCircle = document.getElementById('breathingCircle');
  const breathInstruction = document.getElementById('breathInstruction');

  let breathingInterval = null;

  if (startBreathingBtn && breathingCircle && breathInstruction) {
    startBreathingBtn.addEventListener('click', function() {
      // Clicking again while it's running stops and resets it.
      if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
        breathingCircle.className = 'breathing-circle-inner';
        breathInstruction.textContent = 'Press start to begin';
        startBreathingBtn.textContent = 'Start Breathing';
        return;
      }

      startBreathingBtn.textContent = 'Stop';

      const phases = [
        { action: 'Inhale', class: 'inhale' },
        { action: 'Hold',   class: 'inhale' },
        { action: 'Exhale', class: 'exhale' },
        { action: 'Hold',   class: 'exhale' }
      ];

      let step = 0;
      let timeLeft = 4;

      function timer() {
        const currentPhase = phases[step];

        // Update text and circle scale
        breathInstruction.textContent = `${currentPhase.action}... (${timeLeft}s)`;
        breathingCircle.className = 'breathing-circle-inner ' + currentPhase.class;

        if (timeLeft > 0) {
          timeLeft--;
        } else {
          timeLeft = 4;
          step = (step + 1) % 4; // Advance phase on reaching 0
        }
      }

      timer(); // Run immediately on click
      breathingInterval = setInterval(timer, 1000);
    });
  }

  // ==========================================================
  // 8. Positive Affirmation Generator
  // ==========================================================
  // A pool of short affirmations shown one at a time; "New Affirmation"
  // picks a fresh random one, deliberately never repeating the one
  // that's currently on screen (see the do/while loop below).
  const affirmations = [
    "You are capable of handling whatever comes your way today.",
    "Resting is productive. Give yourself permission to pause.",
    "Your feelings are valid, and you don't have to figure everything out right now.",
    "Small steps still move you forward.",
    "You are worthy of kindness, peace, and patience.",
    "It's okay to not have everything figured out yet.",
    "You don't have to be perfect to be enough.",
    "This feeling is temporary, even when it doesn't feel that way.",
    "You've gotten through hard days before, and you can get through this one too.",
    "Taking care of yourself isn't selfish — it's necessary.",
    "You are allowed to take up space and ask for what you need.",
    "Progress doesn't have to be loud to count.",
    "You're doing better than you think you are.",
    "It's okay to slow down, even when the world doesn't.",
    "Your worth isn't measured by how productive you were today.",
    "You can be a work in progress and still be whole.",
    "Some days are just for getting through, and that's enough.",
    "You are not behind. You are exactly where you need to be.",
    "Asking for help is a sign of strength, not weakness.",
    "You get to define what a good day looks like for you.",
    "Your pace is your own — there's no race to finish.",
    "It's okay to outgrow habits, people, and old versions of yourself.",
    "You are allowed to rest before you're completely burnt out.",
    "Kindness toward yourself is not optional — it's essential.",
    "You are more resilient than you give yourself credit for."
  ];

  const affirmationText = document.getElementById('affirmationText');
  const nextAffirmationBtn = document.getElementById('nextAffirmationBtn');
  let lastAffirmationIndex = -1;

  if (nextAffirmationBtn && affirmationText) {
    nextAffirmationBtn.addEventListener('click', function() {
      let randomIndex;
      // Re-roll if we land on the same affirmation that's already showing.
      do {
        randomIndex = Math.floor(Math.random() * affirmations.length);
      } while (randomIndex === lastAffirmationIndex);
      lastAffirmationIndex = randomIndex;
      affirmationText.textContent = `"${affirmations[randomIndex]}"`;
    });
  }

  // ==========================================================
  // 10. Supabase Journal (per-account, protected by Row Level Security)
  // ==========================================================
  // The "Reflective Journal" card on activities.html and the
  // journal-history.html page both talk to a Supabase Postgres table
  // called `journal_entries`. Security isn't enforced by this
  // JavaScript — it's enforced by Row Level Security (RLS) policies
  // on the table itself (see the project's SQL migration), which only
  // let a logged-in user read/write rows where `user_id` matches their
  // own account. The anon/publishable key below is *meant* to be
  // public — it can't do anything the RLS policies don't allow.
  const demoForm = document.getElementById('demoEntryForm');
  const demoStatus = document.getElementById('demoStatus');

  // Supabase project configuration
  const demoSupabaseUrl = 'https://lmlbwxesvmgxjkwwyaxe.supabase.co';
  const demoSupabaseAnonKey = 'sb_publishable_-4t3NCscQszpc8Gg4Yd8bg_Yg6VgQVm';
  const demoTableName = 'journal_entries';

  let demoSupabase = null;

  if (!window.supabase) {
    console.warn('window.supabase is undefined — verify the CDN script loaded before script.js');
  } else if (typeof window.supabase.createClient !== 'function') {
    console.warn('window.supabase.createClient is not a function', window.supabase);
  } else {
    try {
      // By default Supabase keeps you signed in in localStorage, which
      // survives closing the tab/browser entirely. This is a personal
      // journal, so instead we use sessionStorage: you stay logged in
      // while clicking around the site, but closing the tab (or the
      // browser) clears it and the next visit starts logged out.
      demoSupabase = window.supabase.createClient(demoSupabaseUrl, demoSupabaseAnonKey, {
        auth: {
          storage: window.sessionStorage,
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (initErr) {
      console.error('Failed to initialize Supabase client', initErr);
    }
  }

  // Saving a new journal entry (activities.html).
  if (demoForm) {
    demoForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!demoSupabase) {
        setStatus(demoStatus, 'Supabase is not available right now.', 'error');
        return;
      }

      // Who's logged in? The form itself is hidden for logged-out
      // visitors (see the `data-requires-auth` gating below), but this
      // check protects against an already-open tab whose session just
      // expired.
      const { data: userData } = await demoSupabase.auth.getUser();
      const user = userData ? userData.user : null;
      if (!user) {
        setStatus(demoStatus, 'Please log in to save entries.', 'error');
        return;
      }

      const formData = new FormData(demoForm);
      const createdDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const entry = {
        title: String(formData.get('title') || '').trim(),
        mood: String(formData.get('mood') || '').trim(),
        content: String(formData.get('content') || '').trim(),
        created_at: createdDate,
        user_id: user.id // this is what the RLS policy checks against
      };

      if (!entry.title || !entry.mood || !entry.content) {
        setStatus(demoStatus, 'Please fill in all fields.', 'error');
        return;
      }

      setStatus(demoStatus, 'Saving...', null);

      try {
        const { error } = await demoSupabase.from(demoTableName).insert([entry]);
        if (error) throw error;

        setStatus(demoStatus, 'Saved.', 'success');
        demoForm.reset();
        loadJournalHistory(); // refresh in case the history list is also open
      } catch (error) {
        console.error('Journal save failed:', error);
        const msg = error && error.message ? error.message : String(error);
        setStatus(demoStatus, `Save failed: ${msg}`, 'error');
      }
    });
  }

  const journalHistoryList = document.getElementById('journalHistoryList');
  const journalHistoryStatus = document.getElementById('journalHistoryStatus');
  const journalHistoryEmpty = document.getElementById('journalHistoryEmpty');
  const returnActivitiesBtn = document.getElementById('returnActivitiesBtn');
  const viewJournalHistoryBtn = document.getElementById('viewJournalHistoryBtn');

  // Maps a saved mood value to the small icon shown next to each
  // journal history entry.
  const moodStickerMap = {
    bright: { src: 'images/bright.png', alt: 'Bright' },
    steady: { src: 'images/steady.png', alt: 'Steady' },
    heavy: { src: 'images/heavy.png', alt: 'Heavy' },
    overloaded: { src: 'images/overloaded.png', alt: 'Overloaded' }
  };

  if (returnActivitiesBtn) {
    returnActivitiesBtn.addEventListener('click', function() {
      window.location.href = 'activities.html';
    });
  }

  if (viewJournalHistoryBtn) {
    viewJournalHistoryBtn.addEventListener('click', function() {
      window.location.href = 'journal-history.html';
    });
  }

  // Small helper for renderJournalEntries: given a row from Supabase,
  // try a list of possible column names in order and return the first
  // one that actually has a value. This makes rendering forgiving of
  // minor schema differences instead of hard-coding one exact column name.
  function getJournalValue(entry, keys) {
    for (const key of keys) {
      if (entry[key] !== undefined && entry[key] !== null && String(entry[key]).trim() !== '') {
        return entry[key];
      }
    }
    return null;
  }

  // Fetches the logged-in user's journal entries and renders them on
  // journal-history.html. Only called once we know someone's logged in
  // (see updateAccountUI below) — RLS would just return an empty list
  // for a logged-out request anyway, but there's no reason to ask.
  async function loadJournalHistory() {
    if (!journalHistoryList || !demoSupabase) return;

    const { data: userData } = await demoSupabase.auth.getUser();
    const user = userData ? userData.user : null;
    if (!user) return; // the auth gate on the page explains why nothing is shown

    if (journalHistoryStatus) journalHistoryStatus.textContent = 'Loading your journal history...';
    if (journalHistoryEmpty) journalHistoryEmpty.style.display = 'none';

    try {
      // No `user_id` filter needed here — RLS on the table already
      // restricts this SELECT to rows owned by the logged-in user.
      const { data, error } = await demoSupabase
        .from(demoTableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (!data || data.length === 0) {
        if (journalHistoryStatus) journalHistoryStatus.textContent = '';
        if (journalHistoryEmpty) {
          journalHistoryEmpty.textContent = 'No journal entries yet. Save one from the Activities page to see it here.';
          journalHistoryEmpty.style.display = 'block';
        }
        return;
      }

      if (journalHistoryStatus) journalHistoryStatus.textContent = `Loaded ${data.length} journal entr${data.length === 1 ? 'y' : 'ies'}.`;
      renderJournalEntries(data);
    } catch (error) {
      console.error('Failed to load journal history:', error);
      if (journalHistoryStatus) journalHistoryStatus.textContent = '';
      if (journalHistoryEmpty) {
        journalHistoryEmpty.textContent = `There was a problem loading your journal entries: ${error.message || error}`;
        journalHistoryEmpty.style.display = 'block';
      }
    }
  }

  // Builds the actual DOM cards for each journal entry (date, mood
  // sticker, title, content) and drops them into the list container.
  function renderJournalEntries(entries) {
    if (journalHistoryEmpty) journalHistoryEmpty.style.display = 'none';
    if (journalHistoryStatus) journalHistoryStatus.style.display = 'block';
    journalHistoryList.innerHTML = '';

    entries.forEach(entry => {
      const item = document.createElement('article');
      item.className = 'journal-history-item';

      const header = document.createElement('div');
      header.className = 'journal-history-item-header';

      const date = document.createElement('div');
      date.className = 'journal-history-date';
      const createdAtValue = getJournalValue(entry, ['created_at', 'createdAt', 'inserted_at', 'insertedAt', 'date', 'timestamp']);
      const createdDate = createdAtValue ? new Date(createdAtValue) : new Date();
      date.textContent = createdDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

      const moodValue = getJournalValue(entry, ['mood', 'feeling', 'emotion', 'status']);
      const mood = document.createElement('div');
      mood.className = 'mood-sticker';
      const moodDef = moodStickerMap[String(moodValue || '').toLowerCase()];
      if (moodDef) {
        const sticker = document.createElement('img');
        sticker.src = moodDef.src;
        sticker.alt = moodDef.alt;
        sticker.title = moodDef.alt;
        mood.appendChild(sticker);
      } else {
        mood.textContent = moodValue || 'Unknown';
      }

      header.appendChild(date);
      header.appendChild(mood);

      const titleValue = getJournalValue(entry, ['title', 'heading', 'summary', 'entry_title']);
      const title = document.createElement('h2');
      title.className = 'journal-history-title';
      title.textContent = titleValue || 'Untitled entry';

      const contentValue = getJournalValue(entry, ['content', 'note', 'entry', 'journal', 'description']);
      const content = document.createElement('p');
      content.className = 'journal-history-content';
      content.textContent = contentValue || '';

      item.appendChild(header);
      item.appendChild(title);
      item.appendChild(content);
      journalHistoryList.appendChild(item);
    });
  }

  // ==========================================================
  // 11. Account (Sign Up / Log In / Log Out)
  // ==========================================================
  // Drives account.html's login/signup form, plus every "Log out"
  // button and login-gated section across the site (see updateAccountUI
  // and the `data-requires-auth` / `data-requires-guest` attributes
  // used throughout the HTML).
  const authForm = document.getElementById('authForm');
  const authModeToggle = document.getElementById('authModeToggle');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authStatus = document.getElementById('authStatus');
  const authEmailInput = document.getElementById('authEmail');
  const authPasswordInput = document.getElementById('authPassword');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

  // The same form is reused for both login and signup; this just tracks
  // which mode it's currently in (toggled below).
  let authMode = 'login';

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async function() {
      if (!demoSupabase) {
        setStatus(authStatus, 'Supabase is not available right now.', 'error');
        return;
      }

      const email = authEmailInput.value.trim();
      if (!email) {
        setStatus(authStatus, 'Enter your email above, then tap "Forgot password?" again.', 'error');
        return;
      }

      setStatus(authStatus, 'Sending a reset link...', null);

      try {
        // Supabase emails a link that lands the user on this page,
        // logged in with a temporary "recovery" session — see section 12.
        const redirectTo = new URL('reset-password.html', window.location.href).href;
        const { error } = await demoSupabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setStatus(authStatus, 'Check your email for a password reset link.', 'success');
      } catch (error) {
        setStatus(authStatus, error.message || 'Something went wrong.', 'error');
      }
    });
  }

  if (authModeToggle) {
    authModeToggle.addEventListener('click', function() {
      authMode = authMode === 'login' ? 'signup' : 'login';
      if (authSubmitBtn) authSubmitBtn.textContent = authMode === 'login' ? 'Log In' : 'Sign Up';
      authModeToggle.textContent = authMode === 'login'
        ? 'Need an account? Sign up'
        : 'Already have an account? Log in';
      setStatus(authStatus, '', null);
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!demoSupabase) {
        setStatus(authStatus, 'Supabase is not available right now.', 'error');
        return;
      }

      const email = authEmailInput.value.trim();
      const password = authPasswordInput.value;
      if (!email || !password) {
        setStatus(authStatus, 'Please enter an email and password.', 'error');
        return;
      }

      setStatus(authStatus, authMode === 'login' ? 'Logging in...' : 'Creating your account...', null);

      try {
        if (authMode === 'login') {
          const { error } = await demoSupabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          setStatus(authStatus, 'Logged in.', 'success');
          // No manual redirect/UI-swap needed here — onAuthStateChange
          // (below) fires automatically and calls updateAccountUI().
        } else {
          const { data, error } = await demoSupabase.auth.signUp({ email, password });
          if (error) throw error;
          // If your Supabase project has "Confirm email" turned off, signUp()
          // hands back an active session immediately and you're logged in
          // right away (onAuthStateChange below picks this up on its own).
          // If confirmation is required, no session exists yet - you have to
          // click the emailed link first, then log in normally.
          if (data.session) {
            setStatus(authStatus, 'Account created — you\'re logged in.', 'success');
          } else {
            setStatus(authStatus, 'Account created. Check your email to confirm it, then log in.', 'success');
          }
        }
        authForm.reset();
      } catch (error) {
        setStatus(authStatus, error.message || 'Something went wrong.', 'error');
      }
    });
  }

  // Every "Log out" button on the site shares this one class, wherever
  // it appears (account.html, the journal card, journal history).
  document.querySelectorAll('.sign-out-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (demoSupabase) demoSupabase.auth.signOut();
    });
  });

  // Central place that reacts to "logged in" vs "logged out": shows/hides
  // every element marked `data-requires-auth` or `data-requires-guest`
  // across the current page, fills in `data-account-email` placeholders,
  // and (re)loads journal history when appropriate. Called once on page
  // load and again every time the auth state actually changes.
  function updateAccountUI(session) {
    const user = session ? session.user : null;

    document.querySelectorAll('[data-requires-auth]').forEach(el => { el.hidden = !user; });
    document.querySelectorAll('[data-requires-guest]').forEach(el => { el.hidden = !!user; });
    document.querySelectorAll('[data-account-email]').forEach(el => { el.textContent = user ? user.email : ''; });

    if (user) {
      loadJournalHistory();
    } else {
      if (journalHistoryList) journalHistoryList.innerHTML = '';
      if (journalHistoryStatus) journalHistoryStatus.textContent = '';
      if (journalHistoryEmpty) journalHistoryEmpty.style.display = 'none';
    }
  }

  if (demoSupabase) {
    // Fires on every login, logout, token refresh, etc. — this is what
    // makes the UI update instantly without a page reload.
    demoSupabase.auth.onAuthStateChange(function(_event, session) {
      updateAccountUI(session);
    });
    // Also check once up front for whoever's already logged in when the
    // page first loads (e.g. navigating between pages mid-session).
    demoSupabase.auth.getSession().then(function(result) {
      updateAccountUI(result.data.session);
    });
  } else {
    updateAccountUI(null);
  }

  // ==========================================================
  // 12. Password Reset (from the emailed recovery link)
  // ==========================================================
  // Only present on reset-password.html. Supabase's recovery link
  // already logs the visitor into a temporary session when they click
  // it (handled automatically by the Supabase client, no code needed
  // here for that part) — this form just sets a new password on that
  // already-authenticated session.
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const resetPasswordInput = document.getElementById('resetPassword');
  const resetStatus = document.getElementById('resetStatus');

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!demoSupabase) {
        setStatus(resetStatus, 'Supabase is not available right now.', 'error');
        return;
      }

      const password = resetPasswordInput.value;
      if (!password || password.length < 6) {
        setStatus(resetStatus, 'Please enter at least 6 characters.', 'error');
        return;
      }

      setStatus(resetStatus, 'Updating password...', null);

      try {
        const { error } = await demoSupabase.auth.updateUser({ password });
        if (error) throw error;
        setStatus(resetStatus, 'Password updated. You can now log in with your new password.', 'success');
        resetPasswordForm.reset();
      } catch (error) {
        setStatus(resetStatus, error.message || 'Something went wrong.', 'error');
      }
    });
  }
});

// ==========================================================
// 9. p5.js Game Instance (Mounted in #p5-canvas-container)
// ==========================================================
// A small grounding/focus mini-game: hold the right arrow key to push
// a boulder up a hill. It slips back down until you recruit enough
// helpers (press space when prompted) — with all 5 people pushing
// together, the boulder crests the hill and the sky transitions from
// night to sunrise. This lives outside the DOMContentLoaded listener
// above and instantiates itself immediately (guarded by the container
// check below), since script.js is deferred and only runs once the
// page is already fully parsed anyway.
if (document.getElementById('p5-canvas-container')) {
  new p5(function(p) {
    // Boulder position. Moves right + up as it's pushed; falls back to
    // (startX, startY) whenever it slips.
    let rockX = 250;
    let rockY = 800;

    let startX = 250;
    let startY = 800;

    // How many people are currently helping push (1-5). More people =
    // faster push speed and a further "fall point" before it slips.
    let people = 1;
    let speed = 3.5;

    let pushing = false; // true while the right arrow is held
    let won = false;     // true once 5 people push the boulder all the way

    let canAddPerson = false; // true right after a slip, until you press space

    let resets = 0; // how many times the boulder has slipped (unused visually, kept for potential future use)

    // "Try Again!" banner shown briefly after a slip.
    let showTryAgain = false;
    let tryAgainTimer = 0;

    // Physics state for the boulder tumbling back down after a slip.
    let fallingRockX = 0;
    let fallingRockY = 0;
    let fallingRockSpeedX = 0;
    let fallingRockSpeedY = 0;
    let fallingRockActive = false;

    p.setup = function() {
      const container = document.getElementById('p5-canvas-container');
      const canvas = p.createCanvas(1000, 1000);
      canvas.parent(container);
      p.frameRate(120);

      // The skeleton placeholder (style.css: .skeleton-game) is only
      // needed until the canvas actually exists.
      const gameSkeleton = document.getElementById('gameSkeleton');
      if (gameSkeleton) gameSkeleton.remove();
    };

    p.draw = function() {
      // dayAmount goes from 0 (night) to 1 (full sunrise) as the
      // 5-person boulder approaches the top of the hill — this drives
      // the sky color, star/moon fade-out, and sun fade-in below.
      let dayAmount = 0;

      if (people == 5) {
        dayAmount = p.constrain((rockX - 250) / 750, 0, 1);
        dayAmount = dayAmount * dayAmount * (3 - 2 * dayAmount); // smoothstep easing
      }

      let skyR = p.lerp(8, 100, dayAmount);
      let skyG = p.lerp(12, 180, dayAmount);
      let skyB = p.lerp(40, 240, dayAmount);

      p.background(skyR, skyG, skyB);

      // Stars
      let starAlpha = 255 * (1 - dayAmount);
      p.fill(255, starAlpha);
      p.noStroke();

      p.ellipse(80, 100, 3, 3);
      p.ellipse(150, 180, 4, 4);
      p.ellipse(230, 80, 3, 3);
      p.ellipse(310, 150, 3, 3);
      p.ellipse(390, 60, 4, 4);
      p.ellipse(470, 130, 3, 3);
      p.ellipse(550, 75, 3, 3);
      p.ellipse(630, 180, 4, 4);
      p.ellipse(710, 90, 3, 3);
      p.ellipse(780, 160, 3, 3);
      p.ellipse(860, 70, 4, 4);
      p.ellipse(930, 140, 3, 3);

      p.ellipse(120, 300, 3, 3);
      p.ellipse(200, 250, 4, 4);
      p.ellipse(300, 320, 3, 3);
      p.ellipse(450, 250, 3, 3);
      p.ellipse(600, 300, 3, 3);
      p.ellipse(750, 260, 4, 4);
      p.ellipse(900, 320, 3, 3);

      // Moon (fades out as day rises)
      let moonAlpha = 255 * (1 - dayAmount);
      p.fill(255, 250, 210, moonAlpha);
      p.ellipse(820, 130, 100, 100);

      p.fill(skyR, skyG, skyB, moonAlpha);
      p.ellipse(850, 105, 90, 90); // carves out the moon's crescent shadow

      // Sun (fades in as day rises, same position as the moon)
      let sunAlpha = 255 * dayAmount;
      p.fill(255, 235, 120, sunAlpha * 0.2); // soft outer glow
      p.ellipse(820, 130, 190, 190);

      p.fill(255, 220, 70, sunAlpha);
      p.ellipse(820, 130, 100, 100);

      // Distant Mountains
      p.fill(
        p.lerp(18, 70, dayAmount),
        p.lerp(25, 90, dayAmount),
        p.lerp(50, 125, dayAmount)
      );
      p.noStroke();

      p.beginShape();
      p.vertex(0, 650);
      p.vertex(120, 560);
      p.vertex(230, 630);
      p.vertex(350, 500);
      p.vertex(470, 620);
      p.vertex(600, 450);
      p.vertex(730, 590);
      p.vertex(850, 460);
      p.vertex(1000, 580);
      p.vertex(1000, 900);
      p.vertex(0, 900);
      p.endShape(p.CLOSE);

      // Mountain Highlights
      p.fill(
        p.lerp(35, 130, dayAmount),
        p.lerp(40, 145, dayAmount),
        p.lerp(65, 170, dayAmount)
      );

      p.beginShape();
      p.vertex(120, 560);
      p.vertex(230, 630);
      p.vertex(350, 500);
      p.vertex(470, 620);
      p.vertex(600, 450);
      p.vertex(730, 590);
      p.vertex(850, 460);
      p.vertex(1000, 580);
      p.vertex(950, 610);
      p.vertex(850, 500);
      p.vertex(730, 630);
      p.vertex(600, 490);
      p.vertex(470, 660);
      p.vertex(350, 540);
      p.vertex(230, 670);
      p.endShape(p.CLOSE);

      // Dark Cliff (the slope the boulder is pushed up)
      p.fill(65, 38, 25);
      p.noStroke();

      p.beginShape();
      p.vertex(0, 900);
      p.vertex(130, 895);
      p.vertex(250, 830);
      p.vertex(380, 750);
      p.vertex(510, 670);
      p.vertex(640, 590);
      p.vertex(770, 510);
      p.vertex(900, 420);
      p.vertex(1000, 350);
      p.vertex(1000, 1000);
      p.vertex(0, 1000);
      p.endShape(p.CLOSE);

      // Light Cliff Surface
      p.fill(125, 72, 38);
      p.beginShape();
      p.vertex(0, 900);
      p.vertex(130, 895);
      p.vertex(250, 830);
      p.vertex(380, 750);
      p.vertex(510, 670);
      p.vertex(640, 590);
      p.vertex(770, 510);
      p.vertex(900, 420);
      p.vertex(1000, 350);
      p.vertex(1000, 395);
      p.vertex(900, 465);
      p.vertex(770, 555);
      p.vertex(640, 635);
      p.vertex(510, 715);
      p.vertex(380, 795);
      p.vertex(250, 875);
      p.vertex(130, 930);
      p.vertex(0, 940);
      p.endShape(p.CLOSE);

      // Cliff Shadow
      p.fill(75, 43, 26);
      p.beginShape();
      p.vertex(0, 940);
      p.vertex(130, 930);
      p.vertex(250, 875);
      p.vertex(380, 795);
      p.vertex(510, 715);
      p.vertex(640, 635);
      p.vertex(770, 555);
      p.vertex(900, 465);
      p.vertex(1000, 395);
      p.vertex(1000, 1000);
      p.vertex(0, 1000);
      p.endShape(p.CLOSE);

      // Cliff Top
      p.fill(150, 88, 45);
      p.beginShape();
      p.vertex(0, 900);
      p.vertex(130, 895);
      p.vertex(250, 830);
      p.vertex(380, 750);
      p.vertex(510, 670);
      p.vertex(640, 590);
      p.vertex(770, 510);
      p.vertex(900, 420);
      p.vertex(1000, 350);
      p.vertex(990, 370);
      p.vertex(900, 440);
      p.vertex(770, 530);
      p.vertex(640, 610);
      p.vertex(510, 690);
      p.vertex(380, 770);
      p.vertex(250, 850);
      p.vertex(130, 915);
      p.vertex(0, 920);
      p.endShape(p.CLOSE);

      // Rock Movement — only advances while the right arrow is held,
      // the game isn't already won, and the rock isn't mid-slip.
      // More helpers (`people`) push faster.
      if (pushing && !won && !fallingRockActive) {
        let groupSpeed = speed + (people - 1) * 2.5;
        rockX += groupSpeed * 0.12;
        rockY -= groupSpeed * 0.09;
      }

      // Progress Points — with fewer than 5 people, the boulder can
      // only get partway up the hill (1/5, 2/5, 3/5, 4/5) before it
      // slips back down. Only with all 5 helpers can it reach the top.
      let fallPoint;
      if (people == 1) fallPoint = 250 + 750 * (1 / 5);
      else if (people == 2) fallPoint = 250 + 750 * (2 / 5);
      else if (people == 3) fallPoint = 250 + 750 * (3 / 5);
      else if (people == 4) fallPoint = 250 + 750 * (4 / 5);
      else fallPoint = 1000; // with 5 people, no fall point - the far edge is the finish line

      // Start Falling — triggers the slip once the boulder passes its
      // current fall point.
      if (rockX > fallPoint && people < 5 && !fallingRockActive) {
        fallingRockX = rockX;
        fallingRockY = rockY;
        fallingRockSpeedX = -2;
        fallingRockSpeedY = 1;
        fallingRockActive = true;
        pushing = false;
        resets++;
        canAddPerson = false;
        showTryAgain = true;
        tryAgainTimer = 120;
      }

      // Falling Rock Physics — simple gravity + friction while the
      // boulder tumbles back down after a slip, until it lands.
      if (fallingRockActive) {
        fallingRockX += fallingRockSpeedX;
        fallingRockY += fallingRockSpeedY;
        fallingRockSpeedY += 0.18;  // gravity
        fallingRockSpeedX -= 0.01;  // slight extra drift

        if (fallingRockY > 900) {
          fallingRockActive = false;
          rockX = startX;
          rockY = startY;
          canAddPerson = true; // now the player can press space to recruit another helper
          tryAgainTimer = 70;
        }
      }

      if (showTryAgain) {
        tryAgainTimer--;
        if (tryAgainTimer <= 0) showTryAgain = false;
      }

      // Win condition: all 5 people, boulder reaches the far edge.
      if (people == 5 && rockX >= 1000) {
        won = true;
        pushing = false;
      }

      if (!fallingRockActive) drawRock(rockX, rockY);
      else drawFallingRock(fallingRockX, fallingRockY);

      // Draw each helper trailing behind the boulder.
      if (!fallingRockActive) {
        for (let i = 0; i < people; i++) {
          let personX = rockX - 50 - i * 28;
          let personY = rockY + 25 + i * 20;
          drawPerson(personX, personY, dayAmount);
        }
      }

      // Instructions UI
      p.fill(255);
      p.textSize(20);

      if (people > 1) p.text("People helping: " + people, 30, 40);
      p.text("Hold RIGHT ARROW to push", 30, 70);

      if (canAddPerson && people < 5) {
        p.text("Press SPACE to add a helper", 30, 100);
      }

      if (showTryAgain) {
        p.textAlign(p.CENTER);
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(7);
        p.textSize(42);
        p.text("TRY AGAIN!", p.width / 2, 300);

        p.textSize(20);
        p.text("The rock slipped, but you can try again!", p.width / 2, 335);
        p.noStroke();
        p.textAlign(p.LEFT);
      }

      if (won) {
        p.textAlign(p.CENTER);
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(5);
        p.textSize(25);
        p.text(
          "With the right peers, your problems will become weightless\nand you will be able to push through all difficulties.",
          p.width / 2,
          150
        );

        p.textSize(20);
        p.text("Press ENTER to help someone else start pushing.", p.width / 2, 220);
        p.noStroke();
        p.textAlign(p.LEFT);
      }
    };

    // Draws the boulder at rest/rolling (shadow, base, highlight, and
    // shading arc for a bit of depth).
    function drawRock(x, y) {
      p.fill(35, 25, 25, 100);
      p.ellipse(x + 8, y + 43, 90, 25); // ground shadow
      p.fill(75, 73, 70);
      p.ellipse(x, y, 90, 90); // base
      p.fill(105, 103, 98);
      p.ellipse(x - 15, y - 15, 55, 50); // highlight
      p.fill(50, 48, 45);
      p.arc(x + 12, y, 65, 78, -p.HALF_PI, p.HALF_PI); // shading
      p.fill(130, 127, 120, 100);
      p.ellipse(x - 22, y - 24, 12, 8); // specular glint
    }

    // Same boulder, but rotating in place — used while it's tumbling
    // back down the hill after a slip.
    function drawFallingRock(x, y) {
      p.push();
      p.translate(x, y);
      p.rotate(p.frameCount * 0.12);
      p.fill(35, 25, 25, 100);
      p.ellipse(8, 43, 90, 25);
      p.fill(75, 73, 70);
      p.ellipse(0, 0, 90, 90);
      p.fill(105, 103, 98);
      p.ellipse(-15, -15, 55, 50);
      p.fill(50, 48, 45);
      p.arc(12, 0, 65, 78, -p.HALF_PI, p.HALF_PI);
      p.fill(130, 127, 120, 100);
      p.ellipse(-22, -24, 12, 8);
      p.pop();
    }

    // Draws one helper (legs, shirt, arms, head). `sunlightStrength`
    // (only nonzero once all 5 people are pushing near the summit)
    // warms up their skin/shirt tones and adds a soft sunlit glow.
    function drawPerson(x, y, sunlight) {
      let sunlightStrength = 0;
      if (people == 5) {
        sunlightStrength = p.constrain((rockX - 650) / 350, 0, 1);
      }

      let skinR = p.lerp(160, 215, sunlightStrength);
      let skinG = p.lerp(160, 195, sunlightStrength);
      let skinB = p.lerp(160, 135, sunlightStrength);

      let shirtR = p.lerp(55, 135, sunlightStrength);
      let shirtG = p.lerp(75, 105, sunlightStrength);
      let shirtB = p.lerp(120, 145, sunlightStrength);

      // Legs
      p.stroke(40);
      p.strokeWeight(6);
      p.line(x - 6, y + 42, x - 9, y + 57);
      p.line(x + 6, y + 42, x + 9, y + 57);

      // Feet
      p.stroke(25);
      p.strokeWeight(5);
      p.line(x - 9, y + 57, x - 15, y + 57);
      p.line(x + 9, y + 57, x + 15, y + 57);

      // Torso
      p.noStroke();
      p.fill(shirtR, shirtG, shirtB);
      p.ellipse(x, y + 27, 25, 30);

      // Arms (reaching toward the boulder)
      p.stroke(skinR, skinG, skinB);
      p.strokeWeight(6);
      p.line(x - 7, y + 22, x + 17, y + 29);
      p.line(x + 7, y + 24, x + 27, y + 32);

      // Hands
      p.noStroke();
      p.fill(skinR, skinG, skinB);
      p.ellipse(x + 19, y + 30, 8, 8);
      p.ellipse(x + 29, y + 33, 8, 8);

      // Head
      p.fill(skinR, skinG, skinB);
      p.ellipse(x, y, 30, 30);

      // Hair
      p.fill(35);
      p.arc(x, y - 3, 30, 25, p.PI, p.TWO_PI);

      // Sunlit highlight, only visible once dawn starts breaking.
      if (sunlightStrength > 0) {
        p.fill(255, 220, 120, 80 * sunlightStrength);
        p.ellipse(x - 6, y - 5, 10, 7);
        p.ellipse(x - 8, y + 20, 7, 12);

        p.stroke(255, 220, 120, 100 * sunlightStrength);
        p.strokeWeight(3);
        p.line(x + 9, y + 23, x + 25, y + 30);
        p.noStroke();
      }
    }

    // Right arrow = push. Space = recruit a helper (only right after a
    // slip, while canAddPerson is true). Enter = restart after winning.
    p.keyPressed = function() {
      if (p.keyCode == p.RIGHT_ARROW && !fallingRockActive) {
        pushing = true;
      }

      if (p.key == " " && canAddPerson && !fallingRockActive && people < 5) {
        people++;
        canAddPerson = false;
      }

      if (p.keyCode == p.ENTER && won) {
        people = 1;
        rockX = startX;
        rockY = startY;
        won = false;
        canAddPerson = false;
        pushing = false;
        resets = 0;
        showTryAgain = false;
        fallingRockActive = false;
      }
    };

    p.keyReleased = function() {
      if (p.keyCode == p.RIGHT_ARROW) {
        pushing = false;
      }
    };
  });
}
