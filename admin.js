(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const loginCard =
    document.getElementById("login-card");

  const loginMsg =
    document.getElementById("login-msg");

  const loginButton =
    document.getElementById("login");


  function showMessage(text) {

    if (!loginMsg) {
      return;
    }

    loginMsg.textContent = text;
    loginMsg.className = "msg err";
  }


  /* =========================================
     CONFIG
  ========================================= */

  if (
    !cfg.SUPABASE_URL ||
    !cfg.SUPABASE_ANON_KEY
  ) {

    showMessage(
      "config.js সঠিকভাবে সেট করা হয়নি।"
    );

    return;
  }


  if (!window.supabase) {

    showMessage(
      "Supabase library লোড হয়নি।"
    );

    return;
  }


  /* =========================================
     SUPABASE
  ========================================= */

  const client =
    window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );


  /* =========================================
     LOGIN
  ========================================= */

  async function doLogin() {

    if (!loginButton) {
      return;
    }

    const emailInput =
      document.getElementById("email");

    const passwordInput =
      document.getElementById("password");


    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    if (!email) {

      showMessage(
        "ইমেইল লিখুন।"
      );

      return;
    }


    if (!password) {

      showMessage(
        "পাসওয়ার্ড লিখুন।"
      );

      return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
      "লগইন হচ্ছে...";


    try {

      const result =
        await client.auth.signInWithPassword({
          email: email,
          password: password
        });


      if (result.error) {

        showMessage(
          result.error.message
        );

        return;
      }


      if (!result.data.session) {

        showMessage(
          "Login session পাওয়া যায়নি।"
        );

        return;
      }


      const loggedEmail =
        (
          result.data.session.user.email ||
          ""
        ).toLowerCase();


      const adminEmail =
        String(
          cfg.ADMIN_EMAIL || ""
        ).toLowerCase();


      if (
        adminEmail &&
        loggedEmail !== adminEmail
      ) {

        await client.auth.signOut();

        showMessage(
          "এই Email Admin হিসেবে অনুমোদিত নয়।"
        );

        return;
      }


      /* =====================================
         LOGIN SUCCESS
         সরাসরি READY KHATIAN PAGE
      ====================================== */

      window.location.href =
        "ready-khatian.html";


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      showMessage(
        error.message ||
        "Login করা যাচ্ছে না।"
      );


    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        "লগইন";

    }

  }


  /* =========================================
     LOGIN BUTTON
  ========================================= */

  if (loginButton) {

    loginButton.addEventListener(
      "click",
      doLogin
    );

  }


  /* =========================================
     ENTER KEY
  ========================================= */

  const passwordInput =
    document.getElementById("password");


  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          doLogin();

        }

      }
    );

  }


})();
