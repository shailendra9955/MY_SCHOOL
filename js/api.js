// ============================================================
// Modern Convent School
// API Communication Layer
// ============================================================

window.MCSApi = {

    // --------------------------------------------------------
    // Check whether API has been configured
    // --------------------------------------------------------

    configured() {

        const url =
            API_CONFIG.GOOGLE_APPS_SCRIPT_URL || "";

        return (
            url.trim() !== "" &&
            !url.includes("PASTE_YOUR_")
        );
    },


    // --------------------------------------------------------
    // Main API Request
    // --------------------------------------------------------

    async request(action, payload = {}, method = "POST") {

        if (!this.configured()) {

            throw new Error(
                "Google Apps Script API URL is not configured. " +
                "Please add it in js/Config.js."
            );
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


            // =================================================
            // GET REQUEST
            // =================================================

            if (method === "GET") {

                const requestUrl =
                    new URL(url);


                requestUrl.searchParams.set(
                    "action",
                    action
                );


                Object.entries(payload).forEach(
                    ([key, value]) => {

                        requestUrl.searchParams.set(
                            key,
                            typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)
                        );

                    }
                );


                response = await fetch(
                    requestUrl.toString(),
                    {
                        method: "GET",
                        redirect: "follow",
                        signal: controller.signal
                    }
                );

            }


            // =================================================
            // POST REQUEST
            // =================================================

            else {

                const requestBody = {

                    action: action,

                    ...payload

                };


                response = await fetch(

                    url,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify(requestBody),

                        redirect: "follow",

                        signal:
                            controller.signal

                    }

                );

            }


            // =================================================
            // READ RESPONSE
            // =================================================

            const responseText =
                await response.text();


            if (!responseText) {

                throw new Error(
                    "The server returned an empty response."
                );
            }


            let result;


            try {

                result =
                    JSON.parse(responseText);

            }

            catch (error) {

                console.error(
                    "Invalid API response:",
                    responseText
                );

                throw new Error(
                    "Google Apps Script returned an invalid response. " +
                    "Check your Apps Script deployment."
                );

            }


            // =================================================
            // API ERROR
            // =================================================

            if (
                !response.ok ||
                result.success === false
            ) {

                throw new Error(

                    result.message ||
                    result.error ||
                    `API request failed (${response.status})`

                );

            }


            // =================================================
            // RETURN DATA
            // =================================================

            if (
                result.data !== undefined
            ) {

                return result.data;

            }


            return result;

        }


        catch (error) {

            if (
                error.name === "AbortError"
            ) {

                throw new Error(
                    "The API request timed out."
                );

            }


            throw error;

        }


        finally {

            clearTimeout(timeout);

        }

    },


    // --------------------------------------------------------
    // GET
    // --------------------------------------------------------

    get(action, payload = {}) {

        return this.request(
            action,
            payload,
            "GET"
        );

    },


    // --------------------------------------------------------
    // POST
    // --------------------------------------------------------

    post(action, payload = {}) {

        return this.request(
            action,
            payload,
            "POST"
        );

    }

};
