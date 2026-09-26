/**
 * ============================================================
 * MODERN CONVENT SCHOOL MANAGEMENT SYSTEM
 * Global Configuration
 * ============================================================
 *
 * File:
 *     js/config.js
 *
 * Purpose:
 *     Central configuration for the entire school website.
 *
 * IMPORTANT:
 *     Replace GOOGLE_APPS_SCRIPT_URL with your deployed
 *     Google Apps Script Web App URL.
 *
 * Example:
 *     https://script.google.com/macros/s/XXXXXXXXXXXX/exec
 *
 * ============================================================
 */

"use strict";

/* ============================================================
   SCHOOL INFORMATION
   ============================================================ */

const SCHOOL_CONFIG = {

    schoolName: "Modern Convent School",

    shortName: "Modern Convent",

    tagline: "Excellence in Education",

    address: "Gaighat reoti, Ballia, Uttar pradesh, India",

    phone: "+91-00154054215",

    email: "modernconvent@gmail.com",

    website: window.location.origin

};


/* ============================================================
   GOOGLE APPS SCRIPT API
   ============================================================ */

/*
 * IMPORTANT:
 *
 * After deploying your Google Apps Script as:
 *
 * Deploy
 *    ↓
 * New deployment
 *    ↓
 * Web app
 *
 * Copy the Web App URL and paste it below.
 */

const API_CONFIG = {

    /*
     * Example:
     *
     * "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxx/exec"
     *
     */

    GOOGLE_APPS_SCRIPT_URL:
        "https://script.google.com/macros/s/AKfycbxjcj5Kv2V7SI_G8Bvg6FfEuNLcXtviNnLfvRe1mvUF9jO0QX5fVZeRNAeQn4BoFu0o/exec",

    /*
     * Request timeout in milliseconds.
     */
    timeout: 30000,

    /*
     * Google Apps Script API version.
     */
    version: "1.0",

    /*
     * Enable console logging while developing.
     *
     * Change to false before production if desired.
     */
    debug: true

};


/* ============================================================
   APPLICATION SETTINGS
   ============================================================ */

const APP_CONFIG = {

    appName: "Modern Convent School Management System",

    version: "1.0.0",

    environment: "development",

    /*
     * Session duration.
     *
     * 8 hours = 8 * 60 * 60 * 1000
     */
    sessionDuration: 8 * 60 * 60 * 1000,

    /*
     * Items displayed per page in admin tables.
     */
    recordsPerPage: 20,

    /*
     * Default date format.
     */
    dateFormat: "DD-MM-YYYY",

    /*
     * Default currency.
     */
    currency: "INR",

    /*
     * Currency symbol.
     */
    currencySymbol: "₹"

};


/* ============================================================
   USER ROLES
   ============================================================ */

const USER_ROLES = {

    ADMIN: "ADMIN",

    SUPER_ADMIN: "SUPER_ADMIN",

    TEACHER: "TEACHER",

    STUDENT: "STUDENT",

    PARENT: "PARENT",

    STAFF: "STAFF",

    ACCOUNTANT: "ACCOUNTANT"

};


/* ============================================================
   USER STATUS
   ============================================================ */

const USER_STATUS = {

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE",

    SUSPENDED: "SUSPENDED",

    PENDING: "PENDING"

};


/* ============================================================
   API ACTIONS
   ============================================================ */

/*
 * These names must match the action names implemented
 * inside Google Apps Script Code.gs.
 */

