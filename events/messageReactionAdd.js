module.exports = async (client, messageReaction, user) => {
	client.log(`reaction "${messageReaction.emoji.name}:${messageReaction.emoji.identifier}" added to message with ID ${messageReaction.message.id} by user ${user.id}`);
	return;
}