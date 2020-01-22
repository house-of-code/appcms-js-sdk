import fetch from 'node-fetch'

export interface AppCMSClientConfig {
    apiKey: string
    baseUrl?: string

}

export class AppCMSClient<Content> {

    private baseURL: string = "https://www.appcms.dk"

    constructor(
        private clientConfig: AppCMSClientConfig
    ) {

        if(clientConfig.baseUrl) {
            this.baseURL = clientConfig.baseUrl
        }

    }

    private generateURL = (endpoint: string, withAPIKey: boolean = true) => {
        let url = `${this.baseURL}`

        if(withAPIKey) {
            url += `/api/${this.clientConfig.apiKey}`
        }

        if(endpoint.charAt(0) !== "/") {
            return `${url}/${endpoint}`
        }

        return `${url}${endpoint}`
    }

    private makeRequest = async (url: string, method="get", data?: any): Promise<Content> => {
        const requestOptions: RequestInit = {
            method,
        }





        switch (method.toLowerCase()) {
            case "post":
            case "patch":
            case 'put':
                requestOptions.method = method
                requestOptions.body = JSON.stringify(data)

                requestOptions.headers = {
                    'content-type': 'application/json'
                }

                break
        }

        console.log(`[Request] init - ${url} - ${method} - ${JSON.stringify(data)} - ${JSON.stringify(requestOptions.headers)}`)


        const response = await fetch(url)
        const contentType = response.headers["content-type"]

        const text = await response.text()

        console.log("Text", text)

        const json = await response.json()


        return json
    }


    get analytics() {
        return {
            log: (event: string, platform: string, deviceId: string, data?: string) => {
                return this.makeRequest(this.generateURL("/analytics/log"), "post", {
                    analytic: {
                        event,
                        platform,
                        device_id: deviceId,
                        data
                    }
                })
            }
        }
    }


    get appConfig() {
        return {
            fetch: () => {
                return this.makeRequest(this.generateURL(`/app_config`))
            }
        }
    }

    get content() {
        return {
            fetch: (locale: string): Promise<Content> => {
                return this.makeRequest(this.generateURL(`/content/${locale}`))
            },
            file: (fileId: string) => {
                return this.makeRequest(this.generateURL(`/content/file/${fileId}`))
            }
        }
    }

}
