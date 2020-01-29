module.exports = async (client, message, action) => {
    let modActionChannel = message.settings.modActionChannel
    let auditLogChannel = messagge.settings.auditLogChannel
    const discord = require("discord.js")
    //send a message to a moderation channel in which moderators
    // can react to determine if an automated action should be taken or not
    // (only if the autoremove is disabled in module config, g for the antispam/flood/classifier nets)
    var emb = new discord.RichEmbed()
        .setTitle("test")


}