const API_ACTIONS = {

    /* Authentication */

    LOGIN: "login",

    LOGOUT: "logout",

    VERIFY_SESSION: "verifySession",

    CHANGE_PASSWORD: "changePassword",

    RESET_PASSWORD: "resetPassword",


    /* Users */

    GET_USERS: "getUsers",

    GET_USER: "getUser",

    ADD_USER: "addUser",

    UPDATE_USER: "updateUser",

    DELETE_USER: "deleteUser",

    DEACTIVATE_USER: "deactivateUser",


    /* Students */

    GET_STUDENTS: "getStudents",

    GET_STUDENT: "getStudent",

    ADD_STUDENT: "addStudent",

    UPDATE_STUDENT: "updateStudent",

    DELETE_STUDENT: "deleteStudent",

    DEACTIVATE_STUDENT: "deactivateStudent",


    /* Teachers */

    GET_TEACHERS: "getTeachers",

    GET_TEACHER: "getTeacher",

    ADD_TEACHER: "addTeacher",

    UPDATE_TEACHER: "updateTeacher",

    DELETE_TEACHER: "deleteTeacher",

    DEACTIVATE_TEACHER: "deactivateTeacher",


    /* Parents */

    GET_PARENTS: "getParents",

    GET_PARENT: "getParent",

    ADD_PARENT: "addParent",

    UPDATE_PARENT: "updateParent",

    DELETE_PARENT: "deleteParent",


    /* Attendance */

    GET_ATTENDANCE: "getAttendance",

    ADD_ATTENDANCE: "addAttendance",

    UPDATE_ATTENDANCE: "updateAttendance",


    /* Results */

    GET_RESULTS: "getResults",

    ADD_RESULT: "addResult",

    UPDATE_RESULT: "updateResult",


    /* Fees */

    GET_FEES: "getFees",

    ADD_FEE: "addFee",

    UPDATE_FEE: "updateFee",

    RECORD_PAYMENT: "recordPayment",


    /* Homework */

    GET_HOMEWORK: "getHomework",

    ADD_HOMEWORK: "addHomework",

    UPDATE_HOMEWORK: "updateHomework",

    DELETE_HOMEWORK: "deleteHomework",


    /* Notices */

    GET_NOTICES: "getNotices",

    ADD_NOTICE: "addNotice",

    UPDATE_NOTICE: "updateNotice",

    DELETE_NOTICE: "deleteNotice",


    /* Timetable */

    GET_TIMETABLE: "getTimetable",

    ADD_TIMETABLE: "addTimetable",

    UPDATE_TIMETABLE: "updateTimetable",


    /* Dashboard */

    GET_ADMIN_DASHBOARD: "getAdminDashboard",

    GET_TEACHER_DASHBOARD: "getTeacherDashboard",

    GET_STUDENT_DASHBOARD: "getStudentDashboard",


    /* Settings */

    GET_SETTINGS: "getSettings",

    UPDATE_SETTINGS: "updateSettings"

};


/* ============================================================
   STORAGE KEYS
   ============================================================ */

const STORAGE_KEYS = {

    SESSION: "school_session",

    USER: "school_user",

    TOKEN: "school_auth_token",

    ROLE: "school_user_role",

    USER_ID: "school_user_id"

};


/* ============================================================
   PAGE PATHS
   ============================================================ */

const PAGE_PATHS = {

    /* Public */

    HOME: "index.html",

    LOGIN: "login.html",

    CONTACT: "contact.html",


    /* Student / Parent Portal */

    PORTAL_DASHBOARD: "portal/dashboard.html",

    PORTAL_PROFILE: "portal/profile.html",

    PORTAL_ATTENDANCE: "portal/attendance.html",

    PORTAL_TIMETABLE: "portal/timetable.html",

    PORTAL_HOMEWORK: "portal/homework.html",

    PORTAL_RESULTS: "portal/results.html",

    PORTAL_FEES: "portal/fees.html",

    PORTAL_NOTICES: "portal/notices.html",


    /* Admin */

    ADMIN_DASHBOARD: "admin/dashboard.html",

    ADMIN_STUDENTS: "admin/students.html",

    ADMIN_TEACHERS: "admin/teachers.html",

    ADMIN_ATTENDANCE: "admin/attendance.html",

    ADMIN_RESULTS: "admin/results.html",

    ADMIN_FEES: "admin/fees.html",

    ADMIN_NOTICES: "admin/notices.html",

    ADMIN_EVENTS: "admin/events.html",

    ADMIN_ADMISSIONS: "admin/admissions.html",

    ADMIN_SETTINGS: "admin/settings.html"

};


/* ============================================================
   API REQUEST HELPER
   ============================================================ */

