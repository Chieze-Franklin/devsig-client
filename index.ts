import axios, { AxiosInstance } from 'axios';

export class Client {
    constructor(private readonly user: string, private readonly clientToken: string) {
        // TODO: logic to validate token
        this.ax = axios.create({
            baseURL: this.RECORD_SAVE_URL,
            headers: {
                'x-devsig-client-token': clientToken
            }
        });
    }

    private ax: AxiosInstance;
    private RECORD_SAVE_URL: string = 'https://europe-west1-devsig.cloudfunctions.net/Records_save';

    async send(metric: string, value: number) {
        // include token in header
        try {
            const data = await this.ax.post('/', {
                email: this.user,
                metric,
                value
            });
            return ({
                data
            });
        } catch (error) {
            return ({
                error: {
                    message: error.message
                }
            });
        }
    }
}