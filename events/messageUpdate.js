module.exports = (client, Message, nMessage) => {
	//const svrconfig = require(`${basedir}/NCBot/UserData.json`);
	async function WebHook(client, message, nMessage, logs) {
		try {
			const date = new Date().toString();
			await logs.fetchWebhooks()
				.then(wbs => {
					let avatar = message.author.avatarURL.substring(0, message.author.avatarURL.length - 4);
					if (wbs.size < 1) {
						var wb = logs.createWebhook("message delete");
					} else {
						var wb = wbs.first(); //eslint-disable-line
					}
					let eun = message.guild.member(nMessage.author).displayName + " (Edited)";
					if (eun.length > 32) {
						eun = "Edited";
					}
					wb.send(`Message edited at time ${(date.split("G"))[0]} in Channel ${nMessage.channel.name} [Jump to Message](<${nMessage.url}>) - \n` + message.content, { username: message.guild.member(message.author).displayName, avatarURL: avatar, embeds: message.embeds, files: message.attachments.array(), split: { maxLength: 2000 } });
					wb.send(nMessage.content, { username: eun, avatarURL: avatar, embeds: nMessage.embeds, split: { maxLength: 2000 } })
						//wb.send(message.content || "", { username: message.author.tag, avatarURL: message.author.avatarURL, embeds: message.embeds, files: message.attachments.array() })
						//.then(() => {
						//m.edit("Message by user " + Discord.Util.escapeMarkdownw(message.author.tag) + " delted from channel" + message.channel.name + " by " + user + " ");
						.catch((e) => {
							console.log(e || "Unknown Error");
						});
				});
		} catch (e) {
			console.log(e);
		}
	}
	try {
		Message.content = Message.cleanContent; //cleans content of the old and new message.
		nMessage.content = nMessage.cleanContent;
		if (Message.content === nMessage.content) {
			//console.log(Message)
			//console.log(nMessage)
			console.log("MessageEdit invoked - message contant identical - assume autoembed"); //if contents are identical, autoembed was most likely triggered.
			return;
		}
		nMessage.guild.fetchMember(nMessage.author)
			.then(member => {
				const logs = nMessage.guild.channels.find(channel => channel.name == "audit-log");
				if (logs == null) {
					console.log(`Server with ID ${Message.guild.id} has no audit log channel!`);
				}
				//logs.send(`user ${member.user.username} updated message with contents "${Message.content}" to "${nMessage.content}" in server/channel ${nMessage.guild.name} , ${nMessage.channel.name} at time ${new Date()}`);
				WebHook(client, Message, nMessage, logs);
			});
	} catch (e) {
		console.log(e);
	}
};
