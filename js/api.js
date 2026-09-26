// ============================================================
// Modern Convent School
// API CLIENT
// ============================================================

window.MCSApi = {

    configured() {

        const url =
            API_CONFIG.GOOGLE_APPS_SCRIPT_URL || "";

        return (
            url.trim() !== "" &&
            !url.includes("PASTE_YOUR_")
        );

    },


    getSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    "MCS_SESSION"
                );

            return raw
                ? JSON.parse(raw)
                : null;

        } catch (error) {

            return null;

        }

    },


    async request(
        action,
        payload = {},
        method = "POST"
    ) {

        if (!this.configured()) {

            throw new Error(
                "Google Apps Script API URL is not configured."
            );

        }


        const session =
            this.getSession();


        const requestData = {

            ...payload

        };


        // Add current login token automatically.
        if (
            session &&
            session.token
        ) {

            requestData.sessionToken =
                session.token;

        }


        const url =
            API_CONFIG.GOOGLE_APPS_SCRIPT_URL;


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => controller.abort(),
                API_CONFIG.timeout
            );


        try {

            let response;


            if (
                method === "GET"
            ) {

                const requestUrl =
                    new URL(url);


                requestUrl.searchParams.set(
                    "action",
                    action
                );


                Object.entries(
                    requestData
                ).forEach(
                    ([key, value]) => {

                        requestUrl.searchParams.set(

                            key,

                            typeof value === "object"

                                ? JSON.stringify(value)

                                : String(value)

                        );

                    }
                );


                response =
                    await fetch(
                        requestUrl.toString(),
                        {
                            method: "GET",
                            redirect: "follow",
                            signal:
                                controller.signal
                        }
                    );

            } else {

                response =
                    await fetch(

                        url,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "text/plain;charset=utf-8"

                            },

                            body:
                                JSON.stringify({

                                    action:
                                        action,

                                    ...requestData

                                }),

                            redirect:
                                "follow",

                            signal:
                                controller.signal

                        }

                    );

            }


            const responseText =
                await response.text();


            if (!responseText) {

                throw new Error(
                    "The API returned an empty response."
                );

            }


            let result;


            try {

                result =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Raw API response:",
                    responseText
                );

                throw new Error(
                    "API returned invalid JSON."
                );

            }


            if (
                !response.ok ||
                result.success === false
            ) {

                throw new Error(

                    result.message ||
                    result.error ||
                    "API request failed."

                );

            }


            return (
                result.data !== undefined
                    ? result.data
                    : result
            );

        }


        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    "API request timed out."
                );

            }


            throw error;

        }


        finally {

            clearTimeout(
                timeout
            );

        }

    },


    get(
        action,
        payload = {}
    ) {

        return this.request(
            action,
            payload,
            "GET"
        );

    },


    post(
        action,
        payload = {}
    ) {

        return this.request(
            action,
            payload,
            "POST"
        );

    }

};
