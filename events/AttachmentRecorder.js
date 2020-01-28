module.exports = async (client, message) => {
	var atts = []
	message.attachments.array().forEach(att => {
		var filename = message.id + "." + att.url.split("/").pop().split(".")[1];
		client.download(att.url, { directory: "./cache", filename: filename }, function (err) {
			if (err) client.log("ERROR", `download of attachment ${att.url} failed!`, "recordAttachments");
			else {
				console.log("download successful!");
				if (message.settings.modules.NSFWclassifier.enabled) {
					client.classify(client, message, filename);
				} else {
					setTimeout(() => { client.fs.unlink(`./cache/${filename}`).catch(console.log(err)) })
				}
				if (message.settings.modules.attachmentRecorder.keep) {
					new client.transfer(`./cache/${filename}`)
						.upload().then(function (link) {
							console.log(link);
							client.fs.unlink(`./cache/${filename}`, (err) => {
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
	client.DB.set(message.id, atts, `${message.guild.id}.persistance.attachments`)
	return;
};
module.defaultConfig = {
	enabled: true,
	storageDir: "./cache",
	keep: true,
};