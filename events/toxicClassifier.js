module.exports = async (client, message) => {
    if (!client.toxicModel) { return }
    let modConfig = message.settings.modules.toxicClassifier
    if (!modConfig.enabled) { return }
    if (!message.content >= modConfig.ignoreBelowLength) { return }
    let classi = []
    client.toxicModel.classify(message.content).then(predictions => {
        if (predictions.filter(p => p.results[0].probabilities[1] >= modConfig.classificationWeights[p.label]).length >= modConfig.thresholdExceeders) {
            predictions.forEach(result => {
                classi.push(`${(result.label).replace("_", " ")} Certainty: ${Math.round(result.results[0].probabilities[1] * 100)}%\n`);
            });
            var action = {
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