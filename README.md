## 🚀 Project Blueprint: The Flash Auction Engine

## Phase 2:

For more information about the project, check out the [README_PROJECT.md](README_PROJECT.md)

To check test results, click here: [Test results](#test-results)

For phase 1 of the project, check out the [README_PHASE1.md](README_PHASE_1.md)

### 🛠️ The Tech Stack
* Backend: Node.js (Express)
* Primary DB: PostgreSQL (For users, items, and final orders)
* Redis (For real-time updates)
* Frontend: Angular (For the UI)

### Requirements
* Node.js (Express) 
* PostgreSQL (DB)
* Redis (Cache)
* Angular (Frontend)
* Postman (For testing)

### 🎯 Goal

Handle the "Bidding War."

* Pattern: Atomic Counters. Move the "Current High Bid" from SQL to Redis.
* Logic: Use a Lua script in Redis to check if new_bid > current_high_bid. If yes, update it in one atomic step.
* Real-time: Use WebSockets to broadcast the new high bid to all connected users instantly.
* Challenge: Implement Debouncing on the frontend so a user can't spam the API faster than the network can handle.

### Run the app


`Base URL`: http://localhost:3000/api/v1


#### Local environment

Navigate to `backend` project folder, and run the following commands:

##### Backend
1. Run `npm install` to install dependencies.
2. Run `npm start` to start the app.

The app will be available at http://localhost:3000 (unless process env variables are changed).

`Swagger URL`: http://localhost:3000/api/v1/docs
`WebSocket URL`: http://localhost:3000/api/v1/ws

```
|**********************|
|* !!! !!!!!!!!! !!!  *|
|* !!! IMPORTANT !!!  *|
|* !!! !!!!!!!!! !!!  *|
|**********************|
```

You should also setup and Redis instance.
You can use Docker to run Redis or install it locally.

Once you have Redis running, you need to set a password for it.
You can do this by running the following commands:
```
redis-cli
```
Once inside the redis-cli, run the following command:
```
ACL SETUSER redisuser on >redissecretpassword ~* &* +@all
```
_Note: You can change the username and password to whatever you want, based on your .env file._

- To exit redis-cli.
```
exit
```
Or in one line: 
```
redis-cli ACL SETUSER redisuser on >redissecretpassword ~* &* +@all
```

- To flush all (delete all keys) redis cache: 
```
redis-cli FLUSHALL
```

##### Frontend
Navigate to `frontend` project folder, and run the following commands:
    1. Run `npm install` to install dependencies.
    2. Run `npm start` to start the app.

The app will be available at http://localhost:4200 (unless process env variables are changed).

#### Docker environment

1. Run `docker-compose up` to start the app.

   (add `-d` to run in detached mode)

2. Run `docker-compose down` to stop the app.

   (add `-v` to remove volumes also)

`Docker Compose` will start:
- Frontend (http://localhost:4200)
- Backend server (http://localhost:3000)
- Database server
- MQ server
- Redis server
- Artillery server

If you want to test different scenarios, you should change in docker-composer.yml file `BUILD` environment variable in backend service.  

The frontend app will be available at http://localhost:4200 (unless process env variables are changed).

The backend app will be available at http://localhost:3000 (unless process env variables are changed).

#### Endpoints 
You can see the endpoints by running app, and then navigate to http://localhost:3000/api/v1/docs which will present swagger documentation.

With swagger documentation, you can try out the endpoints.

The endpoints are:
`Auth`
* `POST` /auth - Login with email and password

`User`
* `GET` /user/all – List all users
* `GET` /user – Get user by id
* `POST` /user – Create the new user
* `PUT` /user – Update user based on id
* `DELETE` /user – Delete user based on id

`Item`
* `GET` /item/all – List all items
* `GET` /item/:id – Get item by id
* `POST` /item – Create the new item
* `PUT` /item/:id – Update item based on id
* `DELETE` /item/:id – Delete item based on id

`Bid`
* `POST` /bid – Bid on item

`Websocket`
* `WSS` /ws – Connect to websocket

![Endpoint Documentation](img_1.png)

### Test results

#### normal build

The test simulated nearly 85,000 users over a 90-second duration.

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 84,750 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 11,123 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 73,627 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 1048 req/s | The average number of requests per second. |
| **Peak Request Rate** | 2590 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 100.00% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 21.7 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 7 ms | 50% of requests were faster than this. |
| **p95** | 102.5 ms | 95% of requests were faster than this. |
| **p99** | 172.5 ms | 99% of requests were faster than this. |
| **Max Latency** | 1059 ms | The single slowest response recorded. |


#### redis build

The test simulated nearly 85,000 users over a 90-second duration.

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 84,750 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 12,383 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 72,367 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 903 req/s | The average number of requests per second. |
| **Peak Request Rate** | 2747 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 100.00% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 30.2 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 7.9 ms | 50% of requests were faster than this. |
| **p95** | 138.4 ms | 95% of requests were faster than this. |
| **p99** | 273.2 ms | 99% of requests were faster than this. |
| **Max Latency** | 388 ms | The single slowest response recorded. |

#### mq build 

The test simulated nearly 85,000 users over a 90-second duration.

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 84,750 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 84,732 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 18 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 904 req/s | The average number of requests per second. |
| **Peak Request Rate** | 2391 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 100.00% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 55.0 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 47 ms | 50% of requests were faster than this. |
| **p95** | 147 ms | 95% of requests were faster than this. |
| **p99** | 210.6 ms | 99% of requests were faster than this. |
| **Max Latency** | 524 ms | The single slowest response recorded. |

#### Comparison table

| Metric | Normal (Direct) | Redis (Cached) | MQ (Async) |
| :--- | :---: | :---: | :---: |
| **Total Requests** | 84,750 | 84,750 | 84,750 |
| **HTTP 200 (OK)** | 11,123 | 12,383 | 84,732 |
| **HTTP 202 (Accepted)** | 73,627 | 72,367 | 18 |
| **Avg. Request Rate** | 1048 req/s | 903 req/s | 904 req/s |
| **Peak Request Rate** | 2590 req/s | 2747 req/s | 2391 req/s |
| **Success Rate** | 100.00% | 100.00% | 100.00% |
| **Avg. Response Time** | 21.7 ms | 30.2 ms | 55.0 ms |
| **p50 (Median)** | 7 ms | 7.9 ms | 47 ms |
| **p95** | 102.5 ms | 138.4 ms | 147 ms |
| **p99** | 172.5 ms | 273.2 ms | 210.6 ms |
| **Max Latency** | 1059 ms | 388 ms | 524 ms |

#### _NOTE*_
While the Normal (Direct Postgres) implementation shows a higher Peak RPS and lower median latency in this specific test, it is important to note the following:

Synthetic Speed vs. Durability: The 'Normal' path relies on immediate acceptance (202). In a production spike, direct-to-DB writes are vulnerable to Connection Exhaustion and Disk I/O Wait, which can lead to a total system collapse once a certain threshold is crossed.

The MQ Advantage: The MQ (Asynchronous) architecture shows slightly lower peak throughput due to the overhead of the message broker. However, it provides Backpressure Protection. It ensures that the database is never overwhelmed, guaranteeing 100% data integrity and system availability during extreme traffic surges that would otherwise crash a direct-write system.

Conclusion: The 'Normal' architecture is optimized for latency in low-to-mid load, while the 'MQ' architecture is optimized for reliability and survivability at massive scale.
