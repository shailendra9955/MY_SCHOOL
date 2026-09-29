/*
 * ============================================================
 * MODERN CONVENT SCHOOL
 * AUTHENTICATION / AUTHORIZATION HELPER
 * ============================================================
 *
 * Client-side route guard only.
 *
 * IMPORTANT:
 * Real authorization is performed by Google Apps Script.
 * This file only:
 *
 * 1. Stores the authenticated session.
 * 2. Reads the authenticated session.
 * 3. Protects frontend pages.
 * 4. Handles role-based routing.
 * 5. Handles logout.
 * 6. Handles client-side inactivity timeout.
 *
 * ============================================================
 */

(function () {

    "use strict";


    // ========================================================
    // CONFIGURATION
    // ========================================================

    const SESSION_KEY =
        "MCS_SESSION";


    const DEFAULT_IDLE_TIMEOUT =
        30 * 60 * 1000;


    const DEFAULT_SESSION_TIMEOUT =
        8 * 60 * 60 * 1000;


    let idleTimer =
        null;


    // ========================================================
    // LOGIN PAGE PATH
    // ========================================================

    function getLoginPath() {

        const path =
            window.location.pathname;


        if (
            path.includes("/admin/") ||
            path.includes("/portal/")
        ) {

            return "../login.html";

        }


        return "login.html";

    }


    // ========================================================
    // ROLE NORMALIZATION
    // ========================================================

    function normalizeRole(role) {

        const value =
            String(role || "")
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, "_");


        switch (value) {

            case "super_admin":
            case "superadministrator":
            case "super_administrator":
            case "superadmin":

                return "SUPER_ADMIN";


            case "admin":
            case "administrator":
            case "administrator_account":

                return "ADMIN";


            case "principal":

                return "PRINCIPAL";


            case "teacher":

                return "TEACHER";


            case "accountant":

                return "ACCOUNTANT";


            case "staff":

                return "STAFF";


            case "student":

                return "STUDENT";


            case "parent":

                return "PARENT";


            default:

                return value.toUpperCase();

        }

    }


    // ========================================================
    // READ SESSION FROM SESSION STORAGE
    // ========================================================

    function parseSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    SESSION_KEY
                );


            if (!raw) {

                return null;

            }


            const session =
                JSON.parse(raw);


            if (
                !session ||
                typeof session !== "object"
            ) {

                return null;

            }


            return session;

        } catch (error) {

            console.warn(
                "Invalid login session.",
                error
            );


            return null;

        }

    }


    // ========================================================
    // GET CURRENT SESSION
    // ========================================================

    function getSession() {

        const session =
            parseSession();


        if (!session) {

            return null;

        }


        const now =
            Date.now();


        const expiresAt =
            Number(
                session.expiresAt ||
                session.expires_at ||
                0
            );


        // ----------------------------------------------------
        // SERVER SESSION EXPIRATION
        // ----------------------------------------------------

        if (
            expiresAt &&
            now >= expiresAt
        ) {

            clearSession();

            return null;

        }


        // ----------------------------------------------------
        // CLIENT FALLBACK EXPIRATION
        // ----------------------------------------------------

        const loginAt =
            Number(
                session.loginAt ||
                0
            );


        if (
            loginAt &&
            now - loginAt >
                DEFAULT_SESSION_TIMEOUT
        ) {

            clearSession();

            return null;

        }


        // ----------------------------------------------------
        // NORMALIZE ROLE
        // ----------------------------------------------------

        session.role =
            normalizeRole(
                session.role
            );


        return session;

    }


    // ========================================================
    // SAVE SESSION
    // ========================================================

    function saveSession(session) {

        if (
            !session ||
            typeof session !== "object"
        ) {

            throw new Error(
                "Invalid authentication session."
            );

        }


        const safeSession = {

            ...session,

            role:
                normalizeRole(
                    session.role
                ),

            loginAt:
                Date.now()

        };


        // ----------------------------------------------------
        // SERVER EXPIRATION
        // ----------------------------------------------------

        if (
            !safeSession.expiresAt &&
            safeSession.expires_at
        ) {

            safeSession.expiresAt =
                Number(
                    safeSession.expires_at
                );

        }


        // ----------------------------------------------------
        // FALLBACK EXPIRATION
        // ----------------------------------------------------

        if (
            !safeSession.expiresAt
        ) {

            safeSession.expiresAt =
                Date.now() +
                DEFAULT_SESSION_TIMEOUT;

        }


        sessionStorage.setItem(

            SESSION_KEY,

            JSON.stringify(
                safeSession
            )

        );


        startIdleTimer();


        return safeSession;

    }


    // ========================================================
    // CLEAR SESSION
    // ========================================================

    function clearSession() {

        sessionStorage.removeItem(
            SESSION_KEY
        );


        stopIdleTimer();

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    function logout(
        redirect = true
    ) {

        clearSession();


        if (redirect) {

            window.location.replace(
                getLoginPath()
            );

        }

    }


    // ========================================================
    // IDLE TIMER
    // ========================================================

    function startIdleTimer() {

        stopIdleTimer();


        idleTimer =
            setTimeout(

                function () {

                    clearSession();


                    window.location.replace(

                        getLoginPath() +
                        "?reason=timeout"

                    );

                },

                DEFAULT_IDLE_TIMEOUT

            );

    }


    // ========================================================
    // RESET IDLE TIMER
    // ========================================================

    function resetIdleTimer() {

        const session =
            parseSession();


        if (!session) {

            return;

        }


        startIdleTimer();

    }


    // ========================================================
    // STOP IDLE TIMER
    // ========================================================

    function stopIdleTimer() {

        if (idleTimer) {

            clearTimeout(
                idleTimer
            );


            idleTimer =
                null;

        }

    }


    // ========================================================
    // GET REQUIRED ROLES
    // ========================================================

    function getAllowedRoles() {

        const raw =
            document.body.dataset.requiredRoles ||
            "";


        return raw

            .split(",")

            .map(function (role) {

                return normalizeRole(
                    role
                );

            })

            .filter(Boolean);

    }


    // ========================================================
    // CHECK ROLE
    // ========================================================

    function isAllowed(
        role,
        allowedRoles
    ) {

        if (
            !allowedRoles.length
        ) {

            return true;

        }


        const normalizedRole =
            normalizeRole(
                role
            );


        return allowedRoles.includes(
            normalizedRole
        );

    }


    // ========================================================
    // ROLE HOME
    // ========================================================

    function getRoleHome(role) {

        switch (
            normalizeRole(role)
        ) {

            case "SUPER_ADMIN":

            case "ADMIN":

            case "PRINCIPAL":

                return "../admin/dashboard.html";


            case "TEACHER":

                return "../portal/teacher.html";


            case "ACCOUNTANT":

                return "../portal/accountant.html";


            case "STAFF":

                return "../portal/staff.html";


            case "STUDENT":

                return "../portal/dashboard.html";


            case "PARENT":

                return "../portal/dashboard.html";


            default:

                return getLoginPath();

        }

    }


    // ========================================================
    // PROTECT CURRENT PAGE
    // ========================================================

    function protectCurrentPage() {

        const allowedRoles =
            getAllowedRoles();


        /*
         * If this page has no required role,
         * no authentication guard is required.
         */

        if (
            !allowedRoles.length
        ) {

            return;

        }


        const session =
            getSession();


        // ----------------------------------------------------
        // NO SESSION
        // ----------------------------------------------------

        if (!session) {

            const returnTo =
                encodeURIComponent(

                    window.location.pathname +
                    window.location.search

                );


            window.location.replace(

                getLoginPath() +
                "?returnTo=" +
                returnTo

            );


            return;

        }


        // ----------------------------------------------------
        // ROLE NOT ALLOWED
        // ----------------------------------------------------

        if (
            !isAllowed(
                session.role,
                allowedRoles
            )
        ) {

            console.warn(
                "Current account is not authorized for this page.",
                {
                    role:
                        session.role,

                    allowedRoles:
                        allowedRoles
                }
            );


            window.location.replace(
                getRoleHome(
                    session.role
                )
            );


            return;

        }


        // ----------------------------------------------------
        // UPDATE UI
        // ----------------------------------------------------

        updateUserLabels(
            session
        );


        bindLogoutButtons();


        startIdleTimer();

    }


    // ========================================================
    // USER LABELS
    // ========================================================

    function updateUserLabels(
        session
    ) {

        const name =
            session.full_name ||
            session.name ||
            session.username ||
            "User";


        const normalizedRole =
            normalizeRole(
                session.role
            );


        let roleLabel =
            normalizedRole;


        /*
         * ROLE_LABELS is optional.
         * Never let a missing Config.js variable
         * break authentication.
         */

        if (
            typeof ROLE_LABELS !==
                "undefined" &&
            ROLE_LABELS &&
            ROLE_LABELS[
                normalizedRole
            ]
        ) {

            roleLabel =
                ROLE_LABELS[
                    normalizedRole
                ];

        }


        document
            .querySelectorAll(
                "[data-current-user]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        name;

                }
            );


        document
            .querySelectorAll(
                "[data-current-role]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        roleLabel;

                }
            );

    }


    // ========================================================
    // LOGOUT BUTTONS
    // ========================================================

    function bindLogoutButtons() {

        document
            .querySelectorAll(
                "[data-logout]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            logout(true);

                        }
                    );

                }
            );

    }


    // ========================================================
    // ACTIVITY MONITOR
    // ========================================================

    let activityScheduled =
        false;


    function monitorActivity() {

        if (
            activityScheduled
        ) {

            return;

        }


        activityScheduled =
            true;


        setTimeout(

            function () {

                activityScheduled =
                    false;


                resetIdleTimer();

            },

            1000

        );

    }


    [
        "click",
        "keydown",
        "pointermove",
        "touchstart"
    ]
    .forEach(
        function (eventName) {

            window.addEventListener(

                eventName,

                monitorActivity,

                {
                    passive: true
                }

            );

        }
    );


    // ========================================================
    // PUBLIC API
    // ========================================================

    window.MCSAuth =
        Object.freeze({

            getSession,

            saveSession,

            clearSession,

            logout,

            protectCurrentPage,

            getRoleHome,

            normalizeRole

        });


    // ========================================================
    // INITIALIZE
    // ========================================================

    document.addEventListener(

        "DOMContentLoaded",

        protectCurrentPage

    );


})();
