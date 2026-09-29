/*
 * Modern Convent School
 * Shared admin navigation controller.
 *
 * Data access is handled by api.js/module.js.
 * Authentication is handled by auth.js.
 */
(function () {
    "use strict";

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            const button =
                document.querySelector(
                    "[data-admin-menu]"
                );

            const nav =
                document.querySelector(
                    ".admin-nav"
                );

            if (button && nav) {
                button.addEventListener(
                    "click",
                    function () {
                        nav.classList.toggle(
                            "open"
                        );
                    }
                );
            }

            const current =
                location.pathname
                    .split("/")
                    .pop() ||
                "dashboard.html";

            document.querySelectorAll(
                ".admin-nav a"
            ).forEach(function (link) {
                if (
                    link.getAttribute("href") ===
                    current
                ) {
                    link.classList.add("active");
                }
            });
        }
    );
})();
