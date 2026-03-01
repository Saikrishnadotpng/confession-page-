let confessions = JSON.parse(localStorage.getItem("confessions")) || [];
let bannedKeywords = JSON.parse(localStorage.getItem("bannedKeywords")) || [
  "spam",
  "abuse",
  "hate",
];

const DOM = {
  form: document.getElementById("confession-form"),
  text: document.getElementById("confession-text"),
  charCount: document.getElementById("char-count"),
  mood: document.getElementById("mood-selector"),
  error: document.getElementById("error-message"),
  confirmation: document.getElementById("confirmation-message"),
  feed: document.getElementById("feed-section"),
  featured: document.getElementById("featured-section"),
  age: document.getElementById("user-age"),
  email: document.getElementById("user-email"),
  step1: document.getElementById("step-1"),
  step2: document.getElementById("step-2"),
  verifyBtn: document.getElementById("verify-age-btn")
};

let adultSound = new Audio('fhaaa.mp3');
let minorSound = new Audio('whatsapp.mp4');

function initAudio() {
  // Sounds already initialized
}

const themes = {
  "🌙": "theme-late-night",
  "💖": "theme-crush",
  "😂": "theme-funny",
  "😢": "theme-regret",
  "🔥": "theme-spicy",
  "🌧": "theme-vent"
};

function init() {
  if (DOM.form) {
    DOM.text.addEventListener("input", handleInput);
    DOM.form.addEventListener("submit", handleSubmit);
    DOM.mood.addEventListener("change", handleMoodChange);
    DOM.age.addEventListener("input", handleAgeChange);
    
    // Initialize audio context on first interaction to bypass browser policies
    document.addEventListener("click", initAudio, { once: true });
    
    if(DOM.verifyBtn) DOM.verifyBtn.addEventListener("click", handleVerify);
    renderFeed();
    handleMoodChange(false); // init without animation
  }
}

async function handleVerify() {
  const age = parseInt(DOM.age.value);
  const email = DOM.email.value.trim();

  if (!age || age <= 0 || age > 120) {
    showError("Please enter a valid age.");
    return;
  }

  if (age < 18) {
    if (!email || !email.includes('@')) {
      showError("A valid email is required for users under 18.");
      return;
    }
    
    DOM.verifyBtn.textContent = "Checking...";
    DOM.verifyBtn.disabled = true;
    const isTemp = await isTempMail(email);
    DOM.verifyBtn.textContent = "Unlock Confession";
    DOM.verifyBtn.disabled = false;
    
    if (isTemp) {
      showError("Temporary or disposable emails are not allowed.");
      return;
    }
  }
  
  // Clear any existing error
  DOM.error.textContent = "";

  // Ensure audio is initialized
  initAudio();

  // Play custom age-specific sound securely
  try {
    if (age >= 18) {
      if (adultSound.readyState > 0) adultSound.currentTime = 0;
      let playPromise = adultSound.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Audio playback prevented:", error));
      }
    } else {
      if (minorSound.readyState > 0) minorSound.currentTime = 0;
      let playPromise = minorSound.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Audio playback prevented:", error));
      }
    }
  } catch(e) {
    console.log("Audio error:", e);
  }

  // Handle Under 18 scenario
  if (age < 18) {
    simulateEmailSend(email);
    showError("Restricted Area: You must be 18 or older to access confessions.");
    return; // Stop here, do not transition to step 2
  }

  // Transition to step 2 (Only for 18+)
  DOM.step1.classList.add("fade-out");
  setTimeout(() => {
    DOM.step1.classList.add("hidden");
    DOM.step2.classList.remove("hidden");
    DOM.step2.classList.add("fade-in-up");
  }, 400);
}

function handleAgeChange() {
  const age = parseInt(DOM.age.value);
  if (age && age < 18) {
    DOM.email.classList.remove("hidden");
    DOM.email.setAttribute("required", "true");
    
    // Play audio instantly without waiting for unlock
    initAudio();
    try {
      minorSound.currentTime = 0;
      let playPromise = minorSound.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Audio playback prevented:", error));
      }
    } catch(e) {
      console.log("Audio error:", e);
    }
  } else {
    DOM.email.classList.add("hidden");
    DOM.email.removeAttribute("required");
  }
}

function handleMoodChange(animate = true) {
  const oldTheme = document.body.className;
  const newTheme = themes[DOM.mood.value] || "theme-late-night";
  
  if (oldTheme !== newTheme) {
    document.body.className = newTheme;
    if (animate) {
      triggerMoodRipple();
    }
  }
}

