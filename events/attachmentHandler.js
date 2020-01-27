module.exports = async (client, message) => {
    message.attachments.array().forEach(att => {
        var filename = message.id + "." + att.url.split("/").pop().split(".")[1];
        client.download(att.url, { directory: "./cache", filename: filename }, function (err) {
            if (err) client.log("ERROR", `download of attachment ${att.url} failed!`, "recordAttachments");
            else {
                console.log("download successful!");
                if (message.settings.modules.NSFWclassifier.enabled) {
                    client.classify(filename, message.settings.config.NSFWclassifier);
                } else {
                    setTimeout(function)
                }
                if (message.settings.config.recordAttachments) {
                    new client.transfer(`./cache/${filename}`)
                        .upload()
                        .then(function (link) {
                            console.log(link);
                            client.fs.unlink(`./cache/${filename}`, (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Unlink successful!");
                                }
                            }); //write to DB, key:value with array of URL's for data as well as timestamp for deletion!
                        })
                        .catch(function (err) { console.log(err); });
                }
            }
        });
    });
    return;
};
module.exports.info = {
    desc: "downloads and then uploads attachments to transfer.sh"

};