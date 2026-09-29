/* ============================================================
   MODERN CONVENT SCHOOL
   API CLIENT
   Google Apps Script Web App
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEYS = {
    SESSION: "mcs_session",
    USER: "mcs_user"
  };

  /* ==========================================================
     GET API URL
     ========================================================== */

  function getApiUrl() {
    let url = "";

    try {
      /*
       * Config.js uses:
       *
       * const API_CONFIG = {...}
       *
       * Therefore use API_CONFIG directly.
       */
      if (
        typeof API_CONFIG !== "undefined" &&
        API_CONFIG &&
        typeof API_CONFIG.GOOGLE_APPS_SCRIPT_URL === "string"
      ) {
        url =
          API_CONFIG.GOOGLE_APPS_SCRIPT_URL.trim();
      }
    } catch (error) {
      console.error(
        "Unable to read API_CONFIG:",
        error
      );
    }

    if (!url) {
      throw new Error(
        "Google Apps Script API is not configured."
      );
    }

    /*
     * Don't reject the URL just because its exact
     * structure differs from our expectation.
     */
    if (
      !/^https:\/\/script\.google\.com\//i.test(url)
    ) {
      console.warn(
        "Configured API URL does not look like a standard Google Apps Script URL:",
        url
      );
    }

    return url.replace(/\/+$/, "");
  }

  /* ==========================================================
     SESSION
     ========================================================== */

  function getSessionToken() {
    try {
      return (
        sessionStorage.getItem(
          STORAGE_KEYS.SESSION
        ) ||
        localStorage.getItem(
          STORAGE_KEYS.SESSION
        ) ||
        ""
      ).trim();
    } catch (error) {
      return "";
    }
  }

  function saveLoginResponse(data) {
    if (!data) return;

    const session =
      data.session ||
      data.token ||
      null;

    const user =
      data.user ||
      null;

    try {
      if (session) {
        const token =
          typeof session === "string"
            ? session
            : session.token || "";

        if (token) {
          sessionStorage.setItem(
            STORAGE_KEYS.SESSION,
            token
          );
        }

        sessionStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(
            user || {}
          )
        );
      }
    } catch (error) {
      console.warn(
        "Unable to save session locally.",
        error
      );
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(
        STORAGE_KEYS.SESSION
      );

      sessionStorage.removeItem(
        STORAGE_KEYS.USER
      );

      localStorage.removeItem(
        STORAGE_KEYS.SESSION
      );

      localStorage.removeItem(
        STORAGE_KEYS.USER
      );
    } catch (error) {
      console.warn(
        "Unable to clear local session.",
        error
      );
    }
  }

  /* ==========================================================
     PAYLOAD
     ========================================================== */

  function buildPayload(
    action,
    payload
  ) {
    const data =
      payload &&
      typeof payload === "object"
        ? {
            ...payload
          }
        : {};

    data.action = action;

    /*
     * Login does not require a session token.
     */
    if (action !== "login") {
      const token =
        getSessionToken();

      if (token) {
        data.sessionToken = token;
      }
    }

    return data;
  }

  /* ==========================================================
     RESPONSE
     ========================================================== */

  async function parseResponse(
    response
  ) {
    const text =
      await response.text();

    if (!text) {
      throw new Error(
        "The API returned an empty response."
      );
    }

    let data;

    try {
      data =
        JSON.parse(text);
    } catch (error) {
      console.error(
        "Invalid API JSON response:",
        text
      );

      throw new Error(
        "API returned invalid JSON."
      );
    }

    if (
      data &&
      (
        data.success === false ||
        data.ok === false
      )
    ) {
      throw new Error(
        data.message ||
        data.error ||
        "API request failed."
      );
    }

    return data;
  }

  /* ==========================================================
     MAIN REQUEST
     ========================================================== */

  async function request(
    action,
    payload = {},
    method = "POST"
  ) {
    const url =
      getApiUrl();

    const upperMethod =
      String(
        method || "POST"
      ).toUpperCase();

    const data =
      buildPayload(
        action,
        payload
      );

    const controller =
      new AbortController();

    let timeout =
      30000;

    try {
      if (
        typeof API_CONFIG !== "undefined" &&
        API_CONFIG &&
        API_CONFIG.timeout
      ) {
        timeout =
          Number(
            API_CONFIG.timeout
          ) || 30000;
      }
    } catch (error) {
      timeout = 30000;
    }

    const timeoutId =
      setTimeout(
        function () {
          controller.abort();
        },
        timeout
      );

    try {
      let response;

      /* ------------------------------------------------------
         GET
         ------------------------------------------------------ */

      if (
        upperMethod === "GET"
      ) {
        const requestUrl =
          new URL(url);

        Object.keys(data)
          .forEach(
            function (key) {
              const value =
                data[key];

              if (
                value === undefined ||
                value === null
              ) {
                return;
              }

              requestUrl.searchParams.set(
                key,
                typeof value === "object"
                  ? JSON.stringify(
                      value
                    )
                  : String(value)
              );
            }
          );

        response =
          await fetch(
            requestUrl.toString(),
            {
              method: "GET",
              redirect: "follow",
              cache: "no-store",
              signal:
                controller.signal
            }
          );
      }

      /* ------------------------------------------------------
         POST
         ------------------------------------------------------ */

      else {
        response =
          await fetch(
            url,
            {
              method: "POST",

              /*
               * Important for Apps Script.
               */
              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              /*
               * Apps Script doPost() reads:
               *
               * e.postData.contents
               */
              body:
                JSON.stringify(data),

              redirect: "follow",

              cache: "no-store",

              credentials: "omit",

              signal:
                controller.signal
            }
          );
      }

      if (!response) {
        throw new Error(
          "No response received from API."
        );
      }

      return await parseResponse(
        response
      );
    }

    catch (error) {
      if (
        error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "API request timed out. Please check your internet connection and try again."
        );
      }

      if (
        error &&
        error.name === "TypeError" &&
        /fetch/i.test(
          String(
            error.message || ""
          )
        )
      ) {
        console.error(
          "Google Apps Script API network error:",
          {
            url: url,
            action: action,
            method: upperMethod,
            error: error
          }
        );

        throw new Error(
          "Unable to connect to the school server. Please check the Apps Script Web App deployment and API URL."
        );
      }

      throw error;
    }

    finally {
      clearTimeout(
        timeoutId
      );
    }
  }

  /* ==========================================================
     GET
     ========================================================== */

  async function get(
    action,
    payload = {}
  ) {
    return request(
      action,
      payload,
      "GET"
    );
  }

  /* ==========================================================
     POST
     ========================================================== */

  async function post(
    action,
    payload = {}
  ) {
    return request(
      action,
      payload,
      "POST"
    );
  }

  /* ==========================================================
     LOGIN
     ========================================================== */

  async function login(
    username,
    password,
    extra = {}
  ) {
    if (!username) {
      throw new Error(
        "Username is required."
      );
    }

    if (!password) {
      throw new Error(
        "Password is required."
      );
    }

    const payload = {
      username:
        String(
          username
        ).trim(),

      password:
        String(password)
    };

    /*
     * Optional Turnstile token.
     */
    Object.keys(
      extra || {}
    ).forEach(
      function (key) {
        if (
          extra[key] !== undefined &&
          extra[key] !== null
        ) {
          payload[key] =
            extra[key];
        }
      }
    );

    const response =
      await post(
        "login",
        payload
      );

    const data =
      response &&
      response.data !== undefined
        ? response.data
        : response;

    if (!data) {
      throw new Error(
        "Login server returned an empty response."
      );
    }

    if (
      !data.session ||
      !data.user
    ) {
      throw new Error(
        "Login response is incomplete."
      );
    }

    saveLoginResponse(
      data
    );

    return data;
  }

  /* ==========================================================
     LOGOUT
     ========================================================== */

  async function logout() {
    const token =
      getSessionToken();

    try {
      if (token) {
        await post(
          "logout",
          {
            sessionToken:
              token
          }
        );
      }
    } catch (error) {
      console.warn(
        "Server logout failed:",
        error
      );
    }

    clearSession();

    return {
      success: true
    };
  }

  /* ==========================================================
     VERIFY SESSION
     ========================================================== */

  async function verifySession() {
    const token =
      getSessionToken();

    if (!token) {
      return {
        success: false,
        authenticated: false
      };
    }

    try {
      const response =
        await post(
          "verifySession",
          {
            sessionToken:
              token
          }
        );

      return (
        response &&
        response.data !== undefined
          ? response.data
          : response
      );
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  /* ==========================================================
     HEALTH
     ========================================================== */

  async function health() {
    const response =
      await get(
        "health"
      );

    return (
      response &&
      response.data !== undefined
        ? response.data
        : response
    );
  }

  /* ==========================================================
     USER
     ========================================================== */

  function getCurrentUser() {
    try {
      const value =
        sessionStorage.getItem(
          STORAGE_KEYS.USER
        );

      return value
        ? JSON.parse(value)
        : null;
    } catch (error) {
      return null;
    }
  }

  function isLoggedIn() {
    return Boolean(
      getSessionToken()
    );
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  window.MCSApi = {
    request,
    get,
    post,

    login,
    logout,
    verifySession,
    health,

    getCurrentUser,
    getSessionToken,
    isLoggedIn,
    clearSession,

    configured:
      function () {
        try {
          return Boolean(
            getApiUrl()
          );
        } catch (error) {
          return false;
        }
      }
  };

})();
