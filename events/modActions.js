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
        //colour: amber
        embed
            .setTitle(`Moderator Action requested:${action.title}`)
            .addField(`Trigger type ${action.trigger.type}`)
            .addField(`Trigger description: ${action.trigger.data}`)
            .addField(`Reccomended Action Pending Approval: ${action.request}`)
        //action title: desc: infringing item in question, other dets, reaction based  - scollector

    }
    const genAudit = async (client, action) => {
        embed
            .setTitle(action.title)
            .addField(action.data)
            .
        //colour: blue
        //action/change: affected elements : summary of data. used for moderators.

    }
    const genModReport = async (client, action) => {
        embed
            .setTitle(`Moderator Action: ${action.title}`)
            .addField(`action trigger: ${action.trigger.type}`)
            .addField(`Action description: ${action.request}`)
        //colour: cyan
        //'public' report of an action. sent to affected user(s) (if applicable)
    }
    let actionProcessor = async (client, action) => {
        var guild = client.guilds.get(action.guildID)
        var guildConfig = client.DB.get(action.guildID)
        let member = guild.members(action.memberID)
        /**
         * actions: objects containing data to be done 'at some point', whether via a scheduler or otherwise
         * 
         */
        function saveUserState(client, action) {
            let state = {
                nick: member.nickname,
                roles: Array.from(member.roles.keys()),
                TS: new Date()
            }
            client.DB.set(action.guildID, state, `users.${member.id}.savedState`)
        }
        function mute(client, action) {
            member.roles.addRole(guildConfig.mutedRole)
            client.schedule({
                type: "roleRemove",
                memberID: action.memberID,
                roleID: guildConfig.mutedRole,

            }, guild.id)
        }
        function restoreUserSate(client, action) {
            let state = client.DB.get(action.guildID, `users.${action.memberID}.savedState`)
            //declare that a state restore has been performed
            let user = client.guilds.get(action.guildID).members.get(action.memberID)
            user.setNickname(state.nick)
            user.roles.add(state.roles)
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