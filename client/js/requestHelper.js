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
        console.log(this.base_url)
        const generateSasResponse = await fetch(
            `${this.base_url}${this.generate_sas_token_route}`,
            {
                method: 'GET',
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
            });

        const responseJson = await generateSasResponse.json()

        return new URL(responseJson.sasUrl)
    }

    confirmUpload(filename) {
        const settings = {
            "crossDomain": true,
            "url": `${this.base_url}${this.confirm_upload_route}`,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "processData": false,
            "data": JSON.stringify({ "filename": `${filename}` })
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }
}

export const requestHelper = new RequestHelper()