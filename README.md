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

### client.send(metric: string, value: number)

This method sends a record of a metric to the server.
```js
client.send('network.download_speed', 12.95);
```
