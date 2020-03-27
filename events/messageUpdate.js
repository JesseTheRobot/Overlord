module.exports = (client, Message, nMessage) => {
	nMessage.content = nMessage.cleanContent;
	if (Message.content === nMessage.content) {
		if (nMessage.embeds != Message.embeds) {
			let postEval = nMessage.embeds.filter(embed => embed.type === "image" || embed.type === "video")
		}
	}
	console.log("MessageEdit invoked - message contant identical - assume autoembed"); //if contents are identical, autoembed was most likely triggered.
	return;
}

