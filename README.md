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
