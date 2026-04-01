### 🚀 Project Blueprint: The Flash Auction Engine

## 🎯 The Objective
Build a real-time bidding platform where high-value items go live for 60 seconds. The system must handle 10,000+ concurrent users slamming the "Bid" button without crashing, double-charging, or losing a single bid.

## 🛠️ The Tech Stack
* Backend: Node.js (Express)
* Real-time: Socket.io or WebSockets
* Primary DB: PostgreSQL (For users, items, and final orders)
* High-Speed DB: Redis (For active bid counters and session locking)
* Message Broker: BullMQ (Redis-based) or RabbitMQ
* Load Testing: k6 or Artillery (This is your most important tool)
* Infrastructure: Docker & Docker Compose (To simulate multiple services)

## 🏗️ Phase 1: The "Junior" Foundation
Goal: Make it work for one user.
* Create a basic CRUD for Items and Users.
* Implement a simple POST /bid endpoint that updates a SQL row.
* The Trap: At this stage, your app will work perfectly for you, but it will explode the moment 100 people bid at once.
* 
##  ⚡ Phase 2: The "Mid-Level" Speed Boost
  Goal: Handle the "Bidding War."
* Pattern: Atomic Counters. Move the "Current High Bid" from SQL to Redis.
* Logic: Use a Lua script in Redis to check if new_bid > current_high_bid. If yes, update it in one atomic step.
* Real-time: Use WebSockets to broadcast the new high bid to all connected users instantly.
* Challenge: Implement Debouncing on the frontend so a user can't spam the API faster than the network can handle.
 
## 🛡️ Phase 3: The "Senior" Resilience
  Goal: Survive the crash.
* Pattern: The Load Leveler. When the auction ends, don't update 10,000 "Order" rows in SQL at once. Push the winners into a Message Queue.
* Pattern: Circuit Breaker. Wrap your "Payment Gateway" call. If the payment provider is slow, stop trying and alert the user immediately.
* Pattern: Bulkhead. Ensure that the "Image Upload" service (for new auction items) has its own thread pool so it doesn't slow down the "Bidding" service.
* 
##  ⚖️ Phase 4: The "Architect" Consistency
  Goal: No "Zombie" Data.
* Pattern: The Saga Pattern. Build the checkout flow:
    1. Reserve Item (Inventory)
    2. Charge Card (Payment)
    3. Mark as Sold (Order).
    * If Payment fails, trigger the "Undo" to put the item back in the auction.
* Pattern: Webhook Ingestion. Create a tiny "Nano-service" to receive Stripe payment confirmations and put them in a queue.

##  🔍 Phase 5: The "Lead" Observability
  Goal: Find the Ghost.
* Pattern: Correlation IDs. Add a unique ID to every request. Log it in your "Bidding," "Payment," and "Notification" services.
* The Test: Use k6 to send 1,000 bids/sec. Find the one bid that "vanished" by searching your logs for its ID.

## 🏆 The "Loto" Extra Credit (Optional)
Add a "Lucky 7th" feature: Every 700th successful bid across the entire system gets a 10% discount. This forces you to manage a Global Atomic Counter across multiple Node.js instances.

## 🧪 How to "Pass" the Senior Test
You have successfully moved to the Senior level when you can run this command: k6 run --vus 1000 --duration 60s stress-test.js
And your dashboard shows:
1. 0% Error Rate.
2. Average Response Time < 100ms.
3. Database CPU < 70%.
