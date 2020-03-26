module.exports = async (client, message) => {
    if (!client.toxicModel) { return }
    let modConfig = message.settings.modules.toxicClassifier
    client.toxicModel.classify(message.content).then(predictions => {
        if (predictions.filter(p => modConfig.classificationWeights[p.class] >= p.probability).length >= modConfig.thresholdExceeders) {
            var action = {
            }
            //insert code to link to moderation subsystem here
            client.emit("modActions", client, message)
        }
    })
};

module.exports.defaultConfig = {
    enabled: false,
    classificationWeights: {
        identity_attack: 0.9,
        insult: 0.8,
        obscene: 0.8,
        severe_toxicity: 0.7,
        sexual_explicit: 0.8,
        threat: 0.8,
        toxicity: 0.7,
    },
    thresholdExceeders: 3,
    autoRemove: false,
}