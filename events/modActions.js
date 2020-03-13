module.exports = async (client, action) => {
    let config = client.DB.get(action.guildID)
    let modAction = config.modActionChannel
    let audit = config.auditLogChannel
    let modReport = config.modReportingChannel
    const discord = require("discord.js")
    //https://leovoel.github.io/embed-visualizer/
    /*action:{
        type: "action/audit/report/",
        actionDesc:"","
        data: (...),
    }*/

    let embed = new discord.RichEmbed()
        .setAuthor(client.user, client.user.avatarURL)
        .setTimestamp(new Date())
        .setTitle(action.type)
    switch (action.type) {
        case "action":
            genModAction(client, action)
            break;
        case "audit":
            genAudit(cient, action)
            break;
        case "report":
            genModReport(client, action)
            break;
        default:
            client.log(`incorrect action type ${action.type}! event processing failed.`, "FATAL")
            break;
    }
    const genModAction = async (client, action) => {
        embed
        //action title: desc: infringing item in question, other dets, reaction based 
    }
    const genAudit = async (client, action) => {
        embed
        //action/change: affected elements : summary of data. used for moderators.

    }
    const genModReport = async (client, action) => {
        embed
        //'public' report of an action. sent to affected user(s) (if applicable)


    }
    let actionProcessor = async (client, action) => {
        var guild = client.guilds.get(action.guildID)
        var guildConfig = client.DB.get(action.guildID)
        /**
         * actions: objects containing data to be done 'at some point', whether via a scheduler or otherwise
         * 
         */
        function mute() {
            guild.members.get(action.memberID).roles.addRole(guildConfig.mutedRole)
            var newAction = {
                type: "roleRemove",
                memberID: action.memberID,
                roleID: guildConfig.mutedRole,
            }
            let schedule = async (client, action, guildID) => {
                client.DB.push(guildID, action, "persistence.time")
                check(client, guildID)
            }

        }

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