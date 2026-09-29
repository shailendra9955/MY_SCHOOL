/*
 * Modern Convent School
 * Shared protected-portal controller.
 */
(function () {
    "use strict";

    function setupMenu() {
        const button =
            document.querySelector(
                "[data-portal-menu]"
            );

        const nav =
            document.querySelector(
                ".portal-nav"
            );

        if (!button || !nav) {
            return;
        }

        button.addEventListener(
            "click",
            function () {
                const open =
                    nav.classList.toggle("open");

                button.setAttribute(
                    "aria-expanded",
                    String(open)
                );
            }
        );
    }

    function highlightCurrentPage() {
        const current =
            location.pathname
                .split("/")
                .pop();

        document.querySelectorAll(
            ".portal-nav a"
        ).forEach(function (link) {
            if (
                link.getAttribute("href") ===
                current
            ) {
                link.classList.add("active");
            }
        });
    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            setupMenu();
            highlightCurrentPage();

            /*
             * auth.js performs the actual route guard.
             * Keeping this file focused on portal UI makes it easier
             * to maintain the visual layer independently.
             */
        }
    );
})();
