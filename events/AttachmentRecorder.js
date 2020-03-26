module.exports = async (client, message) => {
	var modConfig = message.settings.modules.attachmentRecorder
	if (!modConfig.enabled) return
	var atts = []
	var path = modConfig.storageDir
	message.attachments.array().forEach(att => {
		var filename = message.id + "(" + (message.attachments.array().indexOf(att)) + ")" + "." + att.url.split("/").pop().split(".")[1]; //TODO: change this to the last item to prevent errors.
		var filePath = path + filename
		client.download(att.url, { directory: path, filename: filename }, function (err) {
			if (err) client.log(`download of attachment ${att.url} failed!`, "ERROR");
			else {
				client.log("download successful!");
				if (message.settings.modules.NSFWClassifier.enabled) {
					client.emit("NSFWClassifier", client, message, filename);
				}
				if (modConfig.keep) {
					new client.transfer(filePath)
						.upload().then(function (link) {
							client.fs.unlink(filePath, (err) => {
								if (err) {
									client.log(err, "ERROR");
								} else {
									client.log("Unlink successful!");
								}
							});
							atts.push(link)
							client.log(`Upload Sucessful! ${link} `)
							if (modConfig.keep && atts && (message.attachments.array().indexOf(att)) === message.attachments.array().length) {
								client.DB.set(message.guild.id,
									{
										attachments: atts,
										expiry: (new Date()).setDate((new Date()).getDate() + 14)
									},
									`persistence.attachments.${message.id}`)
							}
							return;
						}).catch(function (err) { client.log(err, "ERROR"); });
				}
			}
		});
	});

};
module.exports.defaultConfig = {
	enabled: true,
	storageDir: "./cache/",
	keep: true,
};