function triggerMoodRipple() {
  const ripple = document.createElement("div");
  ripple.className = "mood-ripple";
  document.body.appendChild(ripple);
  
  // Get color based on theme
  const colors = {
    "theme-late-night": "rgba(255, 255, 255, 0.15)",
    "theme-crush": "rgba(255, 105, 180, 0.3)",
    "theme-funny": "rgba(255, 204, 0, 0.3)",
    "theme-regret": "rgba(100, 149, 237, 0.3)",
    "theme-spicy": "rgba(255, 69, 0, 0.3)",
    "theme-vent": "rgba(169, 169, 169, 0.3)"
  };
  
  ripple.style.background = `radial-gradient(circle, ${colors[document.body.className]} 0%, transparent 70%)`;
  
  setTimeout(() => {
    ripple.remove();
  }, 1000);
}

let typingTimeout;
function handleInput() {
  const length = DOM.text.value.length;
  DOM.charCount.textContent = length;
  if (length > 80000) {
    DOM.text.value = DOM.text.value.substring(0, 80000);
    DOM.charCount.textContent = 80000;
  }
  
  if (DOM.form.parentElement) {
    DOM.form.parentElement.classList.add("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        DOM.form.parentElement.classList.remove("typing");
    }, 400);
  }
}

function containsPhone(text) {
  const digits = text.replace(/\D/g, "");
  return digits.length >= 7;
}

function containsBannedWords(text) {
  const lowerText = text.toLowerCase();
  return bannedKeywords.some((keyword) => lowerText.includes(keyword));
}

async function isTempMail(email) {
  if (!email) return false;
  const exactTempDomains = [
    'yopmail.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
    'mailinator.com', 'temp-mail.org', 'tempmail.ninja', 'getnada.com', 
    'dropmail.me', 'dispostable.com', 'throwawaymail.com', 'fakeinbox.com',
    'tempmailaddress.com', 'tempmail.net', 'temp-mail.io', 'minuteinbox.com',
    'ethereal.email', 'sharklasers.com', 'nada.ltd', 'mohmal.com', 'luxusmail.net',
    'mail-temp.com', 'crazymail.com', 'trashmail.com', 'tempemail.net', 'maildrop.cc'
  ];
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  if (exactTempDomains.includes(domain.toLowerCase())) {
    return true;
  }
  
  try {
    const response = await fetch(`https://open.kickbox.com/v1/disposable/${domain}`);
    if (response.ok) {
      const data = await response.json();
      if (data.disposable === true) return true;
    }
  } catch (err) {
    console.error("Kickbox check failed:", err);
  }
  
  try {
    const response2 = await fetch(`https://disposable.debounce.io/?email=${email}`);
    if (response2.ok) {
      const data = await response2.json();
      if (data.disposable === "true") return true;
    }
  } catch (err) {
    console.error("Debounce check failed:", err);
  }
  
  return false;
}


async function handleSubmit(e) {
  e.preventDefault();
  const text = DOM.text.value.trim();

  const age = parseInt(DOM.age.value);
  const email = DOM.email.value.trim();

  if (!age || age <= 0) {
    showError("Please enter a valid age.");
    return;
  }

  if (age < 18) {
    if (!email) {
      showError("Email is required for users under 18.");
      return;
    }
    
    const submitBtn = DOM.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Verifying...";
    submitBtn.disabled = true;
    const isTemp = await isTempMail(email);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    if (isTemp) {
      showError("Temporary or disposable emails are not allowed.");
      return;
    }
  }

  if (text.length < 1) {
    showError("Confession cannot be empty.");
    return;
  }

  if (containsPhone(text)) {
    showError("Phone numbers are not allowed.");
    return;
  }

  if (containsBannedWords(text)) {
    showError("Your confession contains inappropriate language.");
    return;
  }

  const newConfession = {
    id: Date.now().toString(),
    text: text,
    mood: DOM.mood.value,
    timestamp: new Date().toISOString(),
    reactions: { love: 0, funny: 0, sad: 0, fire: 0 },
    status: "approved",
    featured: false,
    age: age
  };

  confessions.unshift(newConfession);
  saveData();

  DOM.form.classList.add("hidden");
  DOM.confirmation.classList.remove("hidden");
  
  let confirmationText = "Your words are now part of the night.";

  typeWriter(
    confirmationText,
    DOM.confirmation,
    0,
    () => {
      setTimeout(() => {
        DOM.form.reset();
        DOM.charCount.textContent = "0";
        DOM.email.classList.add("hidden");
        
        // Reset Steps
        DOM.step2.classList.add("hidden");
        DOM.step2.classList.remove("fade-in-up");
        DOM.step1.classList.remove("hidden", "fade-out");
        
        DOM.confirmation.classList.add("hidden");
        DOM.confirmation.innerHTML = "";
        DOM.form.classList.remove("hidden");
        renderFeed();
      }, 4000);
    },
  );
}

