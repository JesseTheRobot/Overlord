module.exports = async (client, action) => {
    const discord = require("discord.js")
    let guild = client.guilds.get(action.guildID)
    let target = guild.members.get(action.memberID)
    let config = client.DB.get(action.guildID)
    let modAction = guild.channels.get(config.modActionChannel)
    let audit = guild.channels.get(config.auditLogChannel)
    let modReport = guild.channels.get(config.modReportingChannel)
    //https://leovoel.github.io/embed-visualizer/

    /* example action:
    {
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
            modAction.send({ embed: embed }).then(msg => { //eslint-disable-line
                msg.react("✅").then(() => {
                    msg.awaitReactions((reaction, user) => { return reaction.emoji.name === "✅" && !user.bot }, { max: 1 })
                        .then(collected => {
                            action.executor = client.guilds.get(action.guildID).members.get(Array.from(collected.get("✅").users)[1][1].id)
                            action.trigger.type = "Manual"
                            actionProcessor(client, action)
                        })
                })
            }).catch(err => {
                client.log(err, "ERROR")
            })
        }
    }
    const genAudit = async (client, action) => {
        let embed = new discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTimestamp(new Date())
            .setTitle(`Message Change: ${action.change}`)
            .setDescription(action.title)
            .addField("Original Contents", `\`\`\`\n${action.data}\n\`\`\``)
        switch (action.change) {
            case "deleted":
                embed.addField("Attachments:", `${action.attachments.join("\n") || "None"}`)
                break;
            case "edited":
                embed.addField("Edited Contents:", `\`\`\`\n${action.edit}\n\`\`\``)
        }
        audit.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        }) //eslint-disable-line
    }
    const genModReport = async (client, action) => {
        let embed = new discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTimestamp(new Date())
            .setTitle(`Moderator Action: ${action.title}`)
            .setDescription(`Action description: ${JSON.stringify(action.request)}`)
            .addField(`action trigger: ${action.trigger.type}`, `Executor: ${action.executor} `)

        //colour: cyan
        //'public' report of an action. sent to affected user(s) (if applicable)
        modReport.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        })

        let notification = new discord.RichEmbed()
        notification
            .setTitle(`Notification of action: ${action.title}`)
            .setDescription(`In server ${guild}\n - ${action.src}.\n Content has been processed via ${action.request}\n
            Current Penalty for this action is ${action.penalty} demerit(s). you will be notified if any further action is taken.`)
            .setFooter("Please contact a Moderator if you Wish to appeal this action.")
        target.send({ embed: notification })
    }



    let actionProcessor = async (client, action) => {
        var guildConfig = client.DB.get(action.guildID)
        let member = guild.members.get(action.memberID)
        penaltyMan(client, action)
        /**
         * actions: objects containing data to be done 'at some point', whether via a scheduler or otherwise
         * 
         */
        switch (action.requestedAction.type) {
            case "delete":
                deleteMessage(client, action)
                break
            case "mute":
                mute(client, action)
                break
            case "ban":
                saveUserState(client, action)
                break
            case "bulkDelete":
                bulkDelete(client, action)
                break

            default:
                client.log(`unknown/invalid action type: ${action.requestedAction.type}`, "WARN")

        }
        function saveUserState(client, action) {
            let state = {
                nick: target.nickname,
                roles: Array.from(target.roles.keys()),
                TS: new Date()
            }
            client.DB.set(action.guildID, state, `users.${target.id}.savedState`)
            genModReport(client, action)
        }
        function mute(client, action) {
            target.roles.addRole(guildConfig.mutedRole)
            client.schedule({
                type: "roleRemove",
                memberID: target.id,
                roleID: guildConfig.mutedRole,

            }, guild.id)
            genModReport(client, action)
        }
        function restoreUserSate(client, action) {
            let state = client.DB.get(action.guildID, `users.${target.id}.savedState`)
            //declare that a state restore has been performed
            target.setNickname(state.nick)
            target.roles.add(state.roles)
        }
        function deleteMessage(client, action) {
            let args = action.requestedAction.target.split(".")
            client.guilds.get(args[0]).channels.get(args[1]).messages.get(args[2]).delete()
            genModReport(client, action)

        }
        function ban(client, action) {
            if (!target.bannable) {
                client.log(`Cannot Ban user ${target} - I do not have the permissions!`)
            } else {
                target.ban({ reason: action.title })
            }
            genModReport(client, action)

        }
        async function bulkDelete(client, action) {
            let channel = guild.channels.get(action.requestedAction.target.split(".")[1])
            let toDelete = await ((channel.fetchMessages().then(messages => messages.filter(m => m.author.id === target.id)))) //.splice(0, action.requestedAction.count))))
            channel.bulkDelete(toDelete.array().splice(0, action.requestedAction.count))
            genModReport(client, action)

        }
    }


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

}
module.exports.defaultConfig = {
    requiredPermissions: ["MANAGE_MEMBERS", "MANAGE_GUILD"],
    punishments: {
        5: {
            name: "mute",
            duration: 12
        },
        10: {
            name: "tempBan",
            duration: 48

        },
        15: {
            name: "ban",
            duration: 9999
        }
    },
}