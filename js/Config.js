// ============================================================
// Modern Convent School
// Frontend Configuration
// ============================================================

const SCHOOL_CONFIG = {
    schoolName: "Modern Convent School",
    shortName: "Modern Convent",
    tagline: "Excellence in Education",

    address: "Gaighat Reoti, Ballia, Uttar Pradesh, India",

    phone: "+91-00154054215",
    email: "modernconvent@gmail.com",

    website: window.location.origin
};


// ============================================================
// GOOGLE APPS SCRIPT API
// ============================================================

const API_CONFIG = {

    // --------------------------------------------------------
    // IMPORTANT:
    // Paste your deployed Google Apps Script Web App URL here.
    // Example:
    //
    // "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
    // --------------------------------------------------------

    GOOGLE_APPS_SCRIPT_URL:
        "https://script.google.com/macros/s/AKfycbwMb6ixWWtgy92lBIZXDjXJ6W-gWVbWprKvnJW66Txby9yNrF34iyB3GRCF35llLVH6/exec",

    timeout: 30000,

    version: "1.0",

    debug: true
};


// ============================================================
// USER ROLES
// ============================================================

const USER_ROLES = {

    ADMIN: "ADMIN",

    SUPER_ADMIN: "SUPER_ADMIN",

    TEACHER: "TEACHER",

    STUDENT: "STUDENT",

    PARENT: "PARENT",

    STAFF: "STAFF",

    ACCOUNTANT: "ACCOUNTANT"
};


// ============================================================
// API ACTIONS
// ============================================================

const API_ACTIONS = {

    // Authentication
    LOGIN: "login",
    LOGOUT: "logout",
    VERIFY_SESSION: "verifySession",
    CHANGE_PASSWORD: "changePassword",

    // Users
    GET_USERS: "getUsers",
    GET_USER: "getUser",
    ADD_USER: "addUser",
    UPDATE_USER: "updateUser",
    DELETE_USER: "deleteUser",
    DEACTIVATE_USER: "deactivateUser",

    // Students
    GET_STUDENTS: "getStudents",
    GET_STUDENT: "getStudent",
    ADD_STUDENT: "addStudent",
    UPDATE_STUDENT: "updateStudent",
    DELETE_STUDENT: "deleteStudent",
    DEACTIVATE_STUDENT: "deactivateStudent",

    // Teachers
    GET_TEACHERS: "getTeachers",
    GET_TEACHER: "getTeacher",
    ADD_TEACHER: "addTeacher",
    UPDATE_TEACHER: "updateTeacher",
    DELETE_TEACHER: "deleteTeacher",
    DEACTIVATE_TEACHER: "deactivateTeacher",

    // Parents
    GET_PARENTS: "getParents",
    ADD_PARENT: "addParent",
    UPDATE_PARENT: "updateParent",
    DELETE_PARENT: "deleteParent",
    DEACTIVATE_PARENT: "deactivateParent",

    // Dashboard
    GET_ADMIN_DASHBOARD: "getAdminDashboard"
};
