module.exports = async (client, message) => {
	var modConfig = message.settings.modules.attachmentRecorder
	if (!modConfig.enabled) return
	var atts = []
	var path = modConfig.storageDir
	message.attachments.array().forEach(att => {
		var filename = message.id + "." + att.url.split("/").pop().split(".")[1]; //TODO: change this to the last item to prevent errors.
		var filePath = path + filename
		client.download(att.url, { directory: path, filename: filename }, function (err) {
			if (err) client.log(`download of attachment ${att.url} failed!`, "ERROR");
			else {
				client.log("download successful!");
				if (modConfig.NSFWclassifier.enabled) {
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
						}).catch(function (err) { client.log(err, "ERROR"); });
				}
			}
		});
	});
	if (modConfig.keep) { client.DB.set(message.id, { attachments: atts, expiry: (new Date().getMilliseconds + (13.5 * 86400000)) }, `${message.guild.id}.persistance.attachments`) }
	return;
};
module.defaultConfig = {
	enabled: true,
	storageDir: "./cache/",
	keep: true,
};