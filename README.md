# devsig-client
Client module for pushing data to the devsig server.

## Getting Started

### Installing

Using npm:
```bash
npm i devsig-client
```

Using yarn:
```bash
yarn add devsig-client
```

### Importing

Using require:
```js
const { Client } = require('devsig-client');
```

Using import:
```js
import { Client } from 'devsig-client';
```

### Initializing

Initialize one instance per user. Supply the user's email and the client token to the constructor.
```js
const client = new Client('user1@email.com', 'client-token');
```

After this you can start sending the user's metrics to the server.
```js
client.send('network.download_speed', 12.95);
```

### Getting the client token

Reach out to the LearnTech team to generate a client token.

## API

`devsig-client` implements a [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface), meaning you call chain method calls together.
```js
client.send('network.download_speed', 12.95).send('network.upload_speed', 5.94);
```

Note that chaining method calls together has exactly the same effect as calling those methods one at a time. This snippet:
```js
client
    .period('minute')
    .send('network.download_speed', 12.95)
    .date('2019-09-25T13:30:00.000Z')
    .period('hour')
    .send('network.upload_speed', 5.94);
```
can be rewritten as
```js
client.period('minute');
client.send('network.download_speed', 12.95);
client.date('2019-09-25T13:30:00.000Z');
client.period('hour');
client.send('network.upload_speed', 5.94);
```

### client.send(metric: string, value: number, cb?: Callback): Client

This method sends a record of a metric to the server.

#### parameters
- **metric**  
This is a `string` parameter that represents the name of the metric being measured.

- **value**  
This is a `number` parameter that represents the value of the metric being measured.

- **cb**  
This is an optional `Callback` parameter for passing in custom user logic to run after the record has been sent to the server.

```ts
export type Callback = (error?: Error, result?: Result) => {}
export type Result = {
    data?: any,
    error?: any
}
```
It represents a function that accepts an `Error` object (if the operation fails to send the record to the server) and a `Result` object (if the operation successfully sends the record to the server). Both objects cannot be present simultaneously; if one is present then the other is `undefined`.

Note that `result` is what is gotten back from the server, and will contain the following fields:
    - **data:** if the record was successfully saved in the database
    - **error:** if the record could not be saved in the database (probably because the client isn't authorized to do that)

#### example
```js
client
    .send('network.download_speed', 12.95)
    .send('network.upload_speed', 5.94, (error, result) => {
        if (result) {
            console.log('result from the server is:');
            console.log(result);
        }
    });
```

### date(date?: Date | string): Client

This method sets the date to be attached to a record. Each record has a `date` field. By default this is the actual date the record was created in the database. However, sometimes you may want to back-date a record. A use case is during weekly uploads of records on a Friday. Even though all records will be created at that date (as seen in the `createTime` field), you may want to back-date some records to reflect the actual time they were generated.

#### parameters
- **date**  
This is a `Date` or `string` parameter that represents the date to be assigned to records.

#### example
```js
client
    .date('2019-09-25T13:30:00.000Z')
    .send('network.download_speed', 12.95)
    .date(new Date(2019, 8, 25, 14, 30, 0, 0))
    .send('network.upload_speed', 5.94);
```

### period(period?: Period): Client

A period is a time duration within which all records of a metric for a user have the same `value` (and `date`). Supported periods are:
```ts
export type Period = 'minute' | 'hour' | 'day' | 'month' | 'year';
```

For example, to set the values of all `network.download_speed` records for the day to `20`:
```js
client
    .period('day')
    .send('network.download_speed', 20);
```

To set the values of all `network.download_speed` records for a specific date to `20`, supply the date using the `date` function:
```js
client
    .date('2019-09-25T13:30:00.000Z')
    .period('day')
    .send('network.download_speed', 20);
```

Why should you use this? There are metrics you want to record once a day for a user. Imagine a metric like `calls_per_day` which represents the number of calls a user has per day. You don't want to store multiple records of this metric for a user in a day. That's what the `period` function does. The first time the record is sent to the server within that day, that record is saved to the database. Every other time that record is sent within that day, no new record is saved to the database. Instead, the existing record in the database is updated with the `value` (and `date`) of the incoming record.
```js
client
    .period('day')
    .send('calls_per_day', 20); // first call creates a new record in the database

client
    .period('day')
    .send('calls_per_day', 30); // next call updates the record from '20' to '30'
```

The same logic applies for other periods: `minute`, `hour`, `month`, `year`.
```js
// although this loop is infinite only 1 record of 'calls_per_day'
// for the current user will be created every hour
let calls = 1;
while (true) {
    client
        .period('hour')
        .send('calls_per_day', calls++);
}
```

### reset(): Client

Each instance of the devsig client is mutable; calling functions like `date` and `period` changes the internal state of that instance. To return the instance back to its default state, call the `reset` function.
```js
client
    .send('calls_per_day', 10); // creates a new record of 'calls_per_day' in the database
    .send('calls_per_day', 20); // creates a new record of 'calls_per_day' in the database
    .period('minute')           // modifies state
    .send('calls_per_day', 30); // updates all records of 'calls_per_day' created in this minute
    .reset()                    // returns state back to normal
    .send('calls_per_day', 40); // creates a new record of 'calls_per_day' in the database
```
