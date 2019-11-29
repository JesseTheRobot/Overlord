/**Dependancy Import and initialisation */
const Discord = require("discord.js");
const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: -1, messageCacheLifetime: 0, messageSweepInterval: 0, fetchAllMembers: true });
client.download = require("download-file");


const readImage = async (path) => {
	const imageBuffer = fs.readFileSync(path);
	const tfimage = tf.node.decodeImage(imageBuffer, undefined, undefined, false);
	return tfimage;
}

client.on("ready", () => {
	console.log("ready!")
})
var initmodel = async (client) => {
	client.model = await load("file://./model/")
}

initmodel(client).then(() => {
	client.login("NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g");
})


var classify = async (client, img) => {
	readImage(`./cache/${img}`).then(image => {
		client.model.classify(image, 3).then(predictions => {
			console.log(JSON.stringify(predictions))
			return predictions
			//return (`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`)
		}).catch(function (err) { console.log(err); });
	})
}


client.on("message", (message) => {
	console.log(message.content)
	console.log(message)
	message.attachments.array().forEach(att => {
		var fname = message.id + "." + att.url.split("/").pop().split(".")[1]
		client.download(att.url, { directory: "./cache", filename: fname }, function (err) {
			if (err) client.log("ERROR", `download of attachment ${att.url} failed!`, "recordAttachments");
			else {
				console.log("download successful!");
				console.log(fname)
				classify(client, fname).then(response => {
					console.log(response)
					message.reply(`results: ${JSON.stringify(response)}`)
				})

			}
		})
	})
})