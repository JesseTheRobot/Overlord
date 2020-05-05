/**
 * triggered when a member of a guild gets updated, eg they go offline.
 * only really used for debugging.
 * @param {object} client
 * @param {object} oldMem - member object before the update.
 * @param {object} newMem - member object after the update.
 */
module.exports = (client, oldMem, newMem) => {
	//debug stub that logs the change to the member.
	client.log(`member update: ${JSON.stringify(client.diff(oldMem, newMem))}`)
};