module.exports = (client, Message, nMessage) => {
	if (!Message.guild) return
	if (!client.DB.get(Message.guild.id).modules.messageUpdate.enabled) return
	nMessage.content = nMessage.cleanContent;
	if (Message.content === nMessage.content) {
		client.log("MessageEdit invoked - message content identical - assume autoembed"); //if contents are identical, autoembed was most likely triggered.
		return
	} else {
		let action = {
			title: `Message by ${Message.author} edited in ${Message.channel}.`,
			type: "audit",
			change: "edited",
			data: Message.content,
			edit: nMessage.content,
			attachments: [],
			executor: Message.author,
			guildID: Message.guild.id,
			memberID: Message.author.id
		}
		client.emit("modActions", action)
	}
}
module.exports.defaultConfig = {
	enabled: true,
	requiredPermissions: ["MANAGE_MESSAGES"]
}

