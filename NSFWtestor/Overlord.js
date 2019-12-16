/**Dependancy Import and initialisation */
const Discord = require("discord.js");
const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: -1, messageCacheLifetime: 0, messageSweepInterval: 0, fetchAllMembers: true });
client.download = require("download-to-file");
var toxicity = require("@tensorflow-models/toxicity");
client.on("ready", () => {
	console.log("ready!");
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			classifier(client, img).then(predictions => {
				console.log(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`);
			});
		});
	});
});

var initmodel = async (client) => {
	client.NSFWmodel = await load("file://./models/NSFW/", { size: 299 });
	client.toxicModel = await toxicity.load(); //load NN for Toxicity
	client.EXPtoxicModel = new toxicity.ToxicityClassifier;
	client.EXPtoxicModel.loadModel = () => {
		return require("@tensorflow/tfjs-converter").loadGraphModel("file://./models/toxic/model.json");
	};
	await client.EXPtoxicModel.load();
	console.log(client);
	console.log("Models loaded!");
};

initmodel(client).then(() => {
	client.login("NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g");
	client.EXPtoxicModel.classify("asodfadsgijamdsfoijdsafjsadfjasdfjsamfqwjvmfdsfavawvfmafjv");
});


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


const toxicClassify = async (inputs) => {
	const results = await client.toxicModel.classify(inputs);
};

client.on("message", async (message) => {
	console.log(message);
	toxicClassify(message).then(res => {
		console.log(res);
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