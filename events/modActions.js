module.exports = async (client, message, action) => {
    /*action:{
        type: "action/audit/report"
        data:

    }*/
    //https://leovoel.github.io/embed-visualizer/
    let modAction = message.settings.modActionChannel
    let audit = message.settings.auditLogChannel
    let modReport = message.settings.modReportingChannel
    const discord = require("discord.js")
    /*action:{
        type: "action/audit/report",
        actionDesc:"
        data: (...),
    }*/

    const genModAction = (client, message, action) => {
        let embed = new discord.RichEmbed()
            .setAuthor(client.user, client.user.avatarURL)
    }
    const genAudit = (client, message, action) => {

    }
    const genModReport = (client, message, action) => {

    }

    //action : summary, desc, target(?)
    //send a message to a moderation channel in which moderators
    // can react to determine if an automated action should be taken or not
    // (only if the autoremove is disabled in module config, g for the antispam/flood/classifier nets)

    const exampleEmbed = {
        color: 0x0099ff,
        title: 'Some title',
        url: 'https://discord.js.org',
        author: {
            name: 'Some name',
            icon_url: 'https://i.imgur.com/wSTFkRM.png',
            url: 'https://discord.js.org',
        },
        description: 'Some description here',
        thumbnail: {
            url: 'https://i.imgur.com/wSTFkRM.png',
        },
        fields: [
            {
                name: 'Regular field title',
                value: 'Some value here',
            },
            {
                name: '\u200b',
                value: '\u200b',
            },
            {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true,
            },
            {
                name: 'Inline field title',
                value: "[Guide](https://discordjs.guide/ 'optional hovertext')",
                inline: true,
            },
            {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true,
            },
        ],
        image: {
            url: 'https://i.imgur.com/wSTFkRM.png',
        },
        timestamp: new Date(),
        footer: {
            text: 'Some footer text here',
            icon_url: 'https://i.imgur.com/wSTFkRM.png',
        },
    };
    //channel.send({ embed: exampleEmbed });
}