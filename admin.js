```javascript
(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const loginCard =
    document.getElementById("login-card");

  const editorCard =
    document.getElementById("editor-card");

  const loginMsg =
    document.getElementById("login-msg");

  const readyMsg =
    document.getElementById("ready-msg");

  const readyHistory =
    document.getElementById("ready-history");


  /* =====================================================
     CONFIG CHECK
  ===================================================== */

  const valid =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.ADMIN_EMAIL &&
    window.supabase;

  if (!valid) {

    if (loginMsg) {

      loginMsg.className =
        "msg err";

      loginMsg.textContent =
        "config.js সঠিকভাবে সেট করা হয়নি।";

    }

    return;
  }


  /* =====================================================
     SUPABASE
  ===================================================== */

  const client =
    window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );


  /* =====================================================
     MESSAGE
  ===================================================== */

  function showMessage(
    element,
    text,
    ok
  ) {

    if (!element) {
      return;
    }

    element.textContent =
      text;

    element.className =
      "msg " +
      (ok ? "ok" : "err");

  }


  function clearMessage(element) {

    if (!element) {
      return;
    }

    element.textContent = "";
    element.className = "msg";

  }


  /* =====================================================
     READY KHATIAN URL
  ===================================================== */

  function getReadyUrl(id) {

    const currentPath =
      window.location.pathname;

    const basePath =
      currentPath
        .substring(
          0,
          currentPath.lastIndexOf("/") + 1
        );

    return (
      window.location.origin +
      basePath +
      "ready-khatian-view.html?id=" +
      encodeURIComponent(id)
    );

  }


  /* =====================================================
     LOAD READY KHATIAN LIST
  ===================================================== */

  async function loadReadyHistory() {

    if (!readyHistory) {
      return;
    }

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
        result.error.message,
        false
      );

      return;
    }


    readyHistory.innerHTML = "";


    const rows =
      (result.data || [])
        .filter(function (record) {

          return (
            record.is_deleted !== true
          );

        });


    if (!rows.length) {

      const tr =
        document.createElement("tr");

      tr.innerHTML =
        '<td colspan="6" class="empty">' +
        'এখনও কোনো রেডি খতিয়ান তৈরি হয়নি' +
        '</td>';

      readyHistory.appendChild(tr);

      return;
    }


    rows.forEach(
      function (record) {

        const tr =
          document.createElement("tr");


        /* ID */

        const idTd =
          document.createElement("td");

        idTd.textContent =
          record.id ?? "";

        tr.appendChild(idTd);


        /* TITLE */

        const titleTd =
          document.createElement("td");

        titleTd.textContent =
          record.title ?? "";

        tr.appendChild(titleTd);


        /* OWNER */

        const ownerTd =
          document.createElement("td");

        ownerTd.textContent =
          record.owner_address ?? "";

        tr.appendChild(ownerTd);


        /* MOUZA */

        const mouzaTd =
          document.createElement("td");

        mouzaTd.textContent =
          record.mouza ?? "";

        tr.appendChild(mouzaTd);


        /* QR / SOURCE URL */

        const urlTd =
          document.createElement("td");

        urlTd.className =
          "url-cell";


        const sourceLink =
          document.createElement("a");

        sourceLink.href =
          record.source_url || "#";

        sourceLink.target =
          "_blank";

        sourceLink.rel =
          "noopener noreferrer";

        sourceLink.textContent =
          record.source_url
            ? "সাধারণ খতিয়ানের লিংক"
            : "লিংক নেই";


        if (!record.source_url) {

          sourceLink.removeAttribute(
            "target"
          );

        }


        urlTd.appendChild(
          sourceLink
        );

        tr.appendChild(urlTd);


        /* ACTION */

        const actionTd =
          document.createElement("td");


        const actionWrap =
          document.createElement("div");

        actionWrap.className =
          "action-wrap";


        /* VIEW */

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

            const url =
              getReadyUrl(
                record.id
              );

            window.open(
              url,
              "_blank",
              "noopener"
            );

          };


        /* DELETE */

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

            const confirmed =
              window.confirm(
                "এই রেডি খতিয়ানটি ডিলেট করবেন?\n\n" +
                "ডিলেট করার পর এই রেডি খতিয়ানের URL আর কাজ করবে না।"
              );


            if (!confirmed) {
              return;
            }


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


            showMessage(
              readyMsg,
              "✅ রেডি খতিয়ান সফলভাবে ডিলেট হয়েছে।",
              true
            );


            await loadReadyHistory();

          };


        actionWrap.appendChild(
          viewButton
        );

        actionWrap.appendChild(
          deleteButton
        );


        actionTd.appendChild(
          actionWrap
        );

        tr.appendChild(
          actionTd
        );


        readyHistory.appendChild(
          tr
        );

      }
    );

  }


  /* =====================================================
     LOGIN
  ===================================================== */

  async function login() {

    clearMessage(loginMsg);


    const emailInput =
      document.getElementById(
        "email"
      );

    const passwordInput =
      document.getElementById(
        "password"
      );


    const loginButton =
      document.getElementById(
        "login"
      );


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
        "ইমেইল দিন।",
        false
      );

      return;
    }


    if (!password) {

      showMessage(
        loginMsg,
        "পাসওয়ার্ড দিন।",
        false
      );

      return;
    }


    if (
      email.toLowerCase() !==
      String(
        cfg.ADMIN_EMAIL
      ).toLowerCase()
    ) {

      showMessage(
        loginMsg,
        "এই ইমেইলটি অনুমোদিত অ্যাডমিন ইমেইল নয়।",
        false
      );

      return;
    }


    loginButton.disabled =
      true;

    loginButton.textContent =
      "লগইন হচ্ছে...";


    try {

      const result =
        await client.auth
          .signInWithPassword({
            email: email,
            password: password
          });


      if (result.error) {

        showMessage(
          loginMsg,
          result.error.message,
          false
        );

        return;
      }


      const session =
        result.data.session;


      if (!session) {

        showMessage(
          loginMsg,
          "লগইন session পাওয়া যায়নি।",
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
        "Login error:",
        error
      );

      showMessage(
        loginMsg,
        "Supabase-এর সাথে সংযোগ করা যাচ্ছে না।",
        false
      );

    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        "লগইন";

    }

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  const logoutButton =
    document.getElementById(
      "logout"
    );


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async function () {

        await client.auth.signOut();

        window.location.reload();

      }
    );

  }


  /* =====================================================
     LOGIN BUTTON
  ===================================================== */

  const loginButton =
    document.getElementById(
      "login"
    );


  if (loginButton) {

    loginButton.addEventListener(
      "click",
      login
    );

  }


  /* =====================================================
     ENTER KEY
  ===================================================== */

  const passwordInput =
    document.getElementById(
      "password"
    );


  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Enter"
        ) {

          login();

        }

      }
    );

  }


  /* =====================================================
     EXISTING SESSION
  ===================================================== */

  client.auth
    .getSession()
    .then(
      async function (result) {

        if (result.error) {

          console.error(
            "Session error:",
            result.error
          );

          return;
        }


        const session =
          result.data.session;


        if (!session) {
          return;
        }


        const email =
          (
            session.user.email ||
            ""
          ).toLowerCase();


        if (
          email !==
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
    )
    .catch(
      function (error) {

        console.error(
          "Session error:",
          error
        );

      }
    );

})();
```
