/*
 * Modern Convent School
 * Authentication and authorization helpers.
 *
 * This file provides the client-side route guard and session handling.
 * It is NOT a replacement for server-side authorization.
 *
 * Security rule:
 * Every protected Google Apps Script action must validate:
 * 1. The session/token.
 * 2. The user's active status.
 * 3. The user's role.
 * 4. The user's permission for the requested action.
 */
(function () {
    "use strict";

    const SESSION_KEY = "MCS_SESSION";
    const LOGIN_PAGE = getLoginPath();
    const DEFAULT_IDLE_TIMEOUT = 30 * 60 * 1000;
    const DEFAULT_SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

    let idleTimer = null;

    function getLoginPath() {
        return location.pathname.includes("/admin/") ||
            location.pathname.includes("/portal/")
            ? "../login.html"
            : "login.html";
    }

    function parseSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);

            if (!raw) {
                return null;
            }

            const session = JSON.parse(raw);

            if (!session || typeof session !== "object") {
                return null;
            }

            return session;
        } catch (error) {
            console.warn("Invalid login session.", error);
            return null;
        }
    }

    function normalizeRole(role) {
        return String(role || "")
            .trim()
            .toUpperCase();
    }

    function getSession() {
        const session = parseSession();

        if (!session) {
            return null;
        }

        const now = Date.now();

        /*
         * If the backend returns expiresAt, trust that server-created
         * timestamp. Otherwise use the local login timestamp as a
         * short-lived fallback.
         */
        const expiresAt = Number(
            session.expiresAt ||
            session.expires_at ||
            0
        );

        if (expiresAt && now >= expiresAt) {
            clearSession();
            return null;
        }

        const loginAt = Number(session.loginAt || 0);

        if (
            loginAt &&
            now - loginAt > DEFAULT_SESSION_TIMEOUT
        ) {
            clearSession();
            return null;
        }

        session.role = normalizeRole(session.role);

        return session;
    }

    function saveSession(session) {
        const safeSession = {
            ...session,
            role: normalizeRole(session.role),
            loginAt: Date.now()
        };

        /*
         * Prefer a backend expiry. This fallback keeps static hosting
         * sessions short-lived when the backend does not send one.
         */
        if (!safeSession.expiresAt) {
            safeSession.expiresAt =
                Date.now() + DEFAULT_SESSION_TIMEOUT;
        }

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(safeSession)
        );

        startIdleTimer();

        return safeSession;
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        stopIdleTimer();
    }

    function logout(redirect = true) {
        clearSession();

        if (redirect) {
            window.location.replace(LOGIN_PAGE);
        }
    }

    function startIdleTimer() {
        stopIdleTimer();

        idleTimer = setTimeout(
            function () {
                clearSession();
                window.location.replace(
                    `${LOGIN_PAGE}?reason=timeout`
                );
            },
            DEFAULT_IDLE_TIMEOUT
        );
    }

    function resetIdleTimer() {
        const session = parseSession();

        if (!session) {
            return;
        }

        startIdleTimer();
    }

    function stopIdleTimer() {
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
    }

    function getAllowedRoles() {
        const raw =
            document.body.dataset.requiredRoles || "";

        return raw
            .split(",")
            .map(normalizeRole)
            .filter(Boolean);
    }

    function isAllowed(role, allowedRoles) {
        if (!allowedRoles.length) {
            return true;
        }

        return allowedRoles.includes(normalizeRole(role));
    }

    function protectCurrentPage() {
        const allowedRoles = getAllowedRoles();

        /*
         * Public pages do not have data-required-roles.
         * No guard is necessary there.
         */
        if (!allowedRoles.length) {
            return;
        }

        const session = getSession();

        if (!session) {
            const returnTo =
                encodeURIComponent(
                    location.pathname + location.search
                );

            window.location.replace(
                `${LOGIN_PAGE}?returnTo=${returnTo}`
            );

            return;
        }

        if (!isAllowed(session.role, allowedRoles)) {
            /*
             * Do not reveal sensitive details about another role.
             * Send the user back to the correct portal.
             */
            window.location.replace(
                getRoleHome(session.role)
            );

            return;
        }

        updateUserLabels(session);
        bindLogoutButtons();
        startIdleTimer();
    }

    function updateUserLabels(session) {
        const name =
            session.full_name ||
            session.name ||
            session.username ||
            "User";

        const role =
            ROLE_LABELS[normalizeRole(session.role)] ||
            normalizeRole(session.role);

        document.querySelectorAll(
            "[data-current-user]"
        ).forEach(function (element) {
            element.textContent = name;
        });

        document.querySelectorAll(
            "[data-current-role]"
        ).forEach(function (element) {
            element.textContent = role;
        });
    }

    function bindLogoutButtons() {
        document.querySelectorAll(
            "[data-logout]"
        ).forEach(function (button) {
            button.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    logout(true);
                }
            );
        });
    }

    function getRoleHome(role) {
        switch (normalizeRole(role)) {
            case USER_ROLES.SUPER_ADMIN:
            case USER_ROLES.ADMIN:
                return "../admin/dashboard.html";

            case USER_ROLES.PRINCIPAL:
                return "../portal/principal.html";

            case USER_ROLES.TEACHER:
                return "../portal/teacher.html";

            case USER_ROLES.ACCOUNTANT:
                return "../portal/accountant.html";

            case USER_ROLES.STAFF:
                return "../portal/staff.html";

            case USER_ROLES.STUDENT:
                return "../portal/student.html";

            case USER_ROLES.PARENT:
                return "../portal/parent.html";

            default:
                return LOGIN_PAGE;
        }
    }

    /*
     * Reset the inactivity timer when the user is active.
     * Throttle the listener so it does not continuously allocate timers.
     */
    let activityScheduled = false;

    function monitorActivity() {
        if (activityScheduled) {
            return;
        }

        activityScheduled = true;

        setTimeout(function () {
            activityScheduled = false;
            resetIdleTimer();
        }, 1000);
    }

    [
        "click",
        "keydown",
        "pointermove",
        "touchstart"
    ].forEach(function (eventName) {
        window.addEventListener(
            eventName,
            monitorActivity,
            { passive: true }
        );
    });

    window.MCSAuth = Object.freeze({
        getSession,
        saveSession,
        clearSession,
        logout,
        protectCurrentPage,
        getRoleHome,
        normalizeRole
    });

    document.addEventListener(
        "DOMContentLoaded",
        protectCurrentPage
    );
})();
