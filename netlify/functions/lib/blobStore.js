/**
 * Netlify Blobs con connectLambda(event).
 */

const { connectLambda, getStore } = require('@netlify/blobs');
const { STORE_NAME } = require('./proEntitlementLogic.js');

/**
 * @param {import('@netlify/functions').HandlerEvent} event
 */
function getProStore(event) {
  connectLambda(event);
  return getStore(STORE_NAME);
}

module.exports = { getProStore };
