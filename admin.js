(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const loginCard = document.getElementById("login-card");
  const editorCard = document.getElementById("editor-card");
  const loginMsg = document.getElementById("login-msg");
  const readyMsg = document.getElementById("ready-msg");
  const readyHistory = document.getElementById("ready-history");

  const loginButton = document.getElementById("login");
  const logoutButton = document.getElementById("logout");


  function showMessage(element, text, ok) {
    if (!element) return;

    element.textContent = text;
    element.className = "msg " + (ok ? "ok" : "err");
  }


  function clearMessage(element) {
    if (!element) return;

    element.textContent = "";
    element.className = "msg";
  }


  /* =========================================
     CONFIG CHECK
  ========================================= */

  if (
    !cfg.SUPABASE_URL ||
    !cfg.SUPABASE_ANON_KEY
  ) {

    showMessage(
      loginMsg,
      "config.js পাওয়া যাচ্ছে না অথবা Supabase তথ্য অসম্পূর্ণ।",
      false
    );

    return;
  }


  if (!window.supabase) {

    showMessage(
      loginMsg,
      "Supabase JavaScript লোড হয়নি।",
      false
    );

    return;
  }


  /* =========================================
     SUPABASE CLIENT
  ========================================= */

  const client =
    window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );


  /* =========================================
     READY KHATIAN URL
  ========================================= */

  function getReadyUrl(id) {

    const path =
      window.location.pathname;

    const base =
      path.substring(
        0,
        path.lastIndexOf("/") + 1
      );

    return (
      window.location.origin +
      base +
      "ready-khatian-view.html?id=" +
      encodeURIComponent(id)
    );
  }


  /* =========================================
     LOAD READY LIST
  ========================================= */

  async function loadReadyHistory() {

    if (!readyHistory) return;

    clearMessage(readyMsg);


    const result =
      await client
        .from("ready_khatian")
        .select(
          "id,title,owner_address,mouza,source_url,is_deleted"
        )
        .order(
          "id",
          {
            ascending: false
          }
        );


    if (result.error) {

      showMessage(
        readyMsg,
        "ডাটাবেস Error: " +
        result.error.message,
        false
      );

      console.error(
        "READY KHATIAN ERROR:",
        result.error
      );

      return;
    }


    readyHistory.innerHTML = "";


    const rows =
      (result.data || [])
        .filter(function (item) {
          return item.is_deleted !== true;
        });


    if (rows.length === 0) {

      readyHistory.innerHTML =
        '<tr>' +
        '<td colspan="7" class="empty">' +
        'এখনও কোনো রেডি খতিয়ান তৈরি হয়নি' +
        '</td>' +
        '</tr>';

      return;
    }


    rows.forEach(function (record) {

      const tr =
        document.createElement("tr");


      function makeTd(value) {

        const td =
          document.createElement("td");

        td.textContent =
          value ?? "";

        return td;
      }


      tr.appendChild(
        makeTd(record.id)
      );


      tr.appendChild(
        makeTd(record.title)
      );


      tr.appendChild(
        makeTd(record.owner_address)
      );


      tr.appendChild(
        makeTd(record.mouza)
      );


      /* SOURCE URL */

      const sourceTd =
        document.createElement("td");

      sourceTd.className =
        "url-cell";


      if (record.source_url) {

        const sourceLink =
          document.createElement("a");

        sourceLink.href =
          record.source_url;

        sourceLink.target =
          "_blank";

        sourceLink.rel =
          "noopener noreferrer";

        sourceLink.textContent =
          "সাধারণ খতিয়ান";

        sourceTd.appendChild(
          sourceLink
        );

      } else {

        sourceTd.textContent =
          "লিংক নেই";

      }


      tr.appendChild(
        sourceTd
      );


      /* READY URL */

      const readyTd =
        document.createElement("td");

      readyTd.className =
        "url-cell";


      const readyUrl =
        getReadyUrl(
          record.id
        );


      const readyLink =
        document.createElement("a");

      readyLink.href =
        readyUrl;

      readyLink.target =
        "_blank";

      readyLink.rel =
        "noopener noreferrer";

      readyLink.textContent =
        "রেডি খতিয়ান";


      readyTd.appendChild(
        readyLink
      );

      tr.appendChild(
        readyTd
      );


      /* ACTION */

      const actionTd =
        document.createElement("td");

      const wrap =
        document.createElement("div");

      wrap.className =
        "action-wrap";


      const viewButton =
        document.createElement("button");

      viewButton.type =
        "button";

      viewButton.className =
        "small-btn view-btn";

      viewButton.textContent =
        "দেখুন";


      viewButton.onclick =
        function () {

          window.open(
            readyUrl,
            "_blank"
          );

        };


      const deleteButton =
        document.createElement("button");

      deleteButton.type =
        "button";

      deleteButton.className =
        "small-btn delete-btn";

      deleteButton.textContent =
        "ডিলেট";


      deleteButton.onclick =
        async function () {

          const ok =
            window.confirm(
              "এই রেডি খতিয়ানটি ডিলেট করবেন?\n\n" +
              "ডিলেট করলে এর URL আর কাজ করবে না।"
            );


          if (!ok) return;


          deleteButton.disabled =
            true;

          deleteButton.textContent =
            "ডিলেট হচ্ছে...";


          const deleted =
            await client
              .from("ready_khatian")
              .delete()
              .eq(
                "id",
                record.id
              );


          if (deleted.error) {

            window.alert(
              "ডিলেট করা যায়নি:\n\n" +
              deleted.error.message
            );

            deleteButton.disabled =
              false;

            deleteButton.textContent =
              "ডিলেট";

            return;
          }


          await loadReadyHistory();

        };


      wrap.appendChild(
        viewButton
      );

      wrap.appendChild(
        deleteButton
      );

      actionTd.appendChild(
        wrap
      );

      tr.appendChild(
        actionTd
      );


      readyHistory.appendChild(
        tr
      );

    });

  }


  /* =========================================
     LOGIN
  ========================================= */

  async function doLogin() {

    clearMessage(loginMsg);


    const emailInput =
      document.getElementById("email");

    const passwordInput =
      document.getElementById("password");


    const email =
      emailInput
        ? emailInput.value.trim()
        : "";


    const password =
      passwordInput
        ? passwordInput.value
        : "";


    if (!email) {

      showMessage(
        loginMsg,
        "ইমেইল লিখুন।",
        false
      );

      return;
    }


    if (!password) {

      showMessage(
        loginMsg,
        "পাসওয়ার্ড লিখুন।",
        false
      );

      return;
    }


    loginButton.disabled =
      true;

    loginButton.textContent =
      "লগইন হচ্ছে...";


    try {

      console.log(
        "Supabase URL:",
        cfg.SUPABASE_URL
      );

      console.log(
        "Login Email:",
        email
      );


      const result =
        await client.auth.signInWithPassword({
          email: email,
          password: password
        });


      console.log(
        "LOGIN RESULT:",
        result
      );


      if (result.error) {

        showMessage(
          loginMsg,
          "Supabase Error: " +
          result.error.message,
          false
        );

        return;
      }


      if (!result.data.session) {

        showMessage(
          loginMsg,
          "Login হয়েছে, কিন্তু session পাওয়া যায়নি।",
          false
        );

        return;
      }


      const loggedEmail =
        (
          result.data.session.user.email ||
          ""
        ).toLowerCase();


      /*
        Login হওয়ার পর Admin Email যাচাই
      */

      if (
        cfg.ADMIN_EMAIL &&
        loggedEmail !==
        String(
          cfg.ADMIN_EMAIL
        ).toLowerCase()
      ) {

        await client.auth.signOut();

        showMessage(
          loginMsg,
          "Login সফল হয়েছে, কিন্তু এই email Admin হিসেবে অনুমোদিত নয়।",
          false
        );

        return;
      }


      loginCard.hidden =
        true;

      editorCard.hidden =
        false;


      await loadReadyHistory();


    } catch (error) {

      console.error(
        "LOGIN EXCEPTION:",
        error
      );


      showMessage(
        loginMsg,
        "Connection Error: " +
        (
          error.message ||
          "Supabase-এর সাথে সংযোগ করা যাচ্ছে না।"
        ),
        false
      );


    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        "লগইন";

    }

  }


  /* =========================================
     LOGOUT
  ========================================= */

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async function () {

        await client.auth.signOut();

        window.location.reload();

      }
    );

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


  /* =========================================
     EXISTING SESSION
  ========================================= */

  client.auth
    .getSession()
    .then(
      async function (result) {

        if (result.error) {

          console.error(
            "SESSION ERROR:",
            result.error
          );

          return;
        }


        const session =
          result.data.session;


        if (!session) return;


        const loggedEmail =
          (
            session.user.email ||
            ""
          ).toLowerCase();


        if (
          cfg.ADMIN_EMAIL &&
          loggedEmail !==
          String(
            cfg.ADMIN_EMAIL
          ).toLowerCase()
        ) {

          await client.auth.signOut();

          return;
        }


        loginCard.hidden =
          true;

        editorCard.hidden =
          false;


        await loadReadyHistory();

      }
    );

})();
