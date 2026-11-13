
/* =========================================
   SITECELA - ADMINISTRATOR CONTROL PANEL
   STAGE 2: DASHBOARD HOMEPAGE
   ========================================= */

(function () {
  "use strict";

  // =========================================
  // 1. SUPABASE CONNECTION
  // =========================================

  const SUPABASE_URL =
    "https://eoxotjmkjgqaparyqpld.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TVHAtJLEfdpRtnyXPzd42g_-S7PgB75";

  if (!window.supabase) {
    console.error("Supabase library could not be loaded.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  // =========================================
  // 2. LOGIN ELEMENTS
  // =========================================

  const loginForm =
    document.getElementById("admin-login-form");

  const emailInput =
    document.getElementById("admin-email");

  const passwordInput =
    document.getElementById("admin-password");

  const loginButton =
    document.getElementById("login-button");

  const loginMessage =
    document.getElementById("login-message");

  const backLink =
    document.querySelector(".back-link");

  if (
    !loginForm ||
    !emailInput ||
    !passwordInput ||
    !loginButton ||
    !loginMessage
  ) {
    console.error("Administrator login elements are missing.");
    return;
  }

  // =========================================
  // 3. MESSAGE DISPLAY
  // =========================================

  function showMessage(message, type) {
    loginMessage.textContent = message;

    loginMessage.style.color =
      type === "success" ? "#15803d" : "#dc2626";
  }

  // =========================================
  // 4. ADMINISTRATOR VERIFICATION
  // =========================================

  async function verifyAdministrator(user) {
    const { data, error } = await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Administrator verification:", error);

      throw new Error(
        "Could not verify administrator permissions."
      );
    }

    if (!data) {
      throw new Error(
        "Access denied. This account is not an administrator."
      );
    }

    return true;
  }

  // =========================================
  // 5. DASHBOARD MENU
  // =========================================

  const dashboardSections = [
    {
      id: "overview",
      icon: "🏠",
      title: "Overview",
      description: "Administrator homepage"
    },
    {
      id: "listening",
      icon: "🎧",
      title: "Listening",
      description: "Manage listening lessons"
    },
    {
      id: "shadowing",
      icon: "🎤",
      title: "Shadowing",
      description: "Manage shadowing lessons"
    },
    {
      id: "reading",
      icon: "📖",
      title: "Reading",
      description: "Manage reading materials"
    },
    {
      id: "grammar",
      icon: "📝",
      title: "Grammar",
      description: "Manage grammar lessons"
    },
    {
      id: "tests",
      icon: "✅",
      title: "Tests",
      description: "Manage assessed practice"
    },
    {
      id: "administrators",
      icon: "🛡️",
      title: "Administrators",
      description: "Manage administrator access"
    },
    {
      id: "settings",
      icon: "⚙️",
      title: "Settings",
      description: "Website administration"
    }
  ];

  // =========================================
  // 6. DASHBOARD DISPLAY
  // =========================================

  function showDashboard(user) {
    loginForm.hidden = true;

    if (backLink) {
      backLink.hidden = true;
    }

    const loginCard = document.querySelector(
      ".admin-login-card"
    );

    if (!loginCard) {
      console.error("Administrator login card is missing.");
      return;
    }

    const oldDashboard = document.getElementById(
      "admin-dashboard-panel"
    );

    if (oldDashboard) {
      oldDashboard.remove();
    }

    const dashboard = document.createElement("section");
    dashboard.id = "admin-dashboard-panel";
    dashboard.className = "admin-dashboard";

    dashboard.innerHTML = `
      <header class="dashboard-header">
        <div>
          <div class="dashboard-brand">
            📚 SitecELA
          </div>
          <p class="dashboard-label">
            ADMINISTRATOR CONTROL PANEL
          </p>
        </div>

        <button
          type="button"
          class="dashboard-logout"
          id="dashboard-logout"
        >
          Sign Out
        </button>
      </header>

      <div class="dashboard-welcome">
        <p class="dashboard-eyebrow">
          ADMINISTRATOR AREA
        </p>

        <h2>Welcome to your dashboard</h2>

        <p class="dashboard-user"></p>

        <div class="dashboard-status">
          ● Administrator verified successfully
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-section-heading">
          <h3>Management Centre</h3>
          <p>Select a section to continue.</p>
        </div>

        <div class="dashboard-grid"></div>

        <section
          class="dashboard-workspace"
          id="dashboard-workspace"
          aria-live="polite"
        >
          <h3>Welcome to SitecELA Administration</h3>
          <p>
            Choose a management section above.
            Its management tools will be added in the
            following development stages.
          </p>
        </section>
      </div>

      <footer class="dashboard-footer">
        SitecELA English Learning Hub
      </footer>
    `;

    loginCard.appendChild(dashboard);

    dashboard.querySelector(".dashboard-user").textContent =
      "Signed in as: " + (user.email || "Administrator");

    const grid = dashboard.querySelector(".dashboard-grid");

    dashboardSections.forEach(function (section) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "dashboard-card";
      button.dataset.section = section.id;

      const icon = document.createElement("span");
      icon.className = "dashboard-card-icon";
      icon.textContent = section.icon;

      const title = document.createElement("strong");
      title.textContent = section.title;

      const description = document.createElement("span");
      description.textContent = section.description;

      button.appendChild(icon);
      button.appendChild(title);
      button.appendChild(description);

      button.addEventListener("click", function () {
        openDashboardSection(section);
      });

      grid.appendChild(button);
    });

    document.getElementById(
      "dashboard-logout"
    ).addEventListener("click", handleLogout);

    loginCard.classList.add("admin-card-wide");
  }

  // =========================================
  // 7. DASHBOARD NAVIGATION
  // =========================================

  function openDashboardSection(section) {
    const workspace = document.getElementById(
      "dashboard-workspace"
    );

    if (!workspace) return;

    document.querySelectorAll(".dashboard-card").forEach(
      function (card) {
        card.classList.toggle(
          "active",
          card.dataset.section === section.id
        );
      }
    );

    workspace.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = section.icon + " " + section.title;

    const description = document.createElement("p");
    description.textContent = section.description + ".";

    const status = document.createElement("div");
    status.className = "dashboard-coming-soon";
    status.textContent =
      "This section is prepared. Its management functions " +
      "will be connected in a later development stage.";

    workspace.appendChild(heading);
    workspace.appendChild(description);
    workspace.appendChild(status);
  }

  // =========================================
  // 8. LOGIN
  // =========================================

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showMessage(
        "Please enter your email and password.",
        "error"
      );
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    showMessage("Checking your account...", "success");

    let signedInUser = null;

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) {
        throw new Error(
          "Login failed. Please check your email and password."
        );
      }

      if (!data.user) {
        throw new Error(
          "Could not retrieve your account information."
        );
      }

      signedInUser = data.user;

      await verifyAdministrator(signedInUser);

      passwordInput.value = "";

      showDashboard(signedInUser);

    } catch (error) {
      console.error("Administrator login:", error);

      if (signedInUser) {
        await supabaseClient.auth.signOut();
      }

      showMessage(
        error.message || "Something went wrong.",
        "error"
      );

    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Sign In";
    }
  });

  // =========================================
  // 9. LOGOUT
  // =========================================

  async function handleLogout() {
    const logoutButton = document.getElementById(
      "dashboard-logout"
    );

    if (logoutButton) {
      logoutButton.disabled = true;
      logoutButton.textContent = "Signing out...";
    }

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error);

      if (logoutButton) {
        logoutButton.disabled = false;
        logoutButton.textContent = "Sign Out";
      }

      alert("Could not sign out. Please try again.");
      return;
    }

    const dashboard = document.getElementById(
      "admin-dashboard-panel"
    );

    if (dashboard) {
      dashboard.remove();
    }

    loginForm.hidden = false;

    const loginCard = document.querySelector(
      ".admin-login-card"
    );

    if (loginCard) {
      loginCard.classList.remove("admin-card-wide");
    }

    if (backLink) {
      backLink.hidden = false;
    }

    emailInput.value = "";
    passwordInput.value = "";

    showMessage(
      "You have signed out successfully.",
      "success"
    );
  }

  // =========================================
  // 10. RESTORE SESSION
  // =========================================

  async function restoreSession() {
    try {
      const { data, error } =
        await supabaseClient.auth.getSession();

      if (error) throw error;

      if (!data.session || !data.session.user) {
        return;
      }

      await verifyAdministrator(data.session.user);

      showDashboard(data.session.user);

    } catch (error) {
      console.error("Session restoration:", error);

      await supabaseClient.auth.signOut();

      showMessage(
        "Your session could not be verified. Please sign in again.",
        "error"
      );
    }
  }

  // =========================================
  // 11. START
  // =========================================

  restoreSession();

})();
