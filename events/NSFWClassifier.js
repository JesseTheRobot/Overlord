/**
 * given a filename, runs it through the NSFWModel to determine if it
 * is above the allowed thresholds for each classification of content.
 * eg above 90% certainty of being Pornographic, before triggering
 * moderation intervention.
 * @param {object} client
 * @param {object} message
 * @param {string} filename - name of the file within the cache directory.
 */
module.exports = async (client, message, filename) => {
    //checks that the models are enabled bot-wide.
    if (!client.NSFWModel) return
    //if the channel has the NSFW tag, disable the classification.
    if (message.channel.nsfw) return
    let cacheDir = message.settings.modules.attachmentRecorder.storageDir
    let modConfig = message.settings.modules.NSFWClassifier
    //if this module is disabled in the guild, return.
    if (!modConfig.enabled) return
    var classifier = async (client, img) => {
        return new Promise(resolve => {
            try {
                //read the image into a buffer
                const imageBuffer = client.fs.readFileSync(cacheDir + img);
                //proccess the imageBuffer as a 3d tensor (x pixels, y pixels, z pixel depth (eg colours))
                const image = client.tf.node.decodeImage(imageBuffer, 3, undefined, false);
                //pass the processed data to the neural network for classification.
                client.NSFWModel.classify(image).then(predictions => {
                    //resolve the promise once classification completes.
                    resolve(predictions)
                    //unlink (delete) the processed file from the cacheDir
                    client.fs.unlink(cacheDir + filename, (err) => {
                        if (err) { client.log(err, "ERROR"); } else { client.log("Unlink successful!"); }
                    })
                    return
                });
            } catch (err) {
                console.error(err);
            }
        });
    };
    /**
     * framework built around the classifier to pipe and parse results into useable information.
     */
    classifier(client, filename).then(predictions => {
        //logs predictions - debug
        client.log(`file ${filename} has results ${JSON.stringify(predictions.join(","))}`)
        //remove SFW classes as they're not helpful.
        predictions = predictions.filter(p => p.className != "Neutral" || p.className != "Drawing")
        //if the number of predictions whose certainty that exceed their weighting exceeds the thresholdExceeders value,
        if (predictions.filter(p => p.probability >= modConfig.classificationWeights[p.className]).length >= modConfig.thresholdExceeders) {
            //map to form formatted strings
            predictions.map(p => `${p.className} Certainty: ${Math.round(p.probability * 100)}%\n`)
            var action = { //action object for modActions. add attributes
                guildID: message.guild.id,
                memberID: message.member.id,
                type: "action",
                autoRemove: modConfig.autoRemove,
                title: "Suspected NSFW Content",
                src: `Posted by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "Automatic",
                    data: `NSFW content breakdown: \n${predictions.join(" ")}`,
                },
                request: "Removal of offending content",
                requestedAction: {
                    type: "delete",
                    target: `${message.guild.id}.${message.channel.id}.${message.id}`,
                },
                penalty: modConfig.penalty,
            }
            //send to modActions.
            client.emit("modActions", action)

        }
    })
};
//default configuration - this specifies that
//content classed as x has to have a certainty at or over y*10 %
module.exports.defaultConfig = {
    enabled: true,
    classificationWeights: {
        Hentai: 0.6,
        Porn: 0.7,
        Sexy: 0.8,
    },
    thresholdExceeders: 1,
    autoRemove: false,
    penalty: 5,
    requiredPermissions: ["MANAGE_MESSAGES"],
};