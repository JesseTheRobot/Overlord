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
                .setTitle(`Action requested: ${action.title}`)
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
            .setTitle(`Change: ${action.change}`)
            .setDescription(action.title)
            .addField("Original:", `\`\`\`\n${action.data}\n\`\`\``)
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
            .setTitle(`Action: ${action.title}`)
            .setDescription(`Action description: ${JSON.stringify(action.request)}`)
            .addField(`action trigger: ${action.trigger.type}`, `Executor: ${action.executor}`)

        //colour: cyan
        //'public' report of an action. sent to affected user(s) (if applicable)
        modReport.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        })
    }
    const genNotification = (client, action) => {
        return new Promise(resolve => {
            let notification = new discord.RichEmbed()
            notification
                .setTitle(`Notification of action: ${action.request}`)
                .setDescription(`In server ${guild}\n - ${action.src}.\n trigger: ${action.trigger.type}, executor: ${action.executor}.`)
                .setFooter("If you wish to dispute this action, please contact an Administrator.")
            target.send({ embed: notification }).then(() => {
                resolve("Sent!")
            })

        })
    }

    let actionProcessor = async (client, action) => {
        let guildConfig = client.DB.get(guild.id)
        if (action.penalty) {
            let data = client.DB.ensure(guild.id, { count: 0, TS: new Date() }, `users.${action.memberID}.demerits`)
            client.DB.set(guild.id, { count: data.count + action.penalty, TS: new Date() }, `users.${action.memberID}.demerits`)
            client.schedule(guild.id, { type: "demerit", end: new Date().setTime(new Date().getTime() + 2000), memberID: action.memberID, })
        }
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
                ban(client, action)
                break
            case "bulkDelete":
                bulkDelete(client, action)
                break

            default:
                client.log(`unknown/invalid action type: ${action.requestedAction.type}`, "WARN")

        }
        function mute(client, action) {
            target.addRole(guildConfig.mutedRole)
            genNotification(client, action)
            genModReport(client, action)
        }
        function deleteMessage(client, action) {
            let args = action.requestedAction.target.split(".")
            client.guilds.get(args[0]).channels.get(args[1]).messages.get(args[2]).delete()
            genNotification(client, action)
            genModReport(client, action)

        }
        async function ban(client, action) {
            if (!target.bannable) {
                client.log(`Cannot Ban user ${target} - I do not have the permissions!`, "WARN")
            } else {
                try {
                    genNotification(client, action).then(() => {
                        target.ban({ reason: action.title })
                    })
                } catch (err) {
                    client.log(err, "ERROR")
                }
            }
            genModReport(client, action)

        }
        async function bulkDelete(client, action) {
            let channel = guild.channels.get(action.requestedAction.target.split(".")[1])
            let toDelete = await ((channel.fetchMessages().then(messages => messages.filter(m => m.author.id === target.id)))) //.splice(0, action.requestedAction.count))))
            channel.bulkDelete(toDelete.array().splice(0, action.requestedAction.count))
            genNotification(client, action)
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
        case "actionProcessor":
            actionProcessor(client, action)
            break;
        default:
            client.log(`incorrect action type ${action.type}! event processing failed.`, "ERROR")
            break;
    }

}
module.exports.defaultConfig = {
    requiredPermissions: ["MANAGE_MEMBERS", "MANAGE_GUILD"],

}