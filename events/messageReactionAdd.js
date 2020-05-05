/**
 * triggered whenever a message is reacted to.
 * mainly used for debug, but will be used for features in the future.
 * @param {object} client
 * @param {object} messageReaction - Object containing the reaction that was added to the message
 * @param {object} user - object of the user that added the reaction.
 */
module.exports = async (client, messageReaction, user) => {
	//partial resolver - for uncached data. not yet useful due to Overlord running on a lower API Version.
	if (messageReaction.partial) {
		await messageReaction.fetch().catch(err => {
			client.log(err, "ERROR")
			return
		})
	}
	client.log(`reaction "${messageReaction.emoji.name}:${messageReaction.emoji.identifier}" added to message with ID ${messageReaction.message.id} by user ${user.id}`);
	return;
}