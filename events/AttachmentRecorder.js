module.exports = async (client, message) => {
	var modConfig = message.settings.modules.attachmentRecorder
	if (!modConfig.enabled) return
	var atts = []
	var path = modConfig.storageDir
	message.attachments.array().forEach(att => {
		var filename = message.id + "." + att.url.split("/").pop().split(".")[1];
		var filePath = path + filename
		client.download(att.url, { directory: path, filename: filename }, function (err) {
			if (err) client.log(`download of attachment ${att.url} failed!`, "ERROR");
			else {
				console.log("download successful!");
				if (message.settings.modules.NSFWclassifier.enabled) {
					client.emit("NSFWClassifier", client, message, filename);
				} else {
					setTimeout(() => { client.fs.unlink(filePath).catch(console.log(err)) })
				}
				if (modConfig.keep) {
					new client.transfer(filePath)
						.upload().then(function (link) {
							console.log(link);
							client.fs.unlink(filePath, (err) => {
								if (err) {
									console.log(err);
								} else {
									console.log("Unlink successful!");
								}
							});
							atts.push(link)
						}).catch(function (err) { console.log(err); });
				}
			}
		});
	});
	client.DB.set(message.id, { attachments: atts, expiaryTS: 000 }, `${message.guild.id}.persistance.attachments`)
	return;
};
module.defaultConfig = {
	enabled: true,
	storageDir: "./cache/",
	keep: true,
};