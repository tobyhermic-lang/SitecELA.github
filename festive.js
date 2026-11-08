
/* =========================================
   ENGLISH LEARNING HUB
   FESTIVE DECORATION SYSTEM
   ========================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "englishHubFestiveSettings";

  // =========================================
  // 1. DEFAULT SETTINGS
  // =========================================

  const DEFAULT_SETTINGS = {
    enabled: true,
    mode: "automatic",
    theme: "christmas",
    intensity: "balanced"
  };

  // Add or update Tết dates here each year.
  // Format: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
  const TET_DATES = [
    // Example:
    // { start: "2027-02-05", end: "2027-02-10" }
  ];

  const THEME_INFO = {
    christmas: {
      name: "Christmas",
      icon: "🎄",
      message: "Merry Christmas! Enjoy learning!"
    },
    halloween: {
      name: "Halloween",
      icon: "🎃",
      message: "Happy Halloween! Have a spooky learning day!"
    },
    tet: {
      name: "Lunar New Year",
      icon: "🧧",
      message: "Happy Lunar New Year! Wishing you good luck!"
    },
    newyear: {
      name: "New Year",
      icon: "🎉",
      message: "Happy New Year! Keep learning and growing!"
    },
    valentine: {
      name: "Valentine's Day",
      icon: "❤️",
      message: "Happy Valentine's Day! Share the love of learning!"
    },
    easter: {
      name: "Easter",
      icon: "🐰",
      message: "Happy Easter! Enjoy a lovely learning day!"
    },
    summer: {
      name: "Summer",
      icon: "☀️",
      message: "Enjoy the sunshine and keep learning!"
    }
  };

  // =========================================
  // 2. LOAD AND SAVE SETTINGS
  // =========================================

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        return {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved)
        };
      }
    } catch (error) {
      console.warn("Could not load festive settings:", error);
    }

    return { ...DEFAULT_SETTINGS };
  }

  let settings = loadSettings();
  let previewTheme = null;

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn("Could not save festive settings:", error);
    }
  }

  // =========================================
  // 3. AUTOMATIC THEME DATES
  // =========================================

  function getEasterDate(year) {
    // Calculate Easter Sunday using the Gregorian calendar.
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  }

  function isBetween(date, start, end) {
    return date >= start && date <= end;
  }

  function getAutomaticTheme() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Tết: uses the editable date list above.
    for (const period of TET_DATES) {
      const start = new Date(period.start + "T00:00:00");
      const end = new Date(period.end + "T23:59:59");

      if (isBetween(today, start, end)) {
        return "tet";
      }
    }

    // Valentine's Day: February 1–14.
    if (month === 2 && day <= 14) {
      return "valentine";
    }

    // Easter: one week before through one week after Easter Sunday.
    const easter = getEasterDate(year);
    const easterStart = new Date(easter);
    const easterEnd = new Date(easter);

    easterStart.setDate(easter.getDate() - 7);
    easterEnd.setDate(easter.getDate() + 7);

    if (isBetween(today, easterStart, easterEnd)) {
      return "easter";
    }

    // Summer: June 1 – August 31.
    if (month >= 6 && month <= 8) {
      return "summer";
    }

    // Halloween: October 1–31.
    if (month === 10) {
      return "halloween";
    }

    // Christmas: December 1–26.
    if (month === 12 && day <= 26) {
      return "christmas";
    }

    // New Year: December 27 – January 5.
    if (
      (month === 12 && day >= 27) ||
      (month === 1 && day <= 5)
    ) {
      return "newyear";
    }

    return "none";
  }

  // =========================================
  // 4. CREATE THE FESTIVE INTERFACE
  // =========================================

  function createFestiveInterface() {
    const topbar = document.querySelector(".topbar");
    const main = document.querySelector("main");

    if (!topbar || !main) {
      console.warn(
        "Festive system: could not find the topbar or main area."
      );
      return false;
    }

    // Add the festive control button.
    const button = document.createElement("button");
    button.type = "button";
    button.className = "festive-control";
    button.id = "festive-control";
    button.textContent = "🎄 Festive Settings";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "festive-panel");

    topbar.appendChild(button);

    // Create the settings panel.
    const panel = document.createElement("div");
    panel.className = "festive-panel";
    panel.id = "festive-panel";

    panel.innerHTML = `
      <div class="festive-panel-header">
        <strong>🎉 Festive Decorations</strong>
        <button
          type="button"
          id="festive-close"
          aria-label="Close festive settings"
        >✕</button>
      </div>

      <div class="festive-row">
        <label for="festive-enabled">
          Enable decorations
        </label>
        <input
          type="checkbox"
          id="festive-enabled"
        >
      </div>

      <div class="festive-row">
        <label for="festive-mode">
          Theme mode
        </label>
        <select id="festive-mode">
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      <div class="festive-row">
        <label for="festive-theme">
          Choose a theme
        </label>
        <select id="festive-theme">
          <option value="none">No theme</option>
          <option value="christmas">Christmas 🎄</option>
          <option value="halloween">Halloween 🎃</option>
          <option value="tet">Lunar New Year 🧧</option>
          <option value="newyear">New Year 🎉</option>
          <option value="valentine">Valentine's Day ❤️</option>
          <option value="easter">Easter 🐰</option>
          <option value="summer">Summer ☀️</option>
        </select>
      </div>

      <div class="festive-row">
        <label for="festive-intensity">
          Animation intensity
        </label>
        <select id="festive-intensity">
          <option value="subtle">Subtle</option>
          <option value="balanced">Balanced</option>
          <option value="full">Full</option>
        </select>
      </div>

      <div class="festive-row festive-preview-row">
        <button type="button" id="festive-preview">
          Preview theme
        </button>
        <button type="button" id="festive-stop-preview">
          Stop preview
        </button>
      </div>

      <p id="festive-status" aria-live="polite">
        Festive settings are ready.
      </p>
    `;

    document.body.appendChild(panel);

    // Create the festive banner.
    const banner = document.createElement("div");
    banner.className = "festive-banner";
    banner.id = "festive-banner";
    banner.hidden = true;

    banner.innerHTML = `
      <div class="festive-banner-content">
        <span
          class="festive-banner-icon"
          id="festive-banner-icon"
        ></span>
        <span id="festive-banner-message"></span>
      </div>
    `;

    // Put the banner directly below the topbar.
    topbar.insertAdjacentElement("afterend", banner);

    return true;
  }

  // =========================================
   // =========================================
// CHRISTMAS DECORATIONS
// =========================================

function createFestiveEffects(theme) {
  // Remove decorations from the previous theme.
  const oldLayer = document.getElementById("festive-effects");

  if (oldLayer) {
    oldLayer.remove();
  }

  // Do not create decorations when disabled or no theme is active.
  if (!settings.enabled || theme === "none") {
    return;
  }

  const layer = document.createElement("div");
  layer.id = "festive-effects";
  layer.className = "festive-effects";
  layer.setAttribute("aria-hidden", "true");

  // Christmas decorations.
  if (theme === "christmas") {

    // Create the Christmas light string.
    const lights = document.createElement("div");
    lights.className = "festive-lights";

    for (let i = 0; i < 18; i++) {
      const bulb = document.createElement("span");
      bulb.className = "festive-bulb";
      lights.appendChild(bulb);
    }

    layer.appendChild(lights);

    // Adjust the number of snowflakes according to intensity.
    const snowCounts = {
      subtle: 12,
      balanced: 22,
      full: 34
    };

    const snowCount = snowCounts[settings.intensity] || 22;

    // Create falling snowflakes.
    for (let i = 0; i < snowCount; i++) {
      const snow = document.createElement("span");

      snow.className = "festive-snowflake";
      snow.textContent = "❄";

      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 10 + Math.random() * 12;
      const size = 10 + Math.random() * 12;
      const drift = -40 + Math.random() * 80;

      snow.style.left = left + "%";
      snow.style.fontSize = size + "px";
      snow.style.setProperty("--snow-delay", delay + "s");
      snow.style.setProperty("--snow-duration", duration + "s");
      snow.style.setProperty("--snow-drift", drift + "px");

      layer.appendChild(snow);
    }
  }

    // Only add the layer if it contains decorations.
  if (layer.children.length > 0) {
    document.body.appendChild(layer);
  }
}
  // 5. APPLY THEME AND ANIMATION INTENSITY
  // =========================================

  function applyIntensity(intensity) {
    document.body.dataset.festiveIntensity = intensity;

    let style = document.getElementById(
      "festive-intensity-style"
    );

    if (!style) {
      style = document.createElement("style");
      style.id = "festive-intensity-style";
      document.head.appendChild(style);
    }

    let opacity = "0.45";
    let duration = "5s";

    if (intensity === "subtle") {
      opacity = "0.20";
      duration = "8s";
    } else if (intensity === "full") {
      opacity = "0.75";
      duration = "3s";
    }

    style.textContent = `
      body[data-festive-intensity="${intensity}"]
      .festive-sparkle {
        opacity: ${opacity};
        animation-duration: ${duration};
      }
    `;
  }

  function applyTheme(theme) {
    const banner = document.getElementById("festive-banner");
    const icon = document.getElementById("festive-banner-icon");
    const message = document.getElementById("festive-banner-message");

    const active =
      settings.enabled &&
      theme !== "none" &&
      THEME_INFO[theme];

    document.body.classList.toggle(
      "festive-active",
      Boolean(active)
    );

    if (active) {
      document.body.dataset.festiveTheme = theme;

      banner.hidden = false;
      icon.textContent = THEME_INFO[theme].icon;
      message.textContent = THEME_INFO[theme].message;
    } else {
      delete document.body.dataset.festiveTheme;
      banner.hidden = true;
    }

        applyIntensity(settings.intensity);

    // Create or remove festive decorations.
    createFestiveEffects(active ? theme : "none");
  }
  // =========================================
  // 6. UPDATE THE ACTIVE THEME
  // =========================================

  function updateFestiveDisplay() {
    let activeTheme = "none";

    if (settings.enabled) {
      if (previewTheme !== null) {
        activeTheme = previewTheme;
      } else if (settings.mode === "automatic") {
        activeTheme = getAutomaticTheme();
      } else {
        activeTheme = settings.theme;
      }
    }

    applyTheme(activeTheme);

    updateStatus(activeTheme);
  }

  function updateStatus(theme) {
    const status = document.getElementById("festive-status");

    if (!status) return;

    if (!settings.enabled) {
      status.textContent = "Decorations are currently disabled.";
    } else if (previewTheme !== null) {
      status.textContent =
        "Previewing: " +
        (THEME_INFO[theme]?.name || "No theme");
    } else if (settings.mode === "automatic") {
      status.textContent =
        "Automatic mode: " +
        (THEME_INFO[theme]?.name || "No seasonal theme today");
    } else {
      status.textContent =
        "Manual mode: " +
        (THEME_INFO[theme]?.name || "No theme");
    }
  }

  // =========================================
  // 7. CONNECT SETTINGS CONTROLS
  // =========================================

  function connectControls() {
    const enabled = document.getElementById("festive-enabled");
    const mode = document.getElementById("festive-mode");
    const theme = document.getElementById("festive-theme");
    const intensity = document.getElementById("festive-intensity");

    const panel = document.getElementById("festive-panel");
    const button = document.getElementById("festive-control");

    enabled.checked = settings.enabled;
    mode.value = settings.mode;
    theme.value = settings.theme;
    intensity.value = settings.intensity;

    // Open and close settings panel.
    button.addEventListener("click", function () {
      panel.classList.toggle("open");

      button.setAttribute(
        "aria-expanded",
        panel.classList.contains("open") ? "true" : "false"
      );
    });

    document.getElementById("festive-close")
      .addEventListener("click", closePanel);

    function closePanel() {
      panel.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }

    // Enable or disable decorations.
    enabled.addEventListener("change", function () {
      settings.enabled = enabled.checked;
      previewTheme = null;
      saveSettings();
      updateFestiveDisplay();
    });

    // Automatic or manual mode.
    mode.addEventListener("change", function () {
      settings.mode = mode.value;
      previewTheme = null;
      saveSettings();
      updateFestiveDisplay();
    });

    // Select a theme.
    theme.addEventListener("change", function () {
      settings.theme = theme.value;
      previewTheme = null;

      if (settings.mode === "manual") {
        settings.enabled = true;
        enabled.checked = true;
      }

      saveSettings();
      updateFestiveDisplay();
    });

    // Select animation intensity.
    intensity.addEventListener("change", function () {
      settings.intensity = intensity.value;
      saveSettings();
      updateFestiveDisplay();
    });

    // Preview the selected theme without changing the saved theme.
    document.getElementById("festive-preview")
      .addEventListener("click", function () {
        settings.enabled = true;
        enabled.checked = true;

        previewTheme = theme.value;

        updateFestiveDisplay();
      });

    // Stop preview and return to the saved settings.
    document.getElementById("festive-stop-preview")
      .addEventListener("click", function () {
        previewTheme = null;
        updateFestiveDisplay();
      });
  }

  // =========================================
  // 8. START THE FESTIVE SYSTEM
  // =========================================

  function startFestiveSystem() {
    const created = createFestiveInterface();

    if (!created) return;

    connectControls();
    updateFestiveDisplay();

    // Recheck the automatic theme periodically.
    // This allows the theme to update if the page stays open.
    setInterval(function () {
      if (
        settings.enabled &&
        settings.mode === "automatic" &&
        previewTheme === null
      ) {
        updateFestiveDisplay();
      }
    }, 60 * 60 * 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startFestiveSystem
    );
  } else {
    startFestiveSystem();
  }

})();
