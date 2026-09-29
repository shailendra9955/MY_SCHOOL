/*
 * Modern Convent School
 * Public website shared header, footer and mobile navigation.
 */
(function () {
    "use strict";

    function loadHeader() {
        const container =
            document.querySelector("[data-header]");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="topbar">
                <div class="container topbar-inner">
                    <span>
                        📞 01111111111 · 01111111111
                    </span>

                    <span>
                        📧
                        <a href="mailto:modernconvent@gmail.com">
                            modernconvent@gmail.com
                        </a>
                        · CBSE
                    </span>
                </div>
            </div>

            <header class="main-header">
                <div class="container nav-container">

                    <a class="school-brand" href="index.html">
                        <div class="school-logo">MC</div>

                        <div class="school-name">
                            <strong>Modern Convent School</strong>
                            <span>
                                Gaighat Reoti, Ballia, Uttar Pradesh
                            </span>
                        </div>
                    </a>

                    <nav class="main-nav" aria-label="Primary navigation">
                        <a href="index.html">Home</a>

                        <div class="nav-dropdown">
                            <a href="about.html">About ▾</a>
                            <div class="dropdown-menu">
                                <a href="about.html">About School</a>
                                <a href="vision.html">Vision &amp; Mission</a>
                                <a href="principal.html">Principal's Desk</a>
                                <a href="management.html">Management</a>
                                <a href="faculty.html">Faculty &amp; Staff</a>
                            </div>
                        </div>

                        <div class="nav-dropdown">
                            <a href="academics.html">Academics ▾</a>
                            <div class="dropdown-menu">
                                <a href="academics.html">Academic System</a>
                                <a href="results.html">Results</a>
                                <a href="downloads.html">Downloads</a>
                            </div>
                        </div>

                        <div class="nav-dropdown">
                            <a href="campus.html">Campus ▾</a>
                            <div class="dropdown-menu">
                                <a href="campus.html">Facilities</a>
                                <a href="activities.html">Activities</a>
                                <a href="sports.html">Sports</a>
                                <a href="gallery.html">Gallery</a>
                            </div>
                        </div>

                        <a href="admissions.html">Admissions</a>
                        <a href="notices.html">Notices</a>
                        <a href="contact.html">Contact</a>

                        <a class="login-button" href="login.html">
                            Login
                        </a>
                    </nav>

                    <button
                        class="mobile-menu-button"
                        id="mobileMenuButton"
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded="false"
                        aria-controls="mobileNav"
                    >
                        ☰
                    </button>
                </div>

                <nav
                    class="mobile-nav"
                    id="mobileNav"
                    aria-label="Mobile navigation"
                >
                    <a href="index.html">Home</a>
                    <a href="about.html">About School</a>
                    <a href="vision.html">Vision &amp; Mission</a>
                    <a href="principal.html">Principal's Desk</a>
                    <a href="management.html">Management</a>
                    <a href="faculty.html">Faculty &amp; Staff</a>
                    <a href="academics.html">Academics</a>
                    <a href="results.html">Results</a>
                    <a href="campus.html">Campus</a>
                    <a href="activities.html">Activities</a>
                    <a href="sports.html">Sports</a>
                    <a href="gallery.html">Gallery</a>
                    <a href="admissions.html">Admissions</a>
                    <a href="notices.html">Notices</a>
                    <a href="downloads.html">Downloads</a>
                    <a href="contact.html">Contact</a>
                    <a href="login.html">Login</a>
                </nav>
            </header>
        `;
    }

    function loadFooter() {
        const container =
            document.querySelector("[data-footer]");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <footer class="footer">
                <div class="container footer-grid">

                    <div>
                        <h3>Modern Convent School</h3>
                        <p>
                            Gaighat Reoti, Ballia, Uttar Pradesh
                        </p>
                        <p>
                            English Medium · CBSE
                        </p>
                    </div>

                    <div>
                        <h3>Quick Links</h3>
                        <a href="about.html">About</a>
                        <a href="academics.html">Academics</a>
                        <a href="admissions.html">Admissions</a>
                        <a href="gallery.html">Gallery</a>
                    </div>

                    <div>
                        <h3>Student Zone</h3>
                        <a href="results.html">Results</a>
                        <a href="downloads.html">Downloads</a>
                        <a href="login.html">Student Login</a>
                    </div>

                    <div>
                        <h3>Contact</h3>
                        <p>07784019739</p>
                        <p>09838563972</p>
                        <p>
                            st.modernconventschoolballia@gmail.com
                        </p>
                    </div>
                </div>

                <div class="container copyright">
                    © ${new Date().getFullYear()}
                    Modern Convent School.
                    All Rights Reserved.
                </div>
            </footer>
        `;
    }

    function setupMobileMenu() {
        const button =
            document.getElementById(
                "mobileMenuButton"
            );

        const menu =
            document.getElementById("mobileNav");

        if (!button || !menu) {
            return;
        }

        button.addEventListener(
            "click",
            function () {
                const isOpen =
                    menu.classList.toggle("show");

                button.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
            }
        );
    }

    function highlightCurrentPage() {
        const current =
            location.pathname
                .split("/")
                .pop() ||
            "index.html";

        document.querySelectorAll(
            ".main-nav a"
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
            loadHeader();
            loadFooter();
            setupMobileMenu();
            highlightCurrentPage();
        }
    );
})();
