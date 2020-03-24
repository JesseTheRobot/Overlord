module.exports = async (client, messageReaction, user, basedir) => {
	client.log(`reaction "${messageReaction.emoji.name}:${messageReaction.emoji.identifier}" added to message with ID ${messageReaction.message.id} by user ${user.id} at time ${new Date()}`);
	return;
	//messages keyed by Uid, properties : Time (s) from the startdate before it 'expires' (can use messag.createdat to get post time).
	//action ( what will be done with either outcome - pass or fail (esecustion of the function/module etc --> can be compressed code.).) 
	//isAdminOverridable: whether an admin reaction overrides the 'voting' procedure
}