function simulateEmailSend(email) {
  const mailAlert = document.createElement("div");
  mailAlert.className = "mail-alert";
  mailAlert.innerHTML = `<span>✉️ Sending notice to ${email}...</span>`;
  document.body.appendChild(mailAlert);
  
  requestAnimationFrame(() => {
    mailAlert.style.opacity = "1";
    mailAlert.style.transform = "translate(-50%, 0)";
  });
  
  setTimeout(() => {
    mailAlert.innerHTML = `<span>✅ Mail sent successfully!</span>`;
    setTimeout(() => {
      mailAlert.style.opacity = "0";
      mailAlert.style.transform = "translate(-50%, -20px)";
      setTimeout(() => mailAlert.remove(), 500);
    }, 2000);
  }, 1500);
}

function showError(msg) {
  DOM.error.textContent = msg;
  setTimeout(() => {
    DOM.error.textContent = "";
  }, 3000);
}

function typeWriter(text, element, i, callback) {
  if (i < text.length) {
    element.innerHTML += text.charAt(i);
    setTimeout(() => typeWriter(text, element, i + 1, callback), 50);
  } else if (callback) {
    callback();
  }
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function renderFeed() {
  if (!DOM.feed) return;

  const approved = confessions.filter((c) => c.status === "approved");
  const featured = approved.find((c) => c.featured);

  if (featured) {
    DOM.featured.classList.remove("hidden");
    DOM.featured.innerHTML = `
            <div class="featured-label">Confession of the Night</div>
            ${createCardHTML(featured, true)}
        `;
  } else {
    DOM.featured.classList.add("hidden");
    DOM.featured.innerHTML = "";
  }

  DOM.feed.innerHTML = approved
    .filter((c) => !c.featured)
    .map((c) => createCardHTML(c, false))
    .join("");
}

function createCardHTML(confession, isFeatured) {
  return `
        <div class="glass-card confession-card ${isFeatured ? "featured" : ""}" id="card-${confession.id}">
            <div class="card-header">
                <span class="mood-icon">${confession.mood}</span>
                <span class="timestamp">${timeAgo(confession.timestamp)}</span>
            </div>
            <div class="confession-content">
                ${escapeHTML(confession.text)}
            </div>
            <div class="card-footer">
                <div class="reactions">
                    <button class="reaction-btn" onclick="react('${confession.id}', 'love')">❤️ <span id="r-love-${confession.id}">${confession.reactions.love}</span></button>
                    <button class="reaction-btn" onclick="react('${confession.id}', 'funny')">😂 <span id="r-funny-${confession.id}">${confession.reactions.funny}</span></button>
                    <button class="reaction-btn" onclick="react('${confession.id}', 'sad')">😢 <span id="r-sad-${confession.id}">${confession.reactions.sad}</span></button>
                    <button class="reaction-btn" onclick="react('${confession.id}', 'fire')">🔥 <span id="r-fire-${confession.id}">${confession.reactions.fire}</span></button>
                </div>
                <button class="share-btn" onclick="shareConfession('${confession.id}')" title="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </button>
            </div>
        </div>
    `;
}

// Make globally available for onclick
window.react = function (id, type) {
  const confession = confessions.find((c) => c.id === id);
  if (confession) {
    confession.reactions[type]++;
    saveData();
    document.getElementById(`r-${type}-${id}`).textContent = confession.reactions[type];
  }
};

window.shareConfession = function (id) {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied to clipboard. Whisper it to someone.");
};

window.scrollToForm = function () {
  document
    .getElementById("submission-section")
    .scrollIntoView({ behavior: "smooth" });
};

window.scrollToRandom = function () {
  const cards = document.querySelectorAll(".confession-card");
  if (cards.length > 0) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    randomCard.scrollIntoView({ behavior: "smooth", block: "center" });
    randomCard.style.boxShadow = "0 0 30px var(--neon-glow-strong)";
    setTimeout(() => {
      randomCard.style.boxShadow = "";
    }, 1500);
  }
};

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}

function saveData() {
  localStorage.setItem("confessions", JSON.stringify(confessions));
  localStorage.setItem("bannedKeywords", JSON.stringify(bannedKeywords));
}

window.addEventListener("scroll", () => {
  const cards = document.querySelectorAll(".confession-card");
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
});

window.addEventListener('storage', (e) => {
  if (e.key === 'confessions' || e.key === 'bannedKeywords') {
    confessions = JSON.parse(localStorage.getItem("confessions")) || [];
    bannedKeywords = JSON.parse(localStorage.getItem("bannedKeywords")) || ["spam", "abuse", "hate"];
    renderFeed();
  }
});

// Refresh "time ago" every minute
setInterval(renderFeed, 60000);

init();

