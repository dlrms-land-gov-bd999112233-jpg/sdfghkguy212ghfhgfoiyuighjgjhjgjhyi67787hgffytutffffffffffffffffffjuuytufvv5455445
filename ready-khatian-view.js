```javascript
(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const fields = [
    "title",
    "division",
    "district",
    "upazila",
    "mouza",
    "jl_no",
    "record_no",
    "source_url",
    "owner_address",
    "share",
    "revenue",
    "dag",
    "agri",
    "non_agri",
    "dag_unit",
    "dag_percent",
    "record_share",
    "area_unit",
    "area_percent",
    "remarks",
    "note1",
    "note2",
    "note3",
    "total_unit",
    "total_percent",
    "print_date",
    "form_no",
    "page_no"
  ];


  /* =====================================================
     CONFIG CHECK
  ===================================================== */

  const valid =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.ADMIN_EMAIL &&
    window.supabase;


  const message =
    document.getElementById("ready-msg");

  const saveButton =
    document.getElementById("save-ready");

  const urlBox =
    document.getElementById("generated-url");

  const urlLink =
    document.getElementById(
      "generated-url-link"
    );


  function showMessage(
    text,
    ok
  ) {

    if (!message) {
      return;
    }

    message.textContent =
      text;

    message.className =
      "ready-msg " +
      (ok ? "ok" : "err");

  }


  function clearMessage() {

    if (!message) {
      return;
    }

    message.textContent = "";
    message.className =
      "ready-msg";

  }


  if (!valid) {

    showMessage(
      "config.js সঠিকভাবে সেট করা হয়নি।",
      false
    );

    if (saveButton) {
      saveButton.disabled = true;
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
     EXISTING SESSION CHECK
  ===================================================== */

  client.auth
    .getSession()
    .then(
      function (result) {

        if (result.error) {

          console.error(
            "Session error:",
            result.error
          );

          showMessage(
            "অ্যাডমিন session পাওয়া যাচ্ছে না। আগে Admin Panel-এ লগইন করুন।",
            false
          );

          if (saveButton) {
            saveButton.disabled = true;
          }

          return;
        }


        const session =
          result.data.session;


        if (!session) {

          showMessage(
            "আগে Admin Panel-এ লগইন করুন।",
            false
          );

          if (saveButton) {
            saveButton.disabled = true;
          }

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

          showMessage(
            "এই অ্যাকাউন্টটি অনুমোদিত Admin নয়।",
            false
          );

          if (saveButton) {
            saveButton.disabled = true;
          }

        }

      }
    )
    .catch(
      function (error) {

        console.error(
          error
        );

        showMessage(
          "Admin session যাচাই করা যাচ্ছে না।",
          false
        );

      }
    );


  /* =====================================================
     SAVE
  ===================================================== */

  async function saveReadyKhatian() {

    clearMessage();


    if (!saveButton) {
      return;
    }


    /* ================================================
       SESSION
    ================================================ */

    const sessionResult =
      await client.auth.getSession();


    if (
      sessionResult.error ||
      !sessionResult.data.session
    ) {

      showMessage(
        "আপনি লগইন অবস্থায় নেই। আগে Admin Panel-এ লগইন করুন।",
        false
      );

      return;
    }


    const email =
      (
        sessionResult.data.session.user.email ||
        ""
      ).toLowerCase();


    if (
      email !==
      String(
        cfg.ADMIN_EMAIL
      ).toLowerCase()
    ) {

      showMessage(
        "এই অ্যাকাউন্টটি অনুমোদিত Admin নয়।",
        false
      );

      return;
    }


    /* ================================================
       COLLECT DATA
    ================================================ */

    const row = {};


    for (
      const field of fields
    ) {

      const input =
        document.getElementById(
          field
        );


      if (!input) {
        continue;
      }


      const value =
        input.value.trim();


      /*
        Title এবং source_url অবশ্যই লাগবে।
        অন্যান্য ক্ষেত্র empty হলে
        database-এ খালি string যাবে।
      */

      if (
        field === "title" &&
        !value
      ) {

        showMessage(
          "সম্পূর্ণ খতিয়ানের শিরোনাম লিখুন।",
          false
        );

        input.focus();

        return;
      }


      if (
        field === "source_url" &&
        !value
      ) {

        showMessage(
          "সাধারণ খতিয়ানের লিংক দিন।",
          false
        );

        input.focus();

        return;
      }


      row[field] =
        value;

    }


    /* ================================================
       URL BASIC VALIDATION
    ================================================ */

    try {

      const url =
        new URL(
          row.source_url
        );


      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {

        throw new Error(
          "Invalid protocol"
        );

      }

    } catch (error) {

      showMessage(
        "সাধারণ খতিয়ানের লিংকটি সঠিক URL নয়।",
        false
      );

      const input =
        document.getElementById(
          "source_url"
        );

      if (input) {
        input.focus();
      }

      return;
    }


    /* ================================================
       BUTTON STATE
    ================================================ */

    saveButton.disabled =
      true;

    saveButton.textContent =
      "তৈরি হচ্ছে...";


    try {

      const result =
        await client
          .from("ready_khatian")
          .insert([
            row
          ])
          .select()
          .single();


      if (result.error) {

        console.error(
          "Insert error:",
          result.error
        );

        showMessage(
          result.error.message,
          false
        );

        return;
      }


      const id =
        result.data.id;


      /* ==============================================
         READY KHATIAN URL
      ============================================== */

      const currentPath =
        window.location.pathname;


      const basePath =
        currentPath.substring(
          0,
          currentPath.lastIndexOf("/") + 1
        );


      const readyUrl =
        window.location.origin +
        basePath +
        "ready-khatian-view.html?id=" +
        encodeURIComponent(
          id
        );


      if (urlLink) {

        urlLink.href =
          readyUrl;

        urlLink.textContent =
          readyUrl;

      }


      if (urlBox) {

        urlBox.style.display =
          "block";

      }


      showMessage(
        "✅ রেডি খতিয়ান সফলভাবে তৈরি হয়েছে। ID: " +
        id,
        true
      );


      /* ==============================================
         RESET FORM
      ============================================== */

      fields.forEach(
        function (field) {

          const input =
            document.getElementById(
              field
            );

          if (input) {
            input.value = "";
          }

        }
      );


    } catch (error) {

      console.error(
        "Unexpected save error:",
        error
      );

      showMessage(
        "রেডি খতিয়ান তৈরি করা যাচ্ছে না।",
        false
      );

    } finally {

      saveButton.disabled =
        false;

      saveButton.textContent =
        "রেডি খতিয়ান তৈরি করুন";

    }

  }


  /* =====================================================
     BUTTON
  ===================================================== */

  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveReadyKhatian
    );

  }


})();
```
