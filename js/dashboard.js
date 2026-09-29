/*
 * Modern Convent School
 * Admin dashboard data controller.
 */
(function () {
    "use strict";

    document.addEventListener(
        "DOMContentLoaded",
        async function () {
            if (!MCSApi.configured()) {
                document.getElementById(
                    "status"
                ).textContent =
                    "Google Apps Script API is not configured.";

                return;
            }

            try {
                const data =
                    await MCSApi.get(
                        API_ACTIONS.GET_ADMIN_DASHBOARD
                    );

                document.getElementById(
                    "s"
                ).textContent =
                    data.students ??
                    data.totalStudents ??
                    "—";

                document.getElementById(
                    "t"
                ).textContent =
                    data.teachers ??
                    data.totalTeachers ??
                    "—";

                document.getElementById(
                    "u"
                ).textContent =
                    data.users ??
                    data.totalUsers ??
                    "—";

                document.getElementById(
                    "a"
                ).textContent =
                    data.admissions ??
                    data.pendingAdmissions ??
                    "—";

                document.getElementById(
                    "status"
                ).textContent =
                    "Connected to Google Apps Script API.";
            } catch (error) {
                document.getElementById(
                    "status"
                ).textContent =
                    error.message ||
                    "Unable to load dashboard data.";
            }
        }
    );
})();
