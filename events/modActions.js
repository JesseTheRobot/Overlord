module.exports = async (client, action) => {
    let guild = client.guilds.get(action.guildID)
    let config = client.DB.get(action.guildID)
    let modAction = guild.channels.get(config.modActionChannel)
    let audit = guild.channels.get(config.auditLogChannel)
    let modReport = guild.channels.get(config.modReportingChannel)

    const discord = require("discord.js")

    //https://leovoel.github.io/embed-visualizer/
    /*action:{
        type: "action/audit/report/",
        actionDesc:"","
        data: (...),
    }*/


    const genModAction = async (client, action) => {
        //colour: amber
        if (action.autoRemove) { actionProcessor(client, action) } else {
            let embed = new discord.RichEmbed()
                .setAuthor(client.user.username, client.user.avatarURL)
                .setTimestamp(new Date())
                .setTitle(`Moderator Action requested: ${action.title}`)
                .setDescription(`source: ${action.src}`)
                .addField("Trigger type", action.trigger.type)
                .addField("Trigger description:", action.trigger.data)
                .addField("Reccomended Action Pending Approval:", action.request)
                .setFooter("react with ✅ to perform the reccomended action.")
            modAction.send({ embed: embed }).then(message => { //eslint-disable-line
                message.guild.channels.get(message.channel.id).send({ embed: embed }).then(msg => {
                    msg.react("✅").then(() => {
                        msg.awaitReactions((reaction, user) => { return reaction.emoji.name === "✅" && !user.bot }, { max: 1 })
                            .then(collected => {
                                client.log(collected)
                                action.executor = Array.from(collected.get("✅").users)[1][1].id
                                actionProcessor(client, action)
                            })
                    })
                })
            }).catch(err => {
                client.log(err, "ERROR")
            })
        }
    }
    const genAudit = async (client, action) => {
        embed
            .setTitle(`Message Change: ${action.change}`)
            .setDescription(action.title)
            .addField("Original Contents", `\`\`\`\n${action.data}\n\`\`\``)
            .addField("Attachments:", `${action.attachments.join("\n")}`)
        audit.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        }) //eslint-disable-line
    }
    const genModReport = async (client, action) => {
        embed
            .setTitle(`Moderator Action: ${action.title}`)
            .addField(`action trigger: ${action.trigger.type}`)
            .setDescription(`Action description: ${JSON.stringify(action.request)}`)
        //colour: cyan
        //'public' report of an action. sent to affected user(s) (if applicable)
        modReport.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        })
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
        function deleteMessage(client, action) {
            let args = action.requestedAction.target.split(".")
            client.guilds.get(args[0]).channels.get(args[1]).messages.get(args[2]).delete()
            genModReport(client, action)

        }
    }

    let embed = new discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setTimestamp(new Date())
    switch (action.type) {
        case "action":
            genModAction(client, action)
            break;
        case "audit":
            genAudit(client, action)
            break;
        case "report":
            genModReport(client, action)
            break;
        default:
            client.log(`incorrect action type ${action.type}! event processing failed.`, "FATAL")
            break;
    }

    //action : summary, desc, target(?)
    //send a message to a moderation channel in which moderators
    // can react to determine if an automated action should be taken or not
    // (only if the autoremove is disabled in module config, g for the antispam/flood/classifier nets)
    /*const addPoints = (client, data) => {
        /*
        data ={
            target: GuildID.memberID,
            number: int
        }
        */

}