/**
 * Send a request to Google Apps Script.
 *
 * Usage:
 *
 * const result = await apiRequest(
 *     API_ACTIONS.GET_STUDENTS
 * );
 *
 * Or:
 *
 * const result = await apiRequest(
 *     API_ACTIONS.ADD_STUDENT,
 *     {
 *         name: "Rahul Kumar",
 *         class: "8",
 *         section: "A"
 *     }
 * );
 */

async function apiRequest(action, data = {}) {

    const apiUrl = API_CONFIG.GOOGLE_APPS_SCRIPT_URL;

    /* --------------------------------------------
       Check API URL
    -------------------------------------------- */

    if (
        !apiUrl ||
        apiUrl === "https://script.google.com/macros/s/AKfycby2igFbRWCruEKsxXeNbDxlINnVofkuilBXWkdOtmfKuriQJCIap_2UVXYHxEHTr88t/exec"
    ) {

        console.error(
            "Google Apps Script URL has not been configured."
        );

        throw new Error(
            "Google Apps Script API URL is not configured."
        );

    }


    /* --------------------------------------------
       Get stored authentication information
    -------------------------------------------- */

    const token =
        localStorage.getItem(STORAGE_KEYS.TOKEN);

    const session =
        localStorage.getItem(STORAGE_KEYS.SESSION);

    const user =
        localStorage.getItem(STORAGE_KEYS.USER);


    /* --------------------------------------------
       Request body
    -------------------------------------------- */

    const requestBody = {

        action: action,

        data: data,

        token: token || null,

        session: session || null,

        user: user ? JSON.parse(user) : null,

        version: API_CONFIG.version,

        timestamp: new Date().toISOString()

    };


    /* --------------------------------------------
       Debug logging
    -------------------------------------------- */

    if (API_CONFIG.debug) {

        console.log(
            "[SCHOOL API REQUEST]",
            requestBody
        );

    }


    /* --------------------------------------------
       Timeout controller
    -------------------------------------------- */

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            API_CONFIG.timeout
        );


    try {

        /* ----------------------------------------
           Send request
        ---------------------------------------- */

        const response = await fetch(
            apiUrl,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body: JSON.stringify(requestBody),

                signal: controller.signal

            }
        );


        clearTimeout(timeout);


        /* ----------------------------------------
           Check HTTP status
        ---------------------------------------- */

        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );

        }


        /* ----------------------------------------
           Parse JSON
        ---------------------------------------- */

        const result =
            await response.json();


        /* ----------------------------------------
           Debug response
        ---------------------------------------- */

        if (API_CONFIG.debug) {

            console.log(
                "[SCHOOL API RESPONSE]",
                result
            );

        }


        /* ----------------------------------------
           Handle API-level errors
        ---------------------------------------- */

        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "API operation failed."
            );

        }


        return result;

    }

    catch (error) {

        clearTimeout(timeout);

        console.error(
            "[SCHOOL API ERROR]",
            error
        );

        throw error;

    }

}


/* ============================================================
   SESSION HELPERS
   ============================================================ */

/**
 * Save logged-in user session.
 */

function saveUserSession(sessionData) {

    if (!sessionData) {

        return;

    }


    if (sessionData.token) {

        localStorage.setItem(
            STORAGE_KEYS.TOKEN,
            sessionData.token
        );

    }


    if (sessionData.session) {

        localStorage.setItem(
            STORAGE_KEYS.SESSION,
            sessionData.session
        );

    }


    if (sessionData.user) {

        localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(
                sessionData.user
            )
        );

    }


    if (sessionData.user?.role) {

        localStorage.setItem(
            STORAGE_KEYS.ROLE,
            sessionData.user.role
        );

    }


    if (sessionData.user?.user_id) {

        localStorage.setItem(
            STORAGE_KEYS.USER_ID,
            sessionData.user.user_id
        );

    }

}


/**
 * Get currently logged-in user.
 */

function getCurrentUser() {

    const user =
        localStorage.getItem(
            STORAGE_KEYS.USER
        );

    if (!user) {

        return null;

    }

    try {

        return JSON.parse(user);

    }

    catch (error) {

        console.error(
            "Invalid stored user data."
        );

        return null;

    }

}


