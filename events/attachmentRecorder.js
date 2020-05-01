/**
 * detects and downloads any attachments present in a message - detects links via the automated embed system discord uses.
 * uploads and pipes data to NSFWClassifier (optional). attachments used for when a message is deleted.
 * @param {object} client
 * @param {object} Message 
 */
module.exports = async (client, Message) => {
	var modConfig = Message.settings.modules.attachmentRecorder //gets module config
	//checks state
	if (!modConfig.enabled) return
	//''accumulator'' for attachment links
	var atts = []
	//sets the cache path for downloaded files.
	var path = modConfig.storageDir
	/**
	 * downloads all attachments from a given message object - optional piping and storing.
	 * @param {object} client 
	 * @param {object} message 
	 */
	let getAttachments = (client, message) => {
		//array of URL's
		let toProcess = []
		//add any attachments URLs
		toProcess.push(...message.attachments.array().map(attachment => attachment.url))
		//add any  URLs from media Embeds.
		toProcess.push(...(message.embeds.filter(embed => embed.type === "image" || embed.type === "video")).map(embeds => embeds.url))
		//iterate over each URL
		toProcess.forEach(att => {
			//sets the file name  = message.id + a counter
			var filename = message.id + "(" + (toProcess.indexOf(att)) + ")" + "." + att.split("/").pop().split(".")[1];
			//full file path, eg D:/Overlord/cache/445743395557322(0).jpg
			var filePath = path + filename
			//invoke download with almost unlimited timeout.
			client.download(att, { directory: path, filename: filename, timeout: 99999999 }, function (err) {
				if (err) client.log(`download of attachment ${att} failed!`, "ERROR");
				else {
					client.log("download successful!");
					//check if attachments are kept and if NSFWClassifier is enabled.
					if (message.settings.modules.NSFWClassifier.enabled && !modConfig.keep) {
						//pipe data to NSFWClassifier
						client.emit("NSFWClassifier", message, filename);
					}
					//if attachments are configued to be kept..
					if (modConfig.keep) {
						client.log("starting upload...")
						//upload the file to transfer.sh.
						new client.transfer(filePath)
							.upload().then(function (link) {
								//only unlink without NSFWClassifier - as NSFWC deletes the files it classifies anyway.
								if (!message.settings.modules.NSFWClassifier.enabled) {
									client.fs.unlink(filePath, (err) => {
										if (err) { client.log(err, "ERROR"); } else { client.log("Unlink successful!"); }
									})
								}
								//add the link to atts
								atts.push(link)
								client.log(`Upload Successful! ${link} `)
								//check that the attachment is the last one to be processed before writing entry
								if (modConfig.keep && atts.length === toProcess.length) {
									//sets expiry of the attachments to 14 days, which is the expiry of data on transfer.sh.
									client.DB.set(message.guild.id, { attachments: atts, expiry: (new Date()).setDate((new Date()).getDate() + 14) }, `persistence.attachments.${message.id}`)
								}
								if (message.settings.modules.NSFWClassifier.enabled) {
									//run NSFW classifier if attachments are kept.
									client.emit("NSFWClassifier", message, filename);
								}
							})
					}
				}
			});
		});

	}
	//delay to wait for embeds to be automatically generated.
	setTimeout(getAttachments, 500, client, Message)

};
//default configuration for the module.
module.exports.defaultConfig = {
	enabled: true,
	storageDir: "./cache/",
	keep: true,
	requiredPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY", "VIEW_CHANNEL"]
};