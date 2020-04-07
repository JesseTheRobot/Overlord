module.exports = async (client, oMessage) => {
	var modConfig = oMessage.settings.modules.attachmentRecorder
	if (!modConfig.enabled) return
	var atts = []
	var path = modConfig.storageDir
	let getAttachments = (client, message) => {
		let toProcess = []
		toProcess.push(...message.attachments.array().map(attachment => attachment.url))
		toProcess.push(...(message.embeds.filter(embed => embed.type === "image" || embed.type === "video")).map(embeds => embeds.url))
		toProcess.forEach(att => {
			var filename = message.id + "(" + (toProcess.indexOf(att)) + ")" + "." + att.split("/").pop().split(".")[1]; //TODO: change this to the last item to prevent errors.
			var filePath = path + filename
			client.download(att, { directory: path, filename: filename, timeout: 99999999 }, function (err) {
				if (err) client.log(`download of attachment ${att} failed!`, "ERROR");
				else {
					client.log("download successful!");
					if (message.settings.modules.NSFWClassifier.enabled && !modConfig.keep) {
						client.emit("NSFWClassifier", message, filename);
					}
					if (modConfig.keep) {
						client.log("starting upload...")
						new client.transfer(filePath)
							.upload().then(function (link) {
								if (!message.settings.modules.NSFWClassifier.enabled) {
									client.fs.unlink(filePath, (err) => {
										if (err) { client.log(err, "ERROR"); } else { client.log("Unlink successful!"); }
									})
								}
								atts.push(link)
								client.log(`Upload Successful! ${link} `)
								if (modConfig.keep && atts.length === toProcess.length) {
									client.DB.set(message.guild.id, { attachments: atts, expiry: (new Date()).setDate((new Date()).getDate() + 14) }, `persistence.attachments.${message.id}`)
								}
								if (message.settings.modules.NSFWClassifier.enabled) {
									client.emit("NSFWClassifier", message, filename);
								}
							})
					}
				}
			});
		});

	}
	setTimeout(getAttachments, 500, client, oMessage)

};
module.exports.defaultConfig = {
	enabled: true,
	storageDir: "./cache/",
	keep: true,
	requiredPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY", "VIEW_CHANNEL"]
};