/**
 * triggered when a message is updated  this (annoyingly) includes the addition of automatic embeds.
 * include other useful changes such as when the content of a message changes.
 * automatically sends data to modActions for reporting.
 * @param {object} client
 * @param {object} Message - original message object
 * @param {object} nMessage - New Message object (changed/updated)
 */
module.exports = (client, Message, nMessage) => {
	if (!Message.guild) return //check that the message is in a guild
	if (!client.DB.get(Message.guild.id).modules.messageUpdate.enabled) return
	//check if reporting edits is enabled.
	nMessage.content = nMessage.cleanContent;
	//clean the content
	if (Message.content === nMessage.content) {
		client.log("messageEdit invoked - message content identical - assume autoembed");
		//if contents are identical, autoembed was most likely triggered.
		//autoembeds are created by discord to show media content in a message.
		return
	} else {
		let action = {//prepare action object
			title: `Message by ${Message.author} edited in ${Message.channel}.`,
			type: "audit",
			change: "edited",
			data: Message.content,
			edit: nMessage.content,
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

