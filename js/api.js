window.MCSApi = {

    configured() {
        const url = API_CONFIG.GOOGLE_APPS_SCRIPT_URL || "";

        return (
            url.trim() !== "" &&
            !url.includes("YOUR_ACTUAL")
        );
    },


    getSession() {
        try {
            const value =
                sessionStorage.getItem("MCS_SESSION");

            return value
                ? JSON.parse(value)
                : null;

        } catch (error) {
            return null;
        }
    },


    async request(action, payload = {}, method = "POST") {

        if (!this.configured()) {
            throw new Error(
                "Google Apps Script API URL is not configured."
            );
        }


        const session = this.getSession();

        const requestData = {
            ...payload
        };


        // Add login session to authenticated requests.
        if (session && session.token) {
            requestData.sessionToken = session.token;
        }


        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                API_CONFIG.timeout
            );


        try {

            let response;


            if (method === "GET") {

                const requestUrl =
                    new URL(
                        API_CONFIG.GOOGLE_APPS_SCRIPT_URL
                    );

                requestUrl.searchParams.set(
                    "action",
                    action
                );


                Object.entries(requestData).forEach(
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
                            signal: controller.signal
                        }
                    );

            } else {

                response =
                    await fetch(
                        API_CONFIG.GOOGLE_APPS_SCRIPT_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body: JSON.stringify({
                                action: action,
                                ...requestData
                            }),

                            redirect: "follow",

                            signal:
                                controller.signal
                        }
                    );
            }


            const text =
                await response.text();


            if (!text) {
                throw new Error(
                    "Google Apps Script returned an empty response."
                );
            }


            let result;


            try {
                result = JSON.parse(text);

            } catch (error) {

                console.error(
                    "Raw API response:",
                    text
                );

                throw new Error(
                    "Google Apps Script returned invalid JSON."
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

        } catch (error) {

            if (
                error.name === "AbortError"
            ) {

                throw new Error(
                    "API request timed out."
                );
            }

            throw error;

        } finally {

            clearTimeout(timeout);

        }
    },


    get(action, payload = {}) {
        return this.request(
            action,
            payload,
            "GET"
        );
    },


    post(action, payload = {}) {
        return this.request(
            action,
            payload,
            "POST"
        );
    }
};
