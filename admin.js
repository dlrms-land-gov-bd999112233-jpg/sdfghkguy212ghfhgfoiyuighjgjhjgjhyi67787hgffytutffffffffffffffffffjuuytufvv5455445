(function () {

  "use strict";

  const cfg = window.APP_CONFIG || {};

  const valid =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.ADMIN_EMAIL &&
    window.supabase;

  if (!valid) {

    const msg = document.getElementById("login-msg");

    if (msg) {
      msg.className = "msg err";
      msg.textContent =
        "config.js সঠিকভাবে সেট করা হয়নি।";
    }

    return;
  }


  const client =
    window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );


  const loginCard =
    document.getElementById("login-card");

  const editorCard =
    document.getElementById("editor-card");

  const loginMsg =
    document.getElementById("login-msg");

  const saveMsg =
    document.getElementById("save-msg");

  const readyMsg =
    document.getElementById("ready-msg");

  const normalHistory =
    document.getElementById("normal-history");

  const readyHistory =
    document.getElementById("ready-history");


  const normalFields = [
    ["khatian", "খতিয়ান নং"],
    ["owner", "মালিক"],
    ["dag_no", "দাগ নং"],
    ["survey", "সার্ভে"],
    ["mouza", "মৌজা"],
    ["upazila", "উপজেলা"],
    ["district", "জেলা"],
    ["division", "বিভাগ"],
    ["record_date", "তারিখ"]
  ];


  const readyFields = [
    ["title", "সম্পূর্ণ খতিয়ানের শিরোনাম"],
    ["division", "বিভাগ"],
    ["district", "জেলা"],
    ["upazila", "উপজেলা/থানা"],
    ["mouza", "মৌজা"],
    ["jl_no", "জে. এল. নং"],
    ["record_no", "রে. সা. নং"],
    ["owner_address", "মালিক, অকৃষি প্রজা বা ইজারাদারের নাম ও ঠিকানা"],
    ["share", "অংশ"],
    ["revenue", "রাজস্ব"],
    ["dag", "দাগ"],
    ["agri", "কৃষি জমি"],
    ["non_agri", "অকৃষি জমি"],
    ["dag_unit", "দাগের মোট পরিমাণ - একক"],
    ["dag_percent", "দাগের মোট পরিমাণ - শতাংশ"],
    ["record_share", "অত্র খতিয়ানের অংশ"],
    ["area_unit", "অংশানুযায়ী জমির পরিমাণ - একক"],
    ["area_percent", "অংশানুযায়ী জমির পরিমাণ - শতাংশ"],
    ["remarks", "দখল বিষয়ক বা অন্যান্য বিশেষ মন্তব্য"],
    ["note1", "নোট ১"],
    ["note2", "নোট ২"],
    ["note3", "নোট ৩"],
    ["total_unit", "মোট জমি - একক"],
    ["total_percent", "মোট জমি - শতাংশ"],
    ["print_date", "মুদ্রণ/তারিখ"],
    ["form_no", "বাংলাদেশ ফর্ম নং"],
    ["page_no", "পৃষ্ঠা নং"]
  ];


  function showMessage(
    element,
    text,
    ok
  ) {

    if (!element) {
      return;
    }

    element.textContent = text;

    element.className =
      "msg " + (ok ? "ok" : "err");
  }


  function clearMessage(element) {

    if (!element) {
      return;
    }

    element.textContent = "";
    element.className = "msg";

  }


  function makeNormalFields() {

    const container =
      document.getElementById("normal-fields");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    normalFields.forEach(function (item) {

      const key = item[0];
      const label = item[1];

      const wrapper =
        document.createElement("div");

      wrapper.className = "field";

      const labelEl =
        document.createElement("label");

      labelEl.setAttribute(
        "for",
        "normal_" + key
      );

      labelEl.textContent =
        label;

      const input =
        document.createElement("input");

      input.id =
        "normal_" + key;

      input.type = "text";

      input.autocomplete = "off";

      wrapper.appendChild(labelEl);
      wrapper.appendChild(input);

      container.appendChild(wrapper);

    });

  }


  function getRecordUrl(id) {

    const base =
      window.location.origin +
      window.location.pathname
        .replace(
          /admin\.html$/,
          ""
        );

    return (
      base +
      "index.html?id=" +
      encodeURIComponent(id)
    );

  }


  function getReadyUrl(id) {

    const base =
      window.location.origin +
      window.location.pathname
        .replace(
          /admin\.html$/,
          ""
        );

    return (
      base +
      "ready-khatian-view.html?id=" +
      encodeURIComponent(id)
    );

  }


  async function loadNormalHistory() {

    if (!normalHistory) {
      return;
    }

    const result =
      await client
        .from("land_records")
        .select(
          "id,khatian,owner,dag_no,mouza"
        )
        .order(
          "id",
          {
            ascending:false
          }
        );

    if (result.error) {

      showMessage(
        saveMsg,
        result.error.message,
        false
      );

      return;
    }

    normalHistory.innerHTML = "";

    const rows =
      result.data || [];

    if (rows.length === 0) {

      const tr =
        document.createElement("tr");

      tr.innerHTML =
        '<td colspan="7" class="empty">কোনো সাধারণ খতিয়ান নেই</td>';

      normalHistory.appendChild(tr);

      return;
    }


    rows.forEach(function (record) {

      const tr =
        document.createElement("tr");


      function td(value) {

        const cell =
          document.createElement("td");

        cell.textContent =
          value ?? "";

        return cell;

      }


      tr.appendChild(
        td(record.id)
      );

      tr.appendChild(
        td(record.khatian)
      );

      tr.appendChild(
        td(record.owner)
      );

      tr.appendChild(
        td(record.dag_no)
      );

      tr.appendChild(
        td(record.mouza)
      );


      const urlTd =
        document.createElement("td");

      urlTd.className =
        "url-cell";


      const link =
        document.createElement("a");

      const url =
        getRecordUrl(record.id);

      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "দেখুন";

      urlTd.appendChild(link);

      tr.appendChild(urlTd);


      const actionTd =
        document.createElement("td");

      const wrap =
        document.createElement("div");

      wrap.className =
        "action-wrap";


      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className =
        "small-btn delete-btn";
      deleteButton.textContent =
        "ডিলেট";


      deleteButton.onclick =
        async function () {

          const ok =
            confirm(
              "এই সাধারণ খতিয়ানটি ডিলেট করবেন?"
            );

          if (!ok) {
            return;
          }


          deleteButton.disabled =
            true;

          deleteButton.textContent =
            "ডিলেট হচ্ছে...";


          const deleted =
            await client
              .from("land_records")
              .delete()
              .eq("id", record.id);


          if (deleted.error) {

            alert(
              "ডিলেট করা যায়নি:\n\n" +
              deleted.error.message
            );

            deleteButton.disabled =
              false;

            deleteButton.textContent =
              "ডিলেট";

            return;
          }


          await loadNormalHistory();

        };


      wrap.appendChild(deleteButton);

      actionTd.appendChild(wrap);

      tr.appendChild(actionTd);

      normalHistory.appendChild(tr);

    });

  }


  async function loadReadyHistory() {

    if (!readyHistory) {
      return;
    }

    const result =
      await client
        .from("ready_khatian")
        .select(
          "id,title,owner_address,mouza,is_deleted"
        )
        .order(
          "id",
          {
            ascending:false
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
          return record.is_deleted !== true;
        });


    if (rows.length === 0) {

      const tr =
        document.createElement("tr");

      tr.innerHTML =
        '<td colspan="6" class="empty">কোনো রেডি খতিয়ান নেই</td>';

      readyHistory.appendChild(tr);

      return;
    }


    rows.forEach(function (record) {

      const tr =
        document.createElement("tr");


      function td(value) {

        const cell =
          document.createElement("td");

        cell.textContent =
          value ?? "";

        return cell;

      }


      tr.appendChild(
        td(record.id)
      );


      tr.appendChild(
        td(record.title)
      );


      tr.appendChild(
        td(record.owner_address)
      );


      tr.appendChild(
        td(record.mouza)
      );


      const urlTd =
        document.createElement("td");

      urlTd.className =
        "url-cell";


      const url =
        getReadyUrl(
          record.id
        );


      const link =
        document.createElement("a");

      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "দেখুন";

      urlTd.appendChild(link);

      tr.appendChild(urlTd);


      const actionTd =
        document.createElement("td");


      const wrap =
        document.createElement("div");

      wrap.className =
        "action-wrap";


      const viewButton =
        document.createElement("button");

      viewButton.type = "button";
      viewButton.className =
        "small-btn view-btn";
      viewButton.textContent =
        "দেখুন";


      viewButton.onclick =
        function () {

          window.open(
            url,
            "_blank",
            "noopener"
          );

        };


      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className =
        "small-btn delete-btn";
      deleteButton.textContent =
        "ডিলেট";


      deleteButton.onclick =
        async function () {

          const ok =
            confirm(
              "এই রেডি খতিয়ানটি ডিলেট করবেন?\n\n" +
              "ডিলেট করার পর এর URL আর কাজ করবে না।"
            );

          if (!ok) {
            return;
          }


          deleteButton.disabled =
            true;

          deleteButton.textContent =
            "ডিলেট হচ্ছে...";


          /*
            We use DELETE, so the public URL
            becomes unavailable.
          */

          const deleted =
            await client
              .from("ready_khatian")
              .delete()
              .eq("id", record.id);


          if (deleted.error) {

            alert(
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


      wrap.appendChild(viewButton);
      wrap.appendChild(deleteButton);

      actionTd.appendChild(wrap);

      tr.appendChild(actionTd);

      readyHistory.appendChild(tr);

    });

  }


  async function loadAll() {

    await loadNormalHistory();
    await loadReadyHistory();

  }


  async function enter(session) {

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

      showMessage(
        loginMsg,
        "এই ইমেইলটি অ্যাডমিন হিসেবে অনুমোদিত নয়।",
        false
      );

      return;
    }


    loginCard.style.display =
      "none";

    editorCard.style.display =
      "block";


    await loadAll();

  }


  async function handleLogin() {

    clearMessage(loginMsg);


    const email =
      document
        .getElementById("email")
        .value
        .trim();


    const password =
      document
        .getElementById("password")
        .value;


    if (!email || !password) {

      showMessage(
        loginMsg,
        "ইমেইল এবং পাসওয়ার্ড দিন।",
        false
      );

      return;
    }


    const button =
      document.getElementById("login");


    button.disabled = true;
    button.textContent =
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


      await enter(
        result.data.session
      );


    } catch (error) {

      console.error(error);

      showMessage(
        loginMsg,
        "Supabase-এর সাথে সংযোগ করা যাচ্ছে না।",
        false
      );

    } finally {

      button.disabled = false;
      button.textContent =
        "লগইন";

    }

  }


  async function saveNormal() {

    clearMessage(saveMsg);


    const row = {};


    for (
      const item of normalFields
    ) {

      const key = item[0];

      const input =
        document.getElementById(
          "normal_" + key
        );


      if (!input) {
        continue;
      }


      const value =
        input.value.trim();


      if (!value) {

        showMessage(
          saveMsg,
          "সবগুলো ঘর পূরণ করুন।",
          false
        );

        input.focus();

        return;
      }


      row[key] = value;

    }


    const button =
      document.getElementById(
        "save-normal"
      );


    button.disabled = true;

    button.textContent =
      "সংযুক্ত হচ্ছে...";


    try {

      const result =
        await client
          .from("land_records")
          .insert([row])
          .select()
          .single();


      if (result.error) {

        showMessage(
          saveMsg,
          result.error.message,
          false
        );

        return;
      }


      showMessage(
        saveMsg,
        "✅ সাধারণ খতিয়ান সফলভাবে সংযুক্ত হয়েছে। ID: " +
        result.data.id,
        true
      );


      normalFields.forEach(
        function (item) {

          const input =
            document.getElementById(
              "normal_" + item[0]
            );

          if (input) {
            input.value = "";
          }

        }
      );


      await loadNormalHistory();

    } catch (error) {

      console.error(error);

      showMessage(
        saveMsg,
        "খতিয়ান সংযুক্ত করা যাচ্ছে না।",
        false
      );

    } finally {

      button.disabled = false;

      button.textContent =
        "নতুন সংযুক্ত করুন";

    }

  }


  function setupTabs() {

    const buttons =
      document.querySelectorAll(
        ".tab"
      );


    buttons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          async function () {

            buttons.forEach(
              function (item) {
                item.classList.remove(
                  "active"
                );
              }
            );


            document
              .querySelectorAll(
                ".tab-panel"
              )
              .forEach(
                function (panel) {
                  panel.classList.remove(
                    "active"
                  );
                }
              );


            button.classList.add(
              "active"
            );


            const name =
              button.dataset.tab;


            const panel =
              document.getElementById(
                name + "-tab"
              );


            if (panel) {
              panel.classList.add(
                "active"
              );
            }


            if (name === "normal") {

              await loadNormalHistory();

            }


            if (name === "ready") {

              await loadReadyHistory();

            }

          }
        );

      }
    );

  }


  const loginButton =
    document.getElementById("login");


  if (loginButton) {

    loginButton.addEventListener(
      "click",
      handleLogin
    );

  }


  const passwordInput =
    document.getElementById(
      "password"
    );


  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {
          handleLogin();
        }

      }
    );

  }


  const saveNormalButton =
    document.getElementById(
      "save-normal"
    );


  if (saveNormalButton) {

    saveNormalButton.addEventListener(
      "click",
      saveNormal
    );

  }


  const logoutButton =
    document.getElementById("logout");


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async function () {

        await client.auth.signOut();

        window.location.reload();

      }
    );

  }


  setupTabs();
  makeNormalFields();


  client.auth
    .getSession()
    .then(function (result) {

      if (result.error) {
        console.error(
          result.error
        );
        return;
      }

      enter(
        result.data.session
      );

    })
    .catch(function (error) {

      console.error(error);

    });


})();
