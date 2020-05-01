/**
 * triggered whenever a message still in the bot's cache is deleted by a user. logs the deleted message.
 * @param {object} client
 * @param {object} message
 */
module.exports = async (client, message) => {
	//check that the author of the deleted message wasn't a bot.
	if (message.author.bot || !message.guild) return;
	//if disabled, stop execution.
	if (!client.DB.get(message.guild.id).modules.messageDelete.enabled) return
	let entry = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE" })
		.then(audit => audit.entries.first());
	//get the audit log entries and find the latest MESSAGE_DELETE entry.
	//- executor is the person who deleted the message in this case
	let executor = ""; //eslint-disable-line 
	if (entry != undefined
		&& (entry.extra.channel.id === message.channel.id)
		&& (entry.target.id === message.author.id)
		&& (entry.createdTimestamp > (Date.now() - 15000))
		&& (entry.extra.count >= 1)) {
		//if this passes, then the person who deleted the message is the executor.
		//check that the executor is not a bot
		if (executor.bot) { return }
		//notification of discrepancy in author and executor.
		executor = `${entry.executor} - Original Author is ${message.author}`
	} else {
		//if not, we have to assume it was the author of the message.
		executor = message.author
	}
	//action object generated for processing.
	let action = {
		title: `Message deleted in ${message.channel} by ${executor}.`,
		type: "audit",
		change: "deleted",
		data: message.content,
		attachments: [],
		executor: "",
		guildID: message.guild.id,
	}
	if (message.attachments) {
		try {
			//get the saved attachments (if they exist) from the DB.
			action.attachments = (
				client.DB.get(message.guild.id, `persistence.attachments.${message.id}`)
					.attachments || [])
		} catch (err) {
			client.log("message had no attachments")
		}
	}
	//pass the action object to modActions for processing.
	client.emit("modActions", action)
};

module.exports.defaultConfig = {
	enabled: true,
	requiredPermissions: ["VIEW_AUDIT_LOG"],
}