/**
 * Check whether a user is logged in.
 */

function isLoggedIn() {

    return !!(
        localStorage.getItem(
            STORAGE_KEYS.TOKEN
        ) ||
        localStorage.getItem(
            STORAGE_KEYS.SESSION
        )
    );

}


/**
 * Logout user.
 */

function logoutUser() {

    localStorage.removeItem(
        STORAGE_KEYS.SESSION
    );

    localStorage.removeItem(
        STORAGE_KEYS.USER
    );

    localStorage.removeItem(
        STORAGE_KEYS.TOKEN
    );

    localStorage.removeItem(
        STORAGE_KEYS.ROLE
    );

    localStorage.removeItem(
        STORAGE_KEYS.USER_ID
    );

    window.location.href =
        getRootPath() + "login.html";

}


/* ============================================================
   PATH HELPER
   ============================================================ */

/**
 * Determine project root.
 *
 * Useful because pages exist at:
 *
 * /
 * /portal/
 * /admin/
 */

function getRootPath() {

    const path =
        window.location.pathname;


    if (
        path.includes("/admin/") ||
        path.includes("/portal/")
    ) {

        return "../";

    }


    return "./";

}


/* ============================================================
   ROLE CHECKING
   ============================================================ */

function hasRole(...allowedRoles) {

    const role =
        localStorage.getItem(
            STORAGE_KEYS.ROLE
        );

    if (!role) {

        return false;

    }

    return allowedRoles.includes(role);

}


/**
 * Require login.
 *
 * Redirects to login page if the user
 * is not authenticated.
 */

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            getRootPath() + "login.html";

        return false;

    }

    return true;

}


/**
 * Require specific role.
 */

function requireRole(...allowedRoles) {

    if (!requireLogin()) {

        return false;

    }


    if (!hasRole(...allowedRoles)) {

        alert(
            "You do not have permission to access this page."
        );

        window.location.href =
            getRootPath() + "index.html";

        return false;

    }


    return true;

}


/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/**
 * Generate a client-side temporary ID.
 *
 * IMPORTANT:
 * The final permanent ID should be generated
 * by Google Apps Script/server-side code.
 */

function generateTemporaryId(prefix = "TMP") {

    const timestamp =
        Date.now();

    const random =
        Math.floor(
            Math.random() * 10000
        );

    return `${prefix}-${timestamp}-${random}`;

}


/**
 * Format currency.
 */

function formatCurrency(amount) {

    const value =
        Number(amount) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency:
                APP_CONFIG.currency,

            minimumFractionDigits: 2

        }
    ).format(value);

}


/**
 * Escape HTML.
 *
 * Important when displaying
 * Google Sheet data inside tables.
 */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ============================================================
   GLOBAL DEBUG INFORMATION
   ============================================================ */

if (API_CONFIG.debug) {

    console.log(
        "======================================"
    );

    console.log(
        "Modern Convent School Management System"
    );

    console.log(
        "Version:",
        APP_CONFIG.version
    );

    console.log(
        "Environment:",
        APP_CONFIG.environment
    );

    console.log(
        "API:",
        API_CONFIG.GOOGLE_APPS_SCRIPT_URL
    );

    console.log(
        "======================================"
    );

}
```

### Then load it before `admin.js`

For your **admin pages**, use:

```html
<script src="../js/config.js"></script>
<script src="../js/admin.js"></script>
```

For your **portal pages**:

```html
<script src="../js/config.js"></script>
<script src="../js/portal.js"></script>
```

For root/public pages:

```html
<script src="js/config.js"></script>
<script src="js/app.js"></script>
```

### Most important part

You only need to change this:

```javascript
GOOGLE_APPS_SCRIPT_URL:
    "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
```

to your actual deployed Apps Script URL.

**However, `config.js` alone won't create students yet.** The next file we should build is the Google Apps Script **`Code.gs`**, because it will implement `addStudent`, `updateStudent`, `deactivateStudent`, `getStudents`, authentication, and communication with your Google Sheet.
