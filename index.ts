import axios, { AxiosInstance, AxiosResponse } from 'axios';

export type Callback = (error?: Error, result?: Result) => {}
export type Options = {
    date?: Date
    period?: Period
}
export type Period = 'minute' | 'hour' | 'day' | 'month' | 'year';
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
    private config: Options = {};
    private PATH: string = '/';
    private QS: string = '';
    private RECORD_SAVE_URL: string = 'https://europe-west1-devsig.cloudfunctions.net/Records_save';
    private RECORD_SAVE_IN_PERIOD_URL: string = 'https://europe-west1-devsig.cloudfunctions.net/Records_saveInPeriod';

    date(date?: Date | string): Client {
        if (date instanceof Date) {
            this.config.date = date;
        } else if (typeof date == 'string') {
            this.config.date = new Date(date);
        }
        return this;
    }
    options(config: Options): Client {
        this.config = config || this.config;
        return this.date(this.config.date)
            .period(this.config.period);
    }
    period(period?: Period): Client {
        this.config.period = period;
        if (period) {
            this.ax.defaults.baseURL = this.RECORD_SAVE_IN_PERIOD_URL;
            this.QS = `?period=${period}`;
        }
        return this;
    }
    reset(): Client {
        this.ax.defaults.baseURL = this.RECORD_SAVE_URL;
        this.config = {};
        this.PATH = '/';
        this.QS = '';
        return this;
    }
    send(metric: string, value: number, cb?: Callback): Client {
        this.ax.post(`${this.PATH}${this.QS}`, {
            email: this.user,
            metric,
            value,
            date: this.config.date
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