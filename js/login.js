/*
 * ============================================================
 * MODERN CONVENT SCHOOL
 * LOGIN PAGE CONTROLLER
 * ============================================================
 *
 * Security layers:
 *
 * 1. Client-side validation
 * 2. Local CAPTCHA
 * 3. Cloudflare Turnstile token
 * 4. Server-side Turnstile validation
 * 5. Server-side username/password validation
 * 6. Server-side role validation
 * 7. Server-side session/token
 *
 * IMPORTANT:
 *
 * The role selector on the login page is informational only.
 *
 * The browser MUST NOT decide the user's actual role.
 *
 * The Google Apps Script backend reads the user's role from
 * the Users sheet and returns the authenticated role.
 *
 * ============================================================
 */

(function () {

    "use strict";


    // ========================================================
    // DOM ELEMENTS
    // ========================================================

    const form =
        document.getElementById("loginForm");

    const userType =
        document.getElementById("userType");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");

    const captchaInput =
        document.getElementById("captchaInput");

    const captchaCanvas =
        document.getElementById("captchaCanvas");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");

    const refreshCaptcha =
        document.getElementById("refreshCaptcha");

    const togglePassword =
        document.getElementById("togglePassword");

    const turnstileWidget =
        document.getElementById("turnstileWidget");

    const turnstileStatus =
        document.getElementById("turnstileStatus");


    // ========================================================
    // INTERNAL STATE
    // ========================================================

    let captchaAnswer = "";

    let turnstileWidgetId = null;

    let turnstileToken = "";


    // ========================================================
    // POPULATE USER TYPE SELECTOR
    // ========================================================
    /*
     * The selector is kept for user convenience.
     *
     * IMPORTANT:
     * It is NOT used for authorization.
     *
     * The backend determines the actual role from the
     * Users sheet.
     */

    function populateRoles() {

        if (!userType) {
            return;
        }

        userType.innerHTML = "";


        /*
         * USER_ROLES and ROLE_LABELS come from Config.js.
         */

        if (
            typeof USER_ROLES === "undefined" ||
            !USER_ROLES
        ) {

            const fallbackRoles = [
                {
                    value: "student",
                    label: "Student"
                },
                {
                    value: "parent",
                    label: "Parent"
                },
                {
                    value: "teacher",
                    label: "Teacher"
                },
                {
                    value: "staff",
                    label: "Staff"
                },
                {
                    value: "accountant",
                    label: "Accountant"
                },
                {
                    value: "admin",
                    label: "Administrator"
                },
                {
                    value: "super_admin",
                    label: "Super Administrator"
                }
            ];


            fallbackRoles.forEach(
                function (item) {

                    const option =
                        document.createElement("option");

                    option.value =
                        item.value;

                    option.textContent =
                        item.label;

                    userType.appendChild(
                        option
                    );

                }
            );

            userType.value =
                "student";

            return;
        }


        Object.keys(USER_ROLES)
            .forEach(
                function (key) {

                    const role =
                        USER_ROLES[key];

                    const option =
                        document.createElement("option");

                    option.value =
                        role;

                    option.textContent =
                        (
                            typeof ROLE_LABELS !==
                            "undefined" &&
                            ROLE_LABELS &&
                            ROLE_LABELS[role]
                        )
                            ? ROLE_LABELS[role]
                            : role;


                    userType.appendChild(
                        option
                    );

                }
            );


        /*
         * Default selection is Student.
         *
         * Again, this does NOT control authentication.
         */

        if (
            USER_ROLES.STUDENT
        ) {

            userType.value =
                USER_ROLES.STUDENT;

        }

    }


    // ========================================================
    // GENERATE LOCAL CAPTCHA
    // ========================================================

    function generateCaptcha() {

        if (
            !captchaInput ||
            !captchaCanvas
        ) {
            return;
        }


        const alphabet =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


        captchaAnswer = "";


        for (
            let index = 0;
            index < 6;
            index += 1
        ) {

            captchaAnswer +=
                alphabet[
                    Math.floor(
                        Math.random() *
                        alphabet.length
                    )
                ];

        }


        captchaInput.value = "";


        drawCaptcha(
            captchaAnswer
        );

    }


    // ========================================================
    // DRAW CAPTCHA
    // ========================================================

    function drawCaptcha(text) {

        if (!captchaCanvas) {
            return;
        }


        const context =
            captchaCanvas.getContext("2d");


        if (!context) {
            return;
        }


        const width =
            captchaCanvas.width;

        const height =
            captchaCanvas.height;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        // ----------------------------------------------------
        // Background
        // ----------------------------------------------------

        context.fillStyle =
            "#f5f8fb";

        context.fillRect(
            0,
            0,
            width,
            height
        );


        // ----------------------------------------------------
        // Interference lines
        // ----------------------------------------------------

        for (
            let index = 0;
            index < 8;
            index += 1
        ) {

            context.strokeStyle =
                `rgba(11,45,77,${0.08 + Math.random() * 0.12})`;

            context.lineWidth = 1;


            context.beginPath();


            context.moveTo(
                Math.random() * width,
                Math.random() * height
            );


            context.lineTo(
                Math.random() * width,
                Math.random() * height
            );


            context.stroke();

        }


        // ----------------------------------------------------
        // CAPTCHA characters
        // ----------------------------------------------------

        text
            .split("")
            .forEach(
                function (
                    character,
                    index
                ) {

                    const angle =
                        (
                            Math.random() -
                            0.5
                        ) * 0.5;


                    const x =
                        28 +
                        index * 39;


                    const y =
                        46 +
                        (
                            Math.random() -
                            0.5
                        ) * 8;


                    context.save();


                    context.translate(
                        x,
                        y
                    );


                    context.rotate(
                        angle
                    );


                    context.font =
                        "700 28px Arial, sans-serif";


                    context.fillStyle =
                        "#0b2d4d";


                    context.fillText(
                        character,
                        0,
                        0
                    );


                    context.restore();

                }
            );


        // ----------------------------------------------------
        // Random dots
        // ----------------------------------------------------

        for (
            let index = 0;
            index < 45;
            index += 1
        ) {

            context.fillStyle =
                "rgba(15,94,168,0.25)";


            context.beginPath();


            context.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 1.5 + 0.5,
                0,
                Math.PI * 2
            );


            context.fill();

        }

    }


    // ========================================================
    // VALIDATE CAPTCHA
    // ========================================================

    function isCaptchaValid() {

        if (
            !captchaInput
        ) {
            return true;
        }


        return (
            captchaInput.value
                .trim()
                .toUpperCase()
            ===
            captchaAnswer
        );

    }


    // ========================================================
    // SETUP CLOUDFLARE TURNSTILE
    // ========================================================

    function setupTurnstile() {

        /*
         * If Turnstile configuration does not exist,
         * do not crash the login page.
         */

        if (
            typeof TURNSTILE_CONFIG ===
            "undefined"
        ) {

            if (turnstileStatus) {

                turnstileStatus.textContent =
                    "Cloudflare verification is not configured.";

            }

            return;

        }


        if (
            !TURNSTILE_CONFIG.enabled
        ) {

            if (turnstileStatus) {

                turnstileStatus.textContent =
                    "Cloudflare verification is disabled in configuration.";

            }

            return;

        }


        if (
            !TURNSTILE_CONFIG.siteKey ||
            TURNSTILE_CONFIG.siteKey.includes(
                "REPLACE_WITH"
            )
        ) {

            if (turnstileStatus) {

                turnstileStatus.textContent =
                    "Cloudflare Turnstile site key is not configured.";

            }


            showError(
                "The login security verification is not configured. " +
                "Add the Cloudflare Turnstile site key in js/Config.js."
            );


            return;

        }


        let attempts = 0;


        const timer =
            setInterval(
                function () {

                    attempts += 1;


                    if (
                        window.turnstile &&
                        typeof window.turnstile.render ===
                            "function"
                    ) {

                        clearInterval(
                            timer
                        );


                        renderTurnstile();


                        return;

                    }


                    if (
                        attempts >= 30
                    ) {

                        clearInterval(
                            timer
                        );


                        if (turnstileStatus) {

                            turnstileStatus.textContent =
                                "Cloudflare verification could not be loaded.";

                        }


                        showError(
                            "Cloudflare verification could not be loaded. " +
                            "Check the network connection and try again."
                        );

                    }

                },
                250
            );

    }


    // ========================================================
    // RENDER TURNSTILE
    // ========================================================

    function renderTurnstile() {

        if (
            !turnstileWidget ||
            !window.turnstile
        ) {
            return;
        }


        turnstileWidgetId =
            window.turnstile.render(
                turnstileWidget,
                {

                    sitekey:
                        TURNSTILE_CONFIG.siteKey,


                    action:
                        TURNSTILE_CONFIG.action,


                    theme:
                        TURNSTILE_CONFIG.theme,


                    size:
                        TURNSTILE_CONFIG.size,


                    callback:
                        function (token) {

                            turnstileToken =
                                token || "";


                            if (
                                turnstileStatus
                            ) {

                                turnstileStatus.textContent =
                                    "Cloudflare verification completed.";

                            }

                        },


                    "expired-callback":
                        function () {

                            turnstileToken =
                                "";


                            if (
                                turnstileStatus
                            ) {

                                turnstileStatus.textContent =
                                    "Cloudflare verification expired. " +
                                    "Please verify again.";

                            }

                        },


                    "error-callback":
                        function () {

                            turnstileToken =
                                "";


                            if (
                                turnstileStatus
                            ) {

                                turnstileStatus.textContent =
                                    "Cloudflare verification failed. " +
                                    "Please try again.";

                            }

                        }

                }
            );

    }


    // ========================================================
    // SHOW ERROR
    // ========================================================

    function showError(message) {

        if (!loginMessage) {
            return;
        }


        loginMessage.textContent =
            message;


        loginMessage.hidden =
            false;


        loginMessage.classList.add(
            "error"
        );


        loginMessage.classList.remove(
            "success"
        );

    }


    // ========================================================
    // SHOW SUCCESS
    // ========================================================

    function showSuccess(message) {

        if (!loginMessage) {
            return;
        }


        loginMessage.textContent =
            message;


        loginMessage.hidden =
            false;


        loginMessage.classList.remove(
            "error"
        );


        loginMessage.classList.add(
            "success"
        );

    }


    // ========================================================
    // CLEAR MESSAGE
    // ========================================================

    function clearMessage() {

        if (!loginMessage) {
            return;
        }


        loginMessage.textContent =
            "";


        loginMessage.hidden =
            true;


        loginMessage.classList.remove(
            "error",
            "success"
        );

    }


    // ========================================================
    // RESET TURNSTILE
    // ========================================================

    function resetTurnstile() {

        turnstileToken =
            "";


        if (
            window.turnstile &&
            turnstileWidgetId !== null
        ) {

            try {

                window.turnstile.reset(
                    turnstileWidgetId
                );

            } catch (error) {

                console.warn(
                    "Unable to reset Turnstile:",
                    error
                );

            }

        }

    }


    // ========================================================
    // GET RETURN URL
    // ========================================================
    /*
     * Kept for compatibility with the login page.
     *
     * The application intentionally does not use arbitrary
     * return URLs for security reasons.
     */

    function getReturnUrl() {

        const value =
            new URLSearchParams(
                window.location.search
            ).get(
                "returnTo"
            );


        if (!value) {
            return "";
        }


        try {

            const url =
                new URL(
                    value,
                    window.location.origin
                );


            /*
             * Only allow same-origin URLs.
             */

            if (
                url.origin !==
                window.location.origin
            ) {

                return "";

            }


            return (
                url.pathname +
                url.search +
                url.hash
            );

        } catch (error) {

            return "";

        }

    }


    // ========================================================
    // REDIRECT AFTER LOGIN
    // ========================================================


function normalizePortalRole(role) {

    const value =
        String(role || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");


    switch (value) {

        // ------------------------------------------------
        // SUPER ADMIN
        // ------------------------------------------------

        case "super_admin":
        case "superadministrator":
        case "super_administrator":
        case "superadmin":

            return "super_admin";


        // ------------------------------------------------
        // ADMIN
        // ------------------------------------------------

        case "admin":
        case "administrator":
        case "administrator_account":

            return "admin";


        // ------------------------------------------------
        // PRINCIPAL
        // ------------------------------------------------

        case "principal":

            return "principal";


        // ------------------------------------------------
        // TEACHER
        // ------------------------------------------------

        case "teacher":

            return "teacher";


        // ------------------------------------------------
        // ACCOUNTANT
        // ------------------------------------------------

        case "accountant":

            return "accountant";


        // ------------------------------------------------
        // STAFF
        // ------------------------------------------------

        case "staff":

            return "staff";


        // ------------------------------------------------
        // STUDENT
        // ------------------------------------------------

        case "student":

            return "student";


        // ------------------------------------------------
        // PARENT
        // ------------------------------------------------

        case "parent":

            return "parent";


        // ------------------------------------------------
        // UNKNOWN
        // ------------------------------------------------

        default:

            return value;

    }

}


function redirectAfterLogin(session) {

    // ----------------------------------------------------
    // SESSION CHECK
    // ----------------------------------------------------

    if (!session) {

        console.error(
            "Redirect failed: session is missing."
        );

        window.location.replace(
            "login.html?reason=session"
        );

        return;

    }


    // ----------------------------------------------------
    // GET SERVER ROLE
    // ----------------------------------------------------

    const originalRole =
        String(
            session.role || ""
        ).trim();


    // ----------------------------------------------------
    // NORMALIZE ROLE FOR ROUTING ONLY
    // ----------------------------------------------------

    const role =
        normalizePortalRole(
            originalRole
        );


    console.log(
        "Authenticated server role:",
        originalRole
    );


    console.log(
        "Normalized portal role:",
        role
    );


    // ----------------------------------------------------
    // PORTAL MAPPING
    // ----------------------------------------------------

    const roleHomes = {

        super_admin:
            "../admin/dashboard.html",

        admin:
            "../admin/dashboard.html",

        principal:
            "../admin/dashboard.html",

        teacher:
            "portal/teacher.html",

        accountant:
            "portal/accountant.html",

        staff:
            "portal/staff.html",

        student:
            "portal/dashboard.html",

        parent:
            "portal/dashboard.html"

    };


    const destination =
        roleHomes[role];


    console.log(
        "Redirect destination:",
        destination
    );


    // ----------------------------------------------------
    // UNKNOWN ROLE
    // ----------------------------------------------------

    if (!destination) {

        console.error(
            "Unknown authenticated role:",
            {
                originalRole:
                    originalRole,

                normalizedRole:
                    role
            }
        );


        showError(
            "Login succeeded, but no portal is configured " +
            "for the account role: " +
            originalRole
        );

        return;

    }


    // ----------------------------------------------------
    // BUILD FINAL URL
    // ----------------------------------------------------

    const targetUrl =
        new URL(
            destination,
            window.location.href
        ).href;


    console.log(
        "Final redirect URL:",
        targetUrl
    );


    // ----------------------------------------------------
    // REDIRECT
    // ----------------------------------------------------

    window.location.replace(
        targetUrl
    );

}


    // ========================================================
    // HANDLE LOGIN SUBMISSION
    // ========================================================

    async function handleSubmit(event) {

        event.preventDefault();


        clearMessage();


        // ----------------------------------------------------
        // API CONFIGURATION CHECK
        // ----------------------------------------------------

        if (
            typeof MCSApi ===
                "undefined" ||
            !MCSApi ||
            typeof MCSApi.configured !==
                "function"
        ) {

            showError(
                "The login API is not available. " +
                "Please check js/api.js and js/Config.js."
            );


            return;

        }


        if (
            !MCSApi.configured()
        ) {

            showError(
                "The Google Apps Script API is not configured."
            );


            return;

        }


        // ----------------------------------------------------
        // USERNAME VALIDATION
        // ----------------------------------------------------

        if (
            !username ||
            !username.value.trim()
        ) {

            showError(
                "Please enter your username."
            );


            if (username) {
                username.focus();
            }


            return;

        }


        // ----------------------------------------------------
        // PASSWORD VALIDATION
        // ----------------------------------------------------

        if (
            !password ||
            !password.value
        ) {

            showError(
                "Please enter your password."
            );


            if (password) {
                password.focus();
            }


            return;

        }


        // ----------------------------------------------------
        // LOCAL CAPTCHA VALIDATION
        // ----------------------------------------------------

        if (
            !isCaptchaValid()
        ) {

            showError(
                "The CAPTCHA code is incorrect. " +
                "Please generate a new code and try again."
            );


            generateCaptcha();


            if (captchaInput) {
                captchaInput.focus();
            }


            return;

        }


        // ----------------------------------------------------
        // TURNSTILE VALIDATION
        // ----------------------------------------------------

        if (
            typeof TURNSTILE_CONFIG !==
                "undefined" &&
            TURNSTILE_CONFIG &&
            TURNSTILE_CONFIG.enabled &&
            !turnstileToken
        ) {

            showError(
                "Please complete the Cloudflare verification."
            );


            return;

        }


        // ----------------------------------------------------
        // DISABLE LOGIN BUTTON
        // ----------------------------------------------------

        if (loginButton) {

            loginButton.disabled =
                true;


            loginButton.textContent =
                "Signing in…";

        }


        try {

            // =================================================
            // LOGIN API REQUEST
            // =================================================
            /*
             * IMPORTANT:
             *
             * We deliberately DO NOT send:
             *
             * requestedRole: userType.value
             *
             * The backend determines the real role from the
             * Users sheet.
             */

            const payload = {

                username:
                    username.value.trim(),

                password:
                    password.value,

                turnstileToken:
                    turnstileToken

            };


            const action =
                (
                    typeof API_ACTIONS !==
                        "undefined" &&
                    API_ACTIONS &&
                    API_ACTIONS.LOGIN
                )
                    ? API_ACTIONS.LOGIN
                    : "login";


            const result =
                await MCSApi.post(
                    action,
                    payload
                );


            // =================================================
            // PROCESS SERVER RESPONSE
            // =================================================

            /*
             * MCSApi.post() normally returns the inner
             * data object.
             *
             * We also support the full response shape:
             *
             * {
             *     success: true,
             *     data: {
             *         session: ...
             *     }
             * }
             */

            let data =
                result;


            if (
                result &&
                result.data !==
                    undefined
            ) {

                data =
                    result.data;

            }


            if (
                !data ||
                !data.session ||
                !data.session.role
            ) {

                throw new Error(
                    "The server did not return a valid login session."
                );

            }


            const session =
                data.session;


            // =================================================
            // IMPORTANT SECURITY RULE
            // =================================================
            /*
             * DO NOT compare:
             *
             * session.role
             *
             * against:
             *
             * userType.value
             *
             * The userType dropdown is NOT authoritative.
             *
             * The server role is authoritative.
             */


            // =================================================
            // SAVE AUTHENTICATED SESSION
            // =================================================

            if (
                typeof MCSAuth ===
                    "undefined" ||
                !MCSAuth ||
                typeof MCSAuth.saveSession !==
                    "function"
            ) {

                throw new Error(
                    "Authentication module is not available."
                );

            }


            MCSAuth.saveSession(
                session
            );


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            showSuccess(
                "Login successful. Redirecting…"
            );


            // =================================================
            // CLEAR PASSWORD
            // =================================================

            if (password) {

                password.value =
                    "";

            }


            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(
                function () {

                    redirectAfterLogin(
                        session
                    );

                },
                150
            );


        } catch (error) {

            console.error(
                "Login request failed:",
                error
            );


            let message =
                "Login failed. Please check your credentials.";


            if (
                error &&
                error.message
            ) {

                message =
                    error.message;

            }


            showError(
                message
            );


            /*
             * Generate a new CAPTCHA after a failed attempt.
             */

            generateCaptcha();


            /*
             * Reset Turnstile after failure.
             */

            resetTurnstile();


        } finally {

            if (loginButton) {

                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Login";

            }

        }

    }


    // ========================================================
    // PASSWORD SHOW / HIDE
    // ========================================================

    function setupPasswordToggle() {

        if (
            !togglePassword ||
            !password
        ) {

            return;

        }


        togglePassword.addEventListener(
            "click",
            function () {

                const showing =
                    password.type ===
                    "text";


                password.type =
                    showing
                        ? "password"
                        : "text";


                togglePassword.textContent =
                    showing
                        ? "Show"
                        : "Hide";


                togglePassword.setAttribute(
                    "aria-pressed",
                    String(
                        !showing
                    )
                );


                togglePassword.setAttribute(
                    "aria-label",
                    showing
                        ? "Show password"
                        : "Hide password"
                );

            }
        );

    }


    // ========================================================
    // TIMEOUT MESSAGE
    // ========================================================

    function showTimeoutMessage() {

        const reason =
            new URLSearchParams(
                window.location.search
            ).get(
                "reason"
            );


        if (
            reason ===
            "timeout"
        ) {

            showError(
                "Your session expired for security. " +
                "Please sign in again."
            );

        }

    }


    // ========================================================
    // INITIALIZE LOGIN PAGE
    // ========================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            populateRoles();


            generateCaptcha();


            setupTurnstile();


            setupPasswordToggle();


            if (
                refreshCaptcha
            ) {

                refreshCaptcha.addEventListener(
                    "click",
                    function () {

                        generateCaptcha();

                    }
                );

            }


            if (
                form
            ) {

                form.addEventListener(
                    "submit",
                    handleSubmit
                );

            } else {

                console.error(
                    "Login form #loginForm was not found."
                );

            }


            showTimeoutMessage();

        }
    );


})();
