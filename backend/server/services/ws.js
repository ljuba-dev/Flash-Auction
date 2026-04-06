import { wsClients } from '../app.js';

/**
 * Broadcast message to all connected clients
 * @param {string} message
 **/
function broadcast(message) {
  if (wsClients) {
    for (const client of Object.values(wsClients)) {
      client.send(message);
    }
  }
}
/**
 * Send a message to a specific user
 * @param {number} userId
 * @param {string} message
 **/

function sendToUser(userId, message) {
  if (wsClients) {
    const client = wsClients[userId];
    if (client) {
      client.send(message);
    }
  }
}
/**
 * Send a message to a specific group
 * @param {number} groupId
 * @param {string} message
 **/

function sendToGroup(groupId, message) {
  if (wsClients) {
    for (const client of Object.values(wsClients)) {
      if (client.groupId === groupId) {
        client.send(message);
      }
    }
  }
}

export { broadcast, sendToUser, sendToGroup };
