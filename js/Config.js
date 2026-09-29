/*
 * Modern Convent School
 * Central application configuration.
 *
 * IMPORTANT:
 * - The Apps Script URL is public and is not a secret.
 * - NEVER put the Cloudflare Turnstile secret key in this file.
 * - The Turnstile site key is public and may be placed here.
 */
const SCHOOL_CONFIG = {
    schoolName: "Modern Convent School",
    shortName: "Modern Convent",
    tagline: "Excellence in Education",
    address: "Gaighat Reoti, Ballia, Uttar Pradesh, India",
    phone: "+91-00154054215",
    email: "modernconvent@gmail.com",
    website: window.location.origin
};

const API_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL:
        "https://script.google.com/macros/s/AKfycby5mrS-MmW3j314RiFUBg2T6LyrQciR8TpoKJva4InCDj1pJE9oeSxHG48MpYgJLbJa/exec",

    timeout: 30000,

    version: "2.0",

    debug: false
};

/*
 * Cloudflare Turnstile configuration.
 *
 * Get the SITE KEY from:
 * Cloudflare Dashboard → Turnstile → your widget.
 *
 * The SECRET KEY must stay inside Google Apps Script
 * Script Properties. Never paste it into this file.
 */
const TURNSTILE_CONFIG = {
    enabled: true,

    siteKey: "0x4AAAAAAFItUieXLYL-Lxmc",

    action: "login",

    theme: "auto",

    size: "flexible"
};

/*
 * Roles are controlled by the server response.
 * The login-page selector is only a requested role.
 * The backend MUST compare requestedRole with the user's
 * real role before returning a successful session.
 */
const USER_ROLES = Object.freeze({
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    PRINCIPAL: "PRINCIPAL",
    TEACHER: "TEACHER",
    STAFF: "STAFF",
    ACCOUNTANT: "ACCOUNTANT",
    STUDENT: "STUDENT",
    PARENT: "PARENT"
});

const ROLE_LABELS = Object.freeze({
    SUPER_ADMIN: "Super Administrator",
    ADMIN: "Administrator",
    PRINCIPAL: "Principal",
    TEACHER: "Teacher",
    STAFF: "Staff",
    ACCOUNTANT: "Accountant",
    STUDENT: "Student",
    PARENT: "Parent / Guardian"
});

const API_ACTIONS = Object.freeze({
    LOGIN: "login",
    LOGOUT: "logout",
    VERIFY_SESSION: "verifySession",

    GET_USERS: "getUsers",
    ADD_USER: "addUser",
    UPDATE_USER: "updateUser",
    DELETE_USER: "deleteUser",
    DEACTIVATE_USER: "deactivateUser",

    GET_STUDENTS: "getStudents",
    ADD_STUDENT: "addStudent",
    UPDATE_STUDENT: "updateStudent",
    DELETE_STUDENT: "deleteStudent",
    DEACTIVATE_STUDENT: "deactivateStudent",

    GET_TEACHERS: "getTeachers",
    ADD_TEACHER: "addTeacher",
    UPDATE_TEACHER: "updateTeacher",
    DELETE_TEACHER: "deleteTeacher",
    DEACTIVATE_TEACHER: "deactivateTeacher",

    GET_PARENTS: "getParents",
    ADD_PARENT: "addParent",
    UPDATE_PARENT: "updateParent",
    DELETE_PARENT: "deleteParent",
    DEACTIVATE_PARENT: "deactivateParent",

    GET_ADMIN_DASHBOARD: "getAdminDashboard"
});
