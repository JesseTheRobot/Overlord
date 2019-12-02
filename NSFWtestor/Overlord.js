/**Dependancy Import and initialisation */
const Discord = require("discord.js");
const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: -1, messageCacheLifetime: 0, messageSweepInterval: 0, fetchAllMembers: true });
client.download = require("download-to-file");


/*const readImage = (path) => {
	try {
		const imageBuffer = fs.readFileSync(path);
		const tfimage = tf.node.decodeImage(imageBuffer, undefined, undefined, false);
		return tfimage;
	} catch (err) { console.log(err) }
}*/

client.on("ready", () => {
	console.log("ready!")
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			console.log(img)
			classifier(client, img, "test").then(predictions => {
				console.log(predictions)
			}).catch(function (err) {
				console.log(err);
				console.error("Error Parsing Content")
				//message.react("❌")
			});

		})
	})
})

var initmodel = async (client) => {
	client.model = await load("file://./model/", { size: 299 })
}

initmodel(client).then(() => {
	client.login("NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g");
})


var classifier = async (client, img, message) => {
	return new Promise(resolve => {
		const imageBuffer = fs.readFileSync(`./cache/${img}`);
		let image = tf.node.decodeImage(imageBuffer, undefined, undefined, false);
		image = tf.image.resizeBilinear(image, [299, 299], true)
		image = image.reshape([1, 299, 299, 3])
		console.log(image)
		console.log(`image size check: ${image.size == 268203}`)
		client.model.classify(image).then(predictions => {
			//console.log(`img: ${img}, ${JSON.stringify(predictions)}`)
			//message.reply(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`)
			resolve(predictions)
		})

	})

}



client.on("message", async (message) => {
	console.log(message.content)
	console.log(message)
	message.attachments.array().forEach(att => {
		var fname = message.id + "." + att.url.split("/").pop().split(".")[1]
		client.download(att.url, `./cache/${fname}`, function (err, filepath) {
			if (err) {
				client.log("ERROR", `download of attachment ${att.url} failed!`, "recordAttachments");
			} else {
				console.log('Download finished:', filepath)
				console.log(fname)
				classifier(client, fname, message).then(predictions => {
					console.log(predictions)
					message.channel.send(`predictions:${fname}: ${predictions[0].className} with probability ${predictions[0].probability}`)
				}).catch(function (err) {
					console.log(err);
					console.error("Error Parsing Content")
					//message.react("❌")
				});
			}

		})
	})
})