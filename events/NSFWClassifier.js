module.exports = async (client, message, filename) => {
    if (!client.NSFWModel) return
    let modConfig = message.settings.modules.NSFWClassifier

    var classifier = async (client, img) => {
        return new Promise(resolve => {
            try {
                const imageBuffer = client.fs.readFileSync(`./cache/${img}`);
                const image = client.tf.node.decodeImage(imageBuffer, 3, undefined, false);
                client.NSFWModel.classify(image).then(predictions => {
                    resolve(predictions)
                    client.fs.unlink(`./cache/${filename}`, (err) => {
                        if (err) { client.log(err, "ERROR"); } else { client.log("Unlink successful!"); }
                    })
                    return
                });
            } catch (err) {
                console.error(err);
            }
        });
    };

    classifier(client, filename).then(predictions => {
        client.log(`file ${filename} has results ${predictions.join(",")}`)
        if (predictions.filter(p => modConfig.classificationWeights[p.class] >= p.probability).length >= modConfig.thresholdExceeders) {
            let preL = [];
            predictions.forEach(p => {
                preL.push(`${p.className} Certainty: ${Math.round(p.probability * 100)}%\n`);
            });
            var action = {
                guildID: message.guild.id,
                memberID: message.member.id,
                type: "action",
                autoRemove: modConfig.autoRemove,
                title: "Suspected NSFW Content",
                src: `Posted by user <@${message.author.id}> in channel <#${message.channel.id}> : [Jump to message](${message.url})`,
                trigger: {
                    type: "automatic",
                    data: `NSFW content breakdown: \n${preL.join(" ")}`,
                },
                request: "Removal of offending content",
                requestedAction: {
                    type: "delete",
                    target: `${message.guilds.id}.${message.channel.id}.${message.id}`,
                }
            }
            client.emit("modActions", client, action)

        }
    })
};

module.exports.defaultConfig = {
    enabled: true,
    classificationWeights: {
        hentai: 0.7,
        porn: 0.7,
        sexy: 0.9,
        drawing: 0.9,
    },
    thresholdExceeders: 1,
    autoRemove: true,
    requiredPermissions: ["MANAGE_MESSAGES"],
};