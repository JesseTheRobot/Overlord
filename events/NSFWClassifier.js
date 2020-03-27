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
        client.log(`file ${filename} has results ${JSON.stringify(predictions.join(","))}`)
        if (predictions.filter(p => p.probability >= modConfig.classificationWeights[p.className]).length >= modConfig.thresholdExceeders) {
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
                src: `Posted by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "automatic",
                    data: `NSFW content breakdown: \n${preL.join(" ")}`,
                },
                request: "Removal of offending content",
                requestedAction: {
                    type: "delete",
                    target: `${message.guild.id}.${message.channel.id}.${message.id}`,
                }
            }
            client.emit("modActions", action)

        }
    })
};

module.exports.defaultConfig = {
    enabled: true,
    classificationWeights: {
        Hentai: 0.1,
        Porn: 0.1,
        Sexy: 0.1,
        Drawing: 0.1,
    },
    thresholdExceeders: 1,
    autoRemove: true,
    requiredPermissions: ["MANAGE_MESSAGES"],
};