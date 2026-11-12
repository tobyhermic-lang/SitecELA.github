
/* =========================================
   SITECELA
   ADMINISTRATOR AUTHENTICATION
   ========================================= */

(function () {
  "use strict";

  // =========================================
  // 1. SUPABASE CONNECTION
  // =========================================

  // Replace these two values with your own.
  // Use the Project API URL and Publishable key.
  // NEVER use the Secret or service_role key here.

  const SUPABASE_URL = "https://eoxotjmkjgqaparyqpld.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TVHAtJLEfdpRtnyXPzd42g_-S7PgB75";

  // =========================================
  // 2. INITIALIZE SUPABASE
  // =========================================

  if (!window.supabase) {
    console.error("Supabase library could not be loaded.");
    return;
  }

  if (
    SUPABASE_URL === "YOUR_PROJECT_API_URL" ||
    SUPABASE_PUBLISHABLE_KEY ===
      "YOUR_SUPABASE_PUBLISHABLE_KEY"
  ) {
    console.error("Please configure your Supabase credentials.");
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
  // 4. DISPLAY MESSAGES
  // =========================================

  function showMessage(message, type) {
    loginMessage.textContent = message;

    if (type === "success") {
      loginMessage.style.color = "#15803d";
    } else {
      loginMessage.style.color = "#dc2626";
    }
  }

  // =========================================
  // 5. CHECK ADMINISTRATOR PERMISSION
  // =========================================

  async function verifyAdministrator(user) {
    const { data, error } = await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Administrator verification error:", error);
      throw new Error(
        "Could not verify administrator permissions. Please try again."
      );
    }

    if (!data) {
      await supabaseClient.auth.signOut();

      throw new Error(
        "Access denied. This account is not an administrator."
      );
    }

    return true;
  }

  // =========================================
  // 6. HANDLE LOGIN
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

    try {
      // Authenticate using Supabase.
      const { data, error } = await supabaseClient.auth
        .signInWithPassword({
          email: email,
          password: password
        });

      if (error) {
        throw new Error(
          "Login failed. Please check your email and password."
        );
      }

      // Verify that the account is registered as administrator.
      await verifyAdministrator(data.user);

      showMessage(
        "Administrator verified successfully! Your login is ready.",
        "success"
      );

      passwordInput.value = "";

      // The administrator dashboard will be connected
      // in the next development step.

    } catch (error) {
      console.error("Administrator login:", error);

      showMessage(
        error.message || "Something went wrong. Please try again.",
        "error"
      );

    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Sign In";
    }
  });

})();
