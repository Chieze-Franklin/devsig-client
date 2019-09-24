import axios, { AxiosInstance } from 'axios';

export type Callback = (error?: Error, result?: Result) => {}
export type Options = {}
export type Result = {
    data?: any,
    error?: any
}

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

    options(config: Options): Client {
        return this;
    }
    send(metric: string, value: number, cb?: Callback): Client {
        this.ax.post('/', {
            email: this.user,
            metric,
            value
        }).then(data => {
            if (cb) {
                cb(undefined, { ...data.data });
            }
        }).catch(error => {
            if (cb) {
                cb(error, undefined);
            }
        });
        return this;
    }
}