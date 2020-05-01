/**
 * triggered when a guild get updated - eg new channel(s), config changes, etc.
 * only used for debugging right now.
 * @param {object} client
 * @param {object} oldSvr - Object of the server before the update
 * @param {object} newSvr - Object of the server after the update.
 */
module.exports = (client, oldSvr, newSvr) => {
	//debug stub that logs the change to the guild Object.
	client.log(`Guild has been updated: ${JSON.stringify(client.diff(oldSvr, newSvr))}`);
};