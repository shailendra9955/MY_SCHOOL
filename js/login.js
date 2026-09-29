/*
 * Modern Convent School
 * Login page controller.
 *
 * Security layers:
 * 1. Client-side validation.
 * 2. Local CAPTCHA.
 * 3. Cloudflare Turnstile token.
 * 4. Server-side Turnstile validation.
 * 5. Server-side username/password validation.
 * 6. Server-side role validation.
 * 7. Short-lived session/token.
 *
 * IMPORTANT:
 * A browser-only CAPTCHA or role selector is not a security boundary.
 * The Google Apps Script backend must enforce the same rules.
 */
(function () {
    "use strict";

    const form = document.getElementById("loginForm");
    const userType = document.getElementById("userType");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const captchaInput = document.getElementById("captchaInput");
    const captchaCanvas = document.getElementById("captchaCanvas");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    const refreshCaptcha =
        document.getElementById("refreshCaptcha");
    const togglePassword =
        document.getElementById("togglePassword");
    const turnstileWidget =
        document.getElementById("turnstileWidget");
    const turnstileStatus =
        document.getElementById("turnstileStatus");

    let captchaAnswer = "";
    let turnstileWidgetId = null;
    let turnstileToken = "";

    /*
     * Populate the role selector from the central configuration.
     * This avoids hard-coded role lists in the HTML.
     */
    function populateRoles() {
        userType.innerHTML = "";

        Object.keys(USER_ROLES).forEach(function (key) {
            const role = USER_ROLES[key];
            const option =
                document.createElement("option");

            option.value = role;
            option.textContent =
                ROLE_LABELS[role] || role;

            userType.appendChild(option);
        });

        userType.value = USER_ROLES.STUDENT;
    }

    /*
     * Generate a visual CAPTCHA.
     * This is only a second-layer browser check; it must not be
     * treated as a replacement for Turnstile or backend controls.
     */
    function generateCaptcha() {
        const alphabet =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        captchaAnswer = "";

        for (let index = 0; index < 6; index += 1) {
            captchaAnswer +=
                alphabet[
                    Math.floor(
                        Math.random() * alphabet.length
                    )
                ];
        }

        captchaInput.value = "";

        drawCaptcha(captchaAnswer);
    }

    function drawCaptcha(text) {
        const context =
            captchaCanvas.getContext("2d");

        if (!context) {
            return;
        }

        const width = captchaCanvas.width;
        const height = captchaCanvas.height;

        context.clearRect(
            0,
            0,
            width,
            height
        );

        /*
         * Keep the canvas background plain and readable.
         * CSS controls the surrounding visual style.
         */
        context.fillStyle = "#f5f8fb";
        context.fillRect(
            0,
            0,
            width,
            height
        );

        /*
         * Random interference lines.
         */
        for (let index = 0; index < 8; index += 1) {
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

        /*
         * Draw each character separately to make OCR harder.
         */
        text.split("").forEach(function (character, index) {
            const angle =
                (Math.random() - 0.5) * 0.5;

            const x =
                28 + index * 39;

            const y =
                46 + (Math.random() - 0.5) * 8;

            context.save();
            context.translate(x, y);
            context.rotate(angle);

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
        });

        /*
         * Random dots.
         */
        for (let index = 0; index < 45; index += 1) {
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

    function isCaptchaValid() {
        return (
            captchaInput.value
                .trim()
                .toUpperCase() ===
            captchaAnswer
        );
    }

    /*
     * Turnstile is loaded asynchronously by Cloudflare.
     * Wait briefly for the global API before rendering.
     */
    function setupTurnstile() {
        if (!TURNSTILE_CONFIG.enabled) {
            turnstileStatus.textContent =
                "Cloudflare verification is disabled in configuration.";

            return;
        }

        if (
            !TURNSTILE_CONFIG.siteKey ||
            TURNSTILE_CONFIG.siteKey.includes(
                "REPLACE_WITH"
            )
        ) {
            turnstileStatus.textContent =
                "Cloudflare Turnstile site key is not configured.";

            showError(
                "The login security verification is not configured. " +
                "Add the Cloudflare Turnstile site key in js/Config.js."
            );

            return;
        }

        let attempts = 0;

        const timer =
            setInterval(function () {
                attempts += 1;

                if (
                    window.turnstile &&
                    typeof window.turnstile.render ===
                        "function"
                ) {
                    clearInterval(timer);
                    renderTurnstile();
                    return;
                }

                if (attempts >= 30) {
                    clearInterval(timer);

                    turnstileStatus.textContent =
                        "Cloudflare verification could not be loaded.";

                    showError(
                        "Cloudflare verification could not be loaded. " +
                        "Check the network connection and try again."
                    );
                }
            }, 250);
    }

    function renderTurnstile() {
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

                    callback: function (token) {
                        turnstileToken = token || "";

                        turnstileStatus.textContent =
                            "Cloudflare verification completed.";
                    },

                    "expired-callback": function () {
                        turnstileToken = "";

                        turnstileStatus.textContent =
                            "Cloudflare verification expired. " +
                            "Please verify again.";
                    },

                    "error-callback": function () {
                        turnstileToken = "";

                        turnstileStatus.textContent =
                            "Cloudflare verification failed. " +
                            "Please try again.";
                    }
                }
            );
    }

    function showError(message) {
        loginMessage.textContent = message;
        loginMessage.hidden = false;
        loginMessage.classList.add("error");
    }

    function showSuccess(message) {
        loginMessage.textContent = message;
        loginMessage.hidden = false;
        loginMessage.classList.remove("error");
        loginMessage.classList.add("success");
    }

    function clearMessage() {
        loginMessage.textContent = "";
        loginMessage.hidden = true;
        loginMessage.classList.remove(
            "error",
            "success"
        );
    }

    function resetTurnstile() {
        turnstileToken = "";

        if (
            window.turnstile &&
            turnstileWidgetId !== null
        ) {
            window.turnstile.reset(
                turnstileWidgetId
            );
        }
    }

    function getReturnUrl() {
        const value =
            new URLSearchParams(
                window.location.search
            ).get("returnTo");

        /*
         * Only accept same-origin relative paths.
         * This prevents an open redirect through returnTo.
         */
        if (!value) {
            return "";
        }

        try {
            const url =
                new URL(
                    value,
                    window.location.origin
                );

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

    function redirectAfterLogin(session) {
        const role =
            MCSAuth.normalizeRole(
                session.role
            );

        /*
         * A returnTo value is intentionally ignored for a normal
         * successful login. Users are sent to the portal that
         * belongs to their server-confirmed role.
         */
        const roleHome =
            MCSAuth.getRoleHome(role);

        window.location.replace(
            roleHome.replace("../", "")
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        clearMessage();

        if (!MCSApi.configured()) {
            showError(
                "The Google Apps Script API is not configured."
            );
            return;
        }

        if (!username.value.trim()) {
            showError("Please enter your username.");
            username.focus();
            return;
        }

        if (!password.value) {
            showError("Please enter your password.");
            password.focus();
            return;
        }

        if (!isCaptchaValid()) {
            showError(
                "The CAPTCHA code is incorrect. " +
                "Please generate a new code and try again."
            );

            generateCaptcha();
            captchaInput.focus();
            return;
        }

        if (
            TURNSTILE_CONFIG.enabled &&
            !turnstileToken
        ) {
            showError(
                "Please complete the Cloudflare verification."
            );
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing in…";

        try {
            const result =
                await MCSApi.post(
                    API_ACTIONS.LOGIN,
                    {
                        username:
                            username.value.trim(),

                        password:
                            password.value,

                        requestedRole:
                            userType.value,

                        turnstileToken:
                            turnstileToken
                    }
                );

            const session =
                result &&
                result.session
                    ? result.session
                    : result;

            if (
                !session ||
                !session.role
            ) {
                throw new Error(
                    "The server did not return a valid login session."
                );
            }

            const actualRole =
                MCSAuth.normalizeRole(
                    session.role
                );

            /*
             * The server must already validate this. The browser check
             * is an additional safety net against inconsistent responses.
             */
            if (
                actualRole !==
                MCSAuth.normalizeRole(
                    userType.value
                )
            ) {
                throw new Error(
                    "The selected user type does not match the account."
                );
            }

            MCSAuth.saveSession(session);

            showSuccess(
                "Login successful. Redirecting…"
            );

            /*
             * Do not keep the password in memory longer than needed.
             */
            password.value = "";

            setTimeout(
                function () {
                    redirectAfterLogin(session);
                },
                150
            );
        } catch (error) {
            console.error(
                "Login request failed:",
                error
            );

            showError(
                error.message ||
                "Login failed. Please check your credentials."
            );

            generateCaptcha();
            resetTurnstile();
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    }

    function setupPasswordToggle() {
        togglePassword.addEventListener(
            "click",
            function () {
                const showing =
                    password.type === "text";

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
                    String(!showing)
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

    function showTimeoutMessage() {
        const reason =
            new URLSearchParams(
                window.location.search
            ).get("reason");

        if (reason === "timeout") {
            showError(
                "Your session expired for security. " +
                "Please sign in again."
            );
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            populateRoles();
            generateCaptcha();
            setupTurnstile();
            setupPasswordToggle();

            refreshCaptcha.addEventListener(
                "click",
                generateCaptcha
            );

            form.addEventListener(
                "submit",
                handleSubmit
            );

            showTimeoutMessage();
        }
    );
})();
