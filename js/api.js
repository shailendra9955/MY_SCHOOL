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

  function getApiUrl() {
    const url =
      window.API_CONFIG &&
      typeof API_CONFIG.GOOGLE_APPS_SCRIPT_URL === "string"
        ? API_CONFIG.GOOGLE_APPS_SCRIPT_URL.trim()
        : "";

    if (!url) {
      throw new Error(
        "Google Apps Script API URL is not configured."
      );
    }

    if (
      !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec\/?$/.test(
        url
      )
    ) {
      throw new Error(
        "Invalid Google Apps Script Web App URL."
      );
    }

    return url.replace(/\/+$/, "");
  }

  function getSessionToken() {
    try {
      return (
        sessionStorage.getItem(STORAGE_KEYS.SESSION) ||
        localStorage.getItem(STORAGE_KEYS.SESSION) ||
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
          JSON.stringify(user || {})
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

  function buildPayload(action, payload) {
    const data =
      payload &&
      typeof payload === "object"
        ? { ...payload }
        : {};

    data.action = action;

    /*
     * Login does not need a session token.
     * Every other authenticated request receives it.
     */
    if (action !== "login") {
      const token = getSessionToken();

      if (token) {
        data.sessionToken = token;
      }
    }

    return data;
  }

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      throw new Error(
        "The API returned an empty response."
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error(
        "Invalid API JSON response:",
        text
      );

      throw new Error(
        "API returned invalid JSON."
      );
    }

    /*
     * Apps Script can return HTTP 200 while the
     * application itself reports success:false.
     */
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

  async function request(
    action,
    payload = {},
    method = "POST"
  ) {
    const url = getApiUrl();

    const upperMethod =
      String(method || "POST").toUpperCase();

    const data =
      buildPayload(action, payload);

    const controller =
      new AbortController();

    const timeout =
      Number(
        (
          window.API_CONFIG &&
          API_CONFIG.timeout
        ) || 30000
      );

    const timeoutId =
      setTimeout(
        function () {
          controller.abort();
        },
        timeout
      );

    try {
      let response;

      /*
       * --------------------------------------------------------
       * GET
       * --------------------------------------------------------
       *
       * Useful for public endpoints such as health.
       */
      if (upperMethod === "GET") {
        const requestUrl =
          new URL(url);

        Object.keys(data).forEach(
          function (key) {
            const value = data[key];

            if (
              value === undefined ||
              value === null
            ) {
              return;
            }

            requestUrl.searchParams.set(
              key,
              typeof value === "object"
                ? JSON.stringify(value)
                : String(value)
            );
          }
        );

        response = await fetch(
          requestUrl.toString(),
          {
            method: "GET",

            /*
             * Apps Script Content Service redirects
             * responses to script.googleusercontent.com.
             */
            redirect: "follow",

            cache: "no-store",

            signal:
              controller.signal
          }
        );
      }

      /*
       * --------------------------------------------------------
       * POST
       * --------------------------------------------------------
       *
       * IMPORTANT:
       *
       * Do NOT use application/json here.
       *
       * Apps Script Web Apps work better with a
       * simple text/plain POST, avoiding a CORS
       * preflight request.
       */
      else {
        response = await fetch(
          url,
          {
            method: "POST",

            redirect: "follow",

            cache: "no-store",

            /*
             * text/plain is intentional.
             *
             * Code.gs reads:
             * e.postData.contents
             *
             * and then JSON.parse() handles the body.
             */
            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(data),

            /*
             * Never send cookies to Apps Script.
             * Authentication is handled by our
             * sessionToken in the request body.
             */
            credentials: "omit",

            signal:
              controller.signal
          }
        );
      }

      /*
       * If fetch reached this point, the network
       * request completed.
       */
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

      /*
       * Browser normally reports CORS/network
       * problems simply as:
       *
       * TypeError: Failed to fetch
       */
      if (
        error &&
        error.name === "TypeError" &&
        /fetch/i.test(
          String(error.message || "")
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
      clearTimeout(timeoutId);
    }
  }

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

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT send a role from
     * the browser. The Apps Script backend reads
     * the actual role from the Users sheet.
     */
    const payload = {
      username: String(username).trim(),
      password: String(password)
    };

    /*
     * Allows Turnstile token or other future
     * public login fields to be passed.
     */
    Object.keys(extra || {}).forEach(
      function (key) {
        if (
          extra[key] !== undefined &&
          extra[key] !== null
        ) {
          payload[key] = extra[key];
        }
      }
    );

    const response =
      await post(
        "login",
        payload
      );

    /*
     * Apps Script returns:
     *
     * {
     *   success: true,
     *   data: {
     *     session: {...},
     *     user: {...}
     *   }
     * }
     */
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

    saveLoginResponse(data);

    return data;
  }

  async function logout() {
    const token =
      getSessionToken();

    /*
     * Clear local session even if the server
     * cannot be reached.
     */
    try {
      if (token) {
        await post(
          "logout",
          {
            sessionToken: token
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
            sessionToken: token
          }
        );

      return (
        response &&
        response.data !== undefined
          ? response.data
          : response
      );
    } catch (error) {
      /*
       * Invalid/expired session should clean
       * the browser session.
       */
      clearSession();

      throw error;
    }
  }

  async function health() {
    const response =
      await get("health");

    return (
      response &&
      response.data !== undefined
        ? response.data
        : response
    );
  }

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

  /*
   * ----------------------------------------------------------
   * PUBLIC API
   * ----------------------------------------------------------
   */

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

    configured: function () {
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
