
/* =========================================
   SITECELA
   ADMINISTRATOR AUTHENTICATION
   ========================================= */

(function () {
  "use strict";

  // =========================================
  // 1. SUPABASE CONNECTION
  // =========================================

  // Use the Project API URL, NOT /rest/v1/
  // Keep your existing Publishable Key.
  // NEVER use a Secret or service_role key.

  const SUPABASE_URL =
    "https://eoxotjmkjgqaparyqpld.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TVHAtJLEfdpRtnyXPzd42g_-S7PgB75";


  // =========================================
  // 2. INITIALIZE SUPABASE
  // =========================================

  if (!window.supabase) {
    console.error("Supabase library could not be loaded.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


  // =========================================
  // 3. PAGE ELEMENTS
  // =========================================

  const loginForm = document.getElementById(
    "admin-login-form"
  );

  const emailInput = document.getElementById(
    "admin-email"
  );

  const passwordInput = document.getElementById(
    "admin-password"
  );

  const loginButton = document.getElementById(
    "login-button"
  );

  const loginMessage = document.getElementById(
    "login-message"
  );

  const backLink = document.querySelector(".back-link");

  if (
    !loginForm ||
    !emailInput ||
    !passwordInput ||
    !loginButton ||
    !loginMessage
  ) {
    console.error(
      "Administrator login elements are missing."
    );
    return;
  }


  // =========================================
  // 4. DISPLAY MESSAGES
  // =========================================

  function showMessage(message, type) {
    loginMessage.textContent = message;

    loginMessage.style.color =
      type === "success" ? "#15803d" : "#dc2626";
  }


  // =========================================
  // 5. VERIFY ADMINISTRATOR PERMISSION
  // =========================================

  async function verifyAdministrator(user) {

    const { data, error } = await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Administrator verification error:",
        error
      );

      throw new Error(
        "Could not verify administrator permissions. Please try again."
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
  // 6. CREATE ADMINISTRATOR DASHBOARD VIEW
  // =========================================

  function showDashboard(user) {

    loginForm.hidden = true;

    if (backLink) {
      backLink.hidden = true;
    }

    // Prevent duplicate dashboard panels.
    const oldDashboard = document.getElementById(
      "admin-dashboard-panel"
    );

    if (oldDashboard) {
      oldDashboard.remove();
    }

    const dashboard = document.createElement("section");

    dashboard.id = "admin-dashboard-panel";

    dashboard.style.cssText = `
      margin-top: 20px;
      padding: 24px;
      border-radius: 12px;
      background: #f1f5f9;
      text-align: center;
    `;

    const heading = document.createElement("h2");
    heading.textContent = "Administrator Dashboard";

    heading.style.color = "#172554";

    const success = document.createElement("p");
    success.textContent =
      "Administrator verified successfully!";

    success.style.color = "#15803d";
    success.style.fontWeight = "bold";

    const email = document.createElement("p");
    email.textContent = "Logged in as: " + user.email;

    email.style.wordBreak = "break-word";

    const information = document.createElement("p");

    information.textContent =
      "Your administrator session is active. " +
      "Management tools will be connected here in the next development step.";

    information.style.lineHeight = "1.6";

    const logoutButton = document.createElement("button");

    logoutButton.type = "button";
    logoutButton.textContent = "Sign Out";

    logoutButton.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-top: 15px;
      border: none;
      border-radius: 8px;
      background: #172554;
      color: white;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    `;

    logoutButton.addEventListener(
      "click",
      handleLogout
    );

    dashboard.appendChild(heading);
    dashboard.appendChild(success);
    dashboard.appendChild(email);
    dashboard.appendChild(information);
    dashboard.appendChild(logoutButton);

    loginForm.insertAdjacentElement(
      "afterend",
      dashboard
    );
  }


  // =========================================
  // 7. HANDLE LOGIN
  // =========================================

  loginForm.addEventListener(
    "submit",
    async function (event) {

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

      showMessage(
        "Checking your account...",
        "success"
      );

      let signedInUser = null;

      try {

        // Authenticate with Supabase.
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

        // Check administrator registration.
        await verifyAdministrator(signedInUser);

        // Open the administrator dashboard view.
        passwordInput.value = "";

        showDashboard(signedInUser);

      } catch (error) {

        console.error(
          "Administrator login:",
          error
        );

        // Do not keep an unverified account signed in.
        if (signedInUser) {
          await supabaseClient.auth.signOut();
        }

        showMessage(
          error.message ||
            "Something went wrong. Please try again.",
          "error"
        );

      } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

      }
    }
  );


  // =========================================
  // 8. HANDLE LOGOUT
  // =========================================

  async function handleLogout() {

    const logoutButton = document.querySelector(
      "#admin-dashboard-panel button"
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

      alert(
        "Could not sign out. Please try again."
      );

      return;
    }

    const dashboard = document.getElementById(
      "admin-dashboard-panel"
    );

    if (dashboard) {
      dashboard.remove();
    }

    loginForm.hidden = false;

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
  // 9. RESTORE EXISTING LOGIN SESSION
  // =========================================

  async function restoreSession() {

    try {

      const { data, error } =
        await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data.session || !data.session.user) {
        return;
      }

      const user = data.session.user;

      await verifyAdministrator(user);

      showDashboard(user);

    } catch (error) {

      console.error(
        "Session restoration error:",
        error
      );

      await supabaseClient.auth.signOut();

      showMessage(
        error.message ||
          "Please sign in again.",
        "error"
      );

    }
  }


  // =========================================
  // 10. START
  // =========================================

  restoreSession();

})();
