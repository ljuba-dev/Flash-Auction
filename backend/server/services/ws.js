import { wsClients } from '../app.js';

/**
 * Broadcast message to all connected clients
 * @param {string} type
 * @param {string} message
 **/
function broadcast(type, message) {
  if (wsClients) {
    for (const client of Object.values(wsClients)) {
      client.emit(type, message);
    }
  }
}
/**
 * Send a message to a specific user
 * @param {number} userId
 * @param {string} type
 * @param {string} message
 **/
function sendToUser(userId, type, message) {
  if (wsClients) {
    const client = wsClients[userId];
    if (client) {
      client.emit(type, message);
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
