module.exports = async (client, message) => {
    if (!client.toxicModel) { return }
    let modConfig = message.settings.modules.toxicClassifier
    client.toxicModel.classify(message.content).then(results => {
        let classi = []
        results.forEach(result => {
            result.prob = result.results[0].probabilities[1] //we only need the primary net certainty
            if (result.prob >= modConfig.classificationWeights[result.label]) {
                classi.push({ type: result.label, certainty: result.prob });
            }
        });
        if (classi.length >= modConfig.thresholdExceeders) {
            //insert code to link to moderation subsystem here
            //client.emit("modActions",client,message,)
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
    autoRemoveToxic: false,
},

    module.exports.info = "uses a Layered Neural Net to classify the contents of a message to attempt to determine if the contents fall under a set of categories. it returns a 'certainty' (1 being 100% certain, 0.5 being 50%) and based on the weights in the configuration, flags the message for moderator intervention."