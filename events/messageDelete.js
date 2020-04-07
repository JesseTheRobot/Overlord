module.exports = async (client, message) => {
	if (message.author.bot) return;
	if (!client.DB.get(message.guild.id).modules.messageDelete.enabled) return
	let entry = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE" }).then(audit => audit.entries.first());
	let executor = ""; //eslint-disable-line
	if (entry != undefined
		&& (entry.extra.channel.id === message.channel.id)
		&& (entry.target.id === message.author.id)
		&& (entry.createdTimestamp > (Date.now() - 15000))
		&& (entry.extra.count >= 1)) {
		executor = `${entry.executor} - Original Author is ${message.author}`
	} else {
		executor = message.author
	}

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
			action.attachments = (client.DB.get(message.guild.id, `persistence.attachments.${message.id}`).attachments || [])
		} catch (err) {
			client.log("message had no attachments")
		}
	}
	client.emit("modActions", action)
};

module.exports.defaultConfig = {
	enabled: true,
	requiredPermissions: ["VIEW_AUDIT_LOG"],
}
