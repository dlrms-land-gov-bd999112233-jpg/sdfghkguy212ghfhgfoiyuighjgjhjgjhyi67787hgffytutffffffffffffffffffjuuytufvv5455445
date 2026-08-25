(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const client =
    window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );

  const loginButton =
    document.getElementById("login");

  const loginMsg =
    document.getElementById("login-msg");


  function showError(text) {

    if (!loginMsg) return;

    loginMsg.textContent = text;
    loginMsg.className = "msg err";
  }


  async function login() {

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;


    if (!email || !password) {

      showError(
        "ইমেইল এবং পাসওয়ার্ড দিন।"
      );

      return;
    }


    loginButton.disabled = true;
    loginButton.textContent = "লগইন হচ্ছে...";


    try {

      const result =
        await client.auth.signInWithPassword({
          email: email,
          password: password
        });


      if (result.error) {

        showError(
          result.error.message
        );

        return;
      }


      /*
        LOGIN SUCCESS

        এবার একই folder-এর ready-khatian.html খুলবে।
      */

      const target =
        new URL(
          "./ready-khatian.html",
          window.location.href
        ).href;


      console.log(
        "READY KHATIAN URL:",
        target
      );


      window.location.assign(
        target
      );


    } catch (error) {

      console.error(error);

      showError(
        error.message ||
        "Login করা যাচ্ছে না।"
      );

    } finally {

      loginButton.disabled = false;
      loginButton.textContent = "লগইন";

    }

  }


  loginButton.addEventListener(
    "click",
    login
  );


})();
