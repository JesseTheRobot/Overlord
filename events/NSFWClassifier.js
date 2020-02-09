module.exports = async (client, message, filename) => {
    if (!client.NSFWModel) { return }
    let modConfig = message.settings.modules.NSFWClassifier
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
    classifier(client, filename).then(predictions => {
        if (predictions.filter(p => modConfig.classificationWeights[p.class] >= p.probability).length >= modConfig.thresholdExceeders) {
            if (modConfig.autoRemove) {

                return

            }
            var action = {

            }
            client.emit("modActions", client, message, action)
        }

    })
};
module.exports.defaultConfig = {
    enabled: false,
    classificationWeights: {
        hentai: 0.7,
        porn: 0.7,
        sexy: 0.9,
        drawing: 0.9,
    },
    thresholdExceeders: 1,
    autoRemove: true,
    requiredPermissions: ["MESSAGE_DELETE"]
};