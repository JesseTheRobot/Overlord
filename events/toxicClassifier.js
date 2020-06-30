/**
 * much like NSFWClassifier, classfies text inputs to a set of classes with a %age certainty, but this is used for detecting
 * 'toxicity' in text, eg excessive swearing, racial slurs, and other generally frowned upon language.
 * @param {object} client
 * @param {object} message - uses the content of the message.
 */
module.exports = async (client, message) => {
    if (!client.toxicModel) { return } //checks that the Model is loaded.
    let modConfig = message.settings.modules.toxicClassifier //gets the modules's config
    if (!modConfig.enabled) { return }
    if (!message.content.length >= modConfig.ignoreBelowLength) { return } //checks ignore length
    //classifies the message content using the loaded Model.
    client.toxicModel.classify(message.content).then(predictions => {
        //check the number of results that , if above or equal continue
        if (predictions.filter(p => p.results[0].probabilities[1] >= modConfig.classificationWeights[p.label]).length >= modConfig.thresholdExceeders) {
            //map to create a formatted set of strings
            predictions.map(result => `${(result.label).replace("_", " ")} Certainty: ${Math.round(result.results[0].probabilities[1] * 100)}%\n`)
            var action = {//action to be sent to modActions for Processing. add attributes
                guildID: message.guild.id,
                memberID: message.member.id,
                type: "action",
                autoRemove: modConfig.autoRemove,
                title: "Suspected Toxic Content",
                src: `Posted by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "Automatic",
                    data: `Toxic content breakdown: \n${classi.join(" ")}`,
                },
                request: "Removal of offending content",
                requestedAction: {
                    type: "delete",
                    target: `${message.guild.id}.${message.channel.id}.${message.id}`,
                },
                penalty: modConfig.penalty,
            }
            client.emit("modActions", action)
        }
    })
};

module.exports.defaultConfig = {
    enabled: true,
    classificationWeights: {
        identity_attack: 0.6,
        insult: 0.8,
        obscene: 0.8,
        severe_toxicity: 0.6,
        sexual_explicit: 0.6,
        threat: 0.8,
        toxicity: 0.7,
    },
    thresholdExceeders: 3,
    autoRemove: false,
    ignoreBelowLength: 30,
    penalty: 3,
    requiredPermissions: ["MANAGE_MESSAGES"],
}