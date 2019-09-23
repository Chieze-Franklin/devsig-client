import axios from 'axios';
import Axios from 'axios';

export class Client {
    constructor(private readonly user: string, private readonly clientToken: string) {
        // TODO: logic to validate token
    }
    private RECORD_SAVE_URL: string = 'https://europe-west1-devsig.cloudfunctions.net/Records_save';

    async send(metric: string, value: number) {
        // include token in header
        try {
            const data = await axios.post('/', {
                email: this.user,
                metric,
                value
            }, {
                baseURL: this.RECORD_SAVE_URL
            });
            return ({
                data
            });
        } catch (error) {
            return ({
                error
            });
        }
    }
}