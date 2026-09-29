/*
 * Modern Convent School
 * Google Apps Script API client.
 *
 * The browser never stores Google Sheet records locally.
 * All management data is requested from the server.
 */
(function () {
    "use strict";

    function configured() {
        const url =
            API_CONFIG.GOOGLE_APPS_SCRIPT_URL || "";

        return (
            url.trim() !== "" &&
            !url.includes("PASTE_YOUR_") &&
            /^https:\/\/script\.google\.com\/macros\/s\//i.test(url)
        );
    }

    function getSessionToken() {
        if (!window.MCSAuth) {
            return "";
        }

        const session = MCSAuth.getSession();

        if (!session) {
            return "";
        }

        return String(
            session.token ||
            session.sessionToken ||
            ""
        );
    }

    function buildPayload(payload) {
        const result = {
            ...(payload || {})
        };

        /*
         * The backend can validate this token before processing
         * any protected action. Do not send passwords after login.
         */
        const token = getSessionToken();

        if (token) {
            result.sessionToken = token;
        }

        return result;
    }

    async function request(
        action,
        payload = {},
        method = "POST"
    ) {
        if (!configured()) {
            throw new Error(
                "Google Apps Script API URL is not configured."
            );
        }

        if (!action) {
            throw new Error(
                "API action is required."
            );
        }

        const url =
            API_CONFIG.GOOGLE_APPS_SCRIPT_URL;

        const controller =
            new AbortController();

        const timeoutId =
            setTimeout(
                function () {
                    controller.abort();
                },
                API_CONFIG.timeout || 30000
            );

        try {
            let response;

            if (method === "GET") {
                const requestUrl =
                    new URL(url);

                requestUrl.searchParams.set(
                    "action",
                    action
                );

                Object.entries(
                    buildPayload(payload)
                ).forEach(function ([key, value]) {
                    requestUrl.searchParams.set(
                        key,
                        typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)
                    );
                });

                response = await fetch(
                    requestUrl.toString(),
                    {
                        method: "GET",
                        credentials: "omit",
                        cache: "no-store",
                        signal: controller.signal
                    }
                );
            } else {
                response = await fetch(
                    url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8",
                            "Cache-Control":
                                "no-cache"
                        },
                        body: JSON.stringify({
                            action,
                            ...buildPayload(payload)
                        }),
                        credentials: "omit",
                        cache: "no-store",
                        signal: controller.signal
                    }
                );
            }

            const text =
                await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(
                    "The API returned invalid JSON."
                );
            }

            if (
                !response.ok ||
                data.success === false
            ) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `API request failed (${response.status}).`
                );
            }

            return data.data !== undefined
                ? data.data
                : data;
        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "The request timed out. Please try again."
                );
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    window.MCSApi = Object.freeze({
        configured,
        request,
        get: function (action, payload) {
            return request(
                action,
                payload,
                "GET"
            );
        },
        post: function (action, payload) {
            return request(
                action,
                payload,
                "POST"
            );
        }
    });
})();
