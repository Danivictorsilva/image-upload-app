class RequestHelper {
    constructor() {
        /**
         * @type {string}
         */
        this.base_url = import.meta.env.VITE_ORIGIN
        /**
         * @type {string}
         */
        this.generate_sas_token_route = import.meta.env.VITE_GENERATE_SAS_TOKEN_ROUTE
        /**
         * @type {string}
         */
        this.confirm_upload_route = import.meta.env.VITE_CONFIRM_UPLOAD_ROUTE
    }

    async getSasToken() {
        try {
            const generateSasResponse = await fetch(
                `${this.base_url}${this.generate_sas_token_route}`,
                {
                    method: 'GET',
                    headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include"
                });

            const responseJson = await generateSasResponse.json()
            console.log(responseJson)

            return new URL(responseJson.sasUrl)
        } catch (error) {
            console.error(error)
        }
    }

    async confirmUpload(filename) {
        try {
            const confirmUploadResponse = await fetch(
                `${this.base_url}${this.confirm_upload_route}`,
                {
                    method: 'POST',
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    credentials: 'include',
                    body: `filename=${filename}`
                });

            const responseJson = await confirmUploadResponse.json()
            console.log(responseJson)

        } catch (error) {
            console.error(error)
        }
    }
}

export const requestHelper = new RequestHelper()