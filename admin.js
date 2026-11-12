
/* =========================================
   SITECELA
   ADMINISTRATOR AUTHENTICATION
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

  // Never place a Supabase Secret or service_role
  // key in frontend JavaScript.

  // =========================================
  // 2. INITIALIZE SUPABASE
  // =========================================

  if (!window.supabase) {
    console.error("Supabase library could not be loaded.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  // =========================================
  // 3. PAGE ELEMENTS
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

  function showMessage(message, type = "error") {
    loginMessage.textContent = message;

    loginMessage.style.color =
      type === "success" ? "#15803d" : "#dc2626";
  }

  function setLoading(isLoading) {
    loginButton.disabled = isLoading;

    loginButton.textContent =
      isLoading ? "Signing in..." : "Sign In";
  }

  // =========================================
  // 5. VERIFY ADMINISTRATOR PERMISSION
  // =========================================

  async function verifyAdministrator(user) {
    if (!user || !user.id) {
      throw new Error("Your account could not be verified.");
    }

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
        "Unable to verify administrator permissions. " +
        "Please check your database permissions."
      );
    }

    if (!data) {
      await supabaseClient.auth.signOut();

      throw new Error(
        "Access denied. This account is not registered " +
        "as an administrator."
      );
    }

    return true;
  }

  // =========================================
  // 6. HANDLE LOGIN
  // =========================================

  loginForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      if (loginButton.disabled) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showMessage(
          "Please enter your email and password."
        );
        return;
      }

      setLoading(true);

      showMessage(
        "Checking your account...",
        "success"
      );

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

        // Check administrator permissions.

        await verifyAdministrator(data.user);

        showMessage(
          "Administrator verified successfully!",
          "success"
        );

        passwordInput.value = "";

        // Dashboard navigation will be added
        // when the administrator dashboard is created.

      } catch (error) {
        console.error(
          "Administrator login error:",
          error
        );

        showMessage(
          error.message ||
          "Something went wrong. Please try again."
        );

      } finally {
        setLoading(false);
      }
    }
  );

})();
