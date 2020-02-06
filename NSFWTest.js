﻿/**Dependancy Import and initialisation */
const Discord = require("discord.js");
const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const client = new Discord.Client({ autoReconnect: true });
client.download = require("download-to-file");
var modConfig = {}
modConfig.classificationWeights = {
	hentai: 0.7,
	porn: 0.7,
	sexy: 0.9,
	drawing: 0.9,
}

var toxicity = require("@tensorflow-models/toxicity");
client.on("ready", () => {
	console.log("ready!");
	/*fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			classifier(client, img).then(predictions => {
				console.log(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`);
			});
		});
	});*/
});
/**
 * Loads TF GraphModels for NSFW and Toxicity detection.
 * @param  client 
 */
var initmodel = async (client) => {
	client.NSFWmodel = await load("file://./models/NSFW/", { size: 299 });
	client.toxicModel = new toxicity.ToxicityClassifier;
	client.toxicModel.loadModel = () => { //overwrite default LoadModel method due to *hard coded* reliance on web-based model files. I didn't like this so I made it use local files instead.
		return require("@tensorflow/tfjs-converter").loadGraphModel("file://./models/toxic/model.json");
	};
	await client.toxicModel.load();
	console.log("Models loaded!");
};



var classifier = async (client, img) => {
	return new Promise(resolve => {
		try {
			const imageBuffer = fs.readFileSync(`./cache/${img}`);
			const image = tf.node.decodeImage(imageBuffer, 3, undefined, false);
			client.NSFWmodel.classify(image).then(predictions => {
				resolve(predictions);
			});
		} catch (err) {
			console.error(err);
		}
	});
};


const toxicClassify = async (input) => {
	const results = await client.toxicModel.classify(input);

};

client.on("message", async (message) => {
	if (message.author.bot) return;
	message.content = message.cleanContent;
	console.log(message.content);
	var classi = [];
	client.toxicModel.classify(message.cleanContent).then(results => {
		console.log(...results);
		results.forEach(result => {
			classi.push({ type: result.label, certainty: Math.round(result.results[0].probabilities[1] * 100) });
		});
		console.log(...classi);
		message.reply(classi[6].certainty);
	});
	message.attachments.array().forEach(att => {
		var fname = message.id + "." + att.url.split("/").pop().split(".")[1];
		client.download(att.url, `./cache/${fname}`, function (err, filepath) {
			if (err) {
				client.log("ERROR", `download of attachment ${att.url} failed!`, "recordAttachments");
			} else {
				console.log("Download finished:", filepath);
				console.log(fname);
				classifier(client, fname).then(predictions => {
					console.log(predictions);
					predictions.filter(p => modConfig.classificationWeights[p.class] >= p.probability).length
					let preL = [];
					predictions.forEach(p => {
						preL.push(`${p.className} Certainty: ${Math.round(p.probability * 100)}%\n`);
					});
					function Type(p) { if (p[0].className == "Porn" || p[0].className == "Hentai") { return "NSFW ❌"; } else { return "SFW ✅"; } }
					const exampleEmbed = new Discord.RichEmbed()
						.setColor("#0099ff")
						.setTitle("Image Classification result")
						.setAuthor(`${client.user.username}`)
						.setImage(`${att.url}`)
						.addField(`Classified as ${preL[0]}`, `${Type(predictions)}`)
						.addField("Full classification classes:", `${preL.join(" ")} `)
						.setTimestamp()
						.setFooter("cool and good");
					message.channel.send(exampleEmbed);
				}).catch(function (err) {
					console.log(err);
					console.error("Error Parsing Content");
				});
			}

		});
	});
});

initmodel(client).then(() => {
	client.login("NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g");
});
