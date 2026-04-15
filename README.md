## 🚀 Project Blueprint: The Flash Auction Engine

## Phase 2:

For more information about the project, check out the [README_PROJECT.md](README_PROJECT.md)

To check test results, click here: [Test results](#test-results)

For phase 1 of the project, check out the [README_PHASE1.md](README_PHASE_1.md)

### 🛠️ The Tech Stack
* Backend: Node.js (Express)
* Primary DB: PostgreSQL (For users, items, and final orders)
* Redis (For real-time updates)
* RabbitMQ (For asynchronous communication)
* Frontend: Angular (For the UI)

### Requirements
* Node.js (Express) 
* PostgreSQL (DB)
* Redis (Cache)
* Angular (Frontend)
* Docker (For local environment)
* Artillery (For testing)
* RabbitMQ (For asynchronous communication)

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
- Artillery server (which will run if `RUN_TESTS` is set to `true` in .env file)

If you want to test different scenarios, you should change in .env file `BUILD_NAME` (options are: `normal`, `redis`, `mq`).

The frontend app will be available at http://localhost:4200 (unless process env variables are changed).

The backend app will be available at http://localhost:3000 (unless process env variables are changed).

If you want to run tests automatically, when building docker-compose, you should change in .env file `RUN_TESTS` environment variable to `true`.

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

This test suite is designed to measure the impact of extreme, real-time traffic spikes on our bidding infrastructure. By simulating a "Flash Auction" scenario, we aim to validate the resilience of our decoupled architecture and determine its true operational limits.

This test isn't just about speed; it's about Predictable Performance. We are achieving a clear understanding of our system's "Breaking Point" so we can guarantee 100% uptime and data integrity during the highest-value moments of our platform’s lifecycle.
#### normal build

##### Test Overview
This test evaluates the standard architectural pattern where the API communicates directly with the PostgreSQL database for every bid operation.
**Test Duration:** 14m 2s

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 2,295,332 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 1,393,455 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 0 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 564 req/s | The average number of requests per second. |
| **Peak Request Rate** | 5398 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 60.71% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 140.8 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 122.7 ms | 50% of requests were faster than this. |
| **p95** | 391.6 ms | 95% of requests were faster than this. |
| **p99** | 671.9 ms | 99% of requests were faster than this. |
| **Max Latency** | 2684 ms | The single slowest response recorded. |

##### Error Analysis
- **ETIMEDOUT (864,011):** Massive database connection timeouts as the pool was exhausted by row-level locking.
- **EADDRNOTAVAIL (37,866):** OS level port exhaustion due to high socket churn.

##### Conclusion
The Direct SQL architecture experienced a complete system collapse. With a 40% failure rate, this pattern is unsuitable for high-concurrency auction events.


#### redis build

##### Test Overview
This test utilizes an in-memory Redis layer with Lua scripts to handle bidding logic atomically before any database interaction.
**Test Duration:** 12m 53s

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 2,295,332 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 1,313,930 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 0 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 760 req/s | The average number of requests per second. |
| **Peak Request Rate** | 6864 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 57.24% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 163.5 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 149.9 ms | 50% of requests were faster than this. |
| **p95** | 415.8 ms | 95% of requests were faster than this. |
| **p99** | 671.9 ms | 99% of requests were faster than this. |
| **Max Latency** | 3061 ms | The single slowest response recorded. |

##### Error Analysis
- **ETIMEDOUT (925,870):** Despite the faster memory logic, the synchronous nature of the requests blocked the API, leading to massive timeouts.
- **EADDRNOTAVAIL (55,532):** Connection limits reached due to high concurrency.

##### Conclusion
While the processing logic was faster, the architecture still suffered from "synchronous bottlenecking," resulting in significant data loss during peak spikes.

#### mq build 

##### Test Overview
This is a fully decoupled architecture. The API performs an atomic check in Redis and immediately hands off the workload to RabbitMQ.
**Test Duration:** 15m 47s

| Metric | Result | Description |
| :--- | :--- | :--- |
| **Total Requests** | 2,295,332 | The total number of HTTP requests sent. |
| **HTTP 200 (OK)** | 27 | Requests processed and completed successfully. |
| **HTTP 202 (Accepted)** | 2,295,305 | Requests accepted for processing (Asynchronous). |
| **Avg. Request Rate** | 811 req/s | The average number of requests per second. |
| **Peak Request Rate** | 3572 req/s | The maximum throughput achieved during the test. |
| **Success Rate** | 100.00% | The percentage of requests that returned a 2xx code. |
| **Avg. Response Time** | 222.8 ms | The mean time taken for the server to respond. |
| **p50 (Median)** | 206.5 ms | 50% of requests were faster than this. |
| **p95** | 507.8 ms | 95% of requests were faster than this. |
| **p99** | 699.4 ms | 99% of requests were faster than this. |
| **Max Latency** | 1437 ms | The single slowest response recorded. |

##### Error Analysis
- **None:** The system maintained 100% availability. RabbitMQ acted as a buffer, preventing the API from reaching timeout limits.

##### Conclusion
This architecture is the only design that successfully captured every single bid. By decoupled ingestion from processing, we achieved absolute reliability at scale.

#### Comparison table

##### Performance Comparison
**Test Scope:** 2,295,332 Requests per Architecture

| Metric | Normal (Direct) | Redis + Lua | MQ + Redis + Lua |
| :--- | :--- | :--- | :--- |
| **Total Requests** | 2,295,332 | 2,295,332 | 2,295,332 |
| **Success Rate** | 60.71% | 57.24% | **100.00%** |
| **Total Errors** | 901,877 | 981,402 | **0** |
| **Peak Request Rate**| 5398 req/s | 6864 req/s | 3572 req/s |
| **Avg. Response Time**| 140.8 ms | 163.5 ms | 222.8 ms |
| **Apdex Score** | 0.33 | 0.18 | **0.42** |

##### Critical Findings
- **Data Retention:** The MQ architecture is mandatory for zero-loss scenarios. The other two architectures lost nearly 1 million bids each.
- **Reliability vs. Latency:** While MQ has a higher response time (222ms vs 140ms), it is the only architecture that is actually "available" at this scale.
- **System Resilience:** The MQ stack never hit port exhaustion, as it was able to clear connections faster by moving work to the background.

##### Final Recommendation
For production-grade real-time bidding, the **MQ + Redis + Lua** pattern is the only sustainable choice.

#### _NOTE*_
While the Normal (Direct Postgres) implementation shows a higher Peak RPS and lower median latency in this specific test, it is important to note the following:

Synthetic Speed vs. Durability: The 'Normal' path relies on immediate acceptance (202). In a production spike, direct-to-DB writes are vulnerable to Connection Exhaustion and Disk I/O Wait, which can lead to a total system collapse once a certain threshold is crossed.

The MQ Advantage: The MQ (Asynchronous) architecture shows slightly lower peak throughput due to the overhead of the message broker. However, it provides Backpressure Protection. It ensures that the database is never overwhelmed, guaranteeing 100% data integrity and system availability during extreme traffic surges that would otherwise crash a direct-write system.

Conclusion: The 'Normal' architecture is optimized for latency in low-to-mid load, while the 'MQ' architecture is optimized for reliability and survivability at massive scale.
