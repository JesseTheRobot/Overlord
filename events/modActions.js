/**
 * processes an 'action' object containing data to perform a specific action through various process control measures (eg optional human intervention)
 * @param {object} client "global scope" for the application. manditory.
 * @param {object} action custom object containg pseudo-standardised data. see the basic schema below.
*/
module.exports = async (client, action) => {
    //re-imported due to needing embeds (can't access through Client Object).
    let Discord = require("Discord.js")
    let guild = client.guilds.get(action.guildID)
    let target = guild.members.get(action.memberID)
    let config = client.DB.get(action.guildID)
    let modAction = guild.channels.get(config.modActionChan)
    let audit = guild.channels.get(config.auditLogChan)
    let modReport = guild.channels.get(config.modReportingChan)
    //if any of the channels are undefined, resets them to the first valid channel.
    if (!modAction || !audit || !modReport) {
        //multiAssign as well as a map iterator 'trick' to get the first valid channel without having to get the key.
        modAction = audit = modReport = guild.channels.filter(chan => chan.type === "text").values().next().value
        //notify administrators (and bot owner) that the channels are undefined.
        client.log(`Undefined Reporting channels for guild ${guild.name} - falling back to first valid channel`, "WARN")
        modReport.send("WARNING: Reporting channels Have not been configured properly or I don't have access to them!")
    }
    //https://leovoel.github.io/embed-visualizer/ - link used to design embeds.

    /* example of an action:
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

    /**
     * processes an action object to request approval for an action from a moderator.
     * @param {object} client 
     * @param {object} action  - the action object to be processed as type modAction
     */
    const genModAction = async (client, action) => {
        //if the action doesn't require user input, bypass this system and directly execute.
        if (action.autoRemove) { actionProcessor(client, { ...action, ...{ executor: client.user } }) } else {
            //create a new embed instance
            let embed = new Discord.RichEmbed()
                //add elements to the embed
                //set the author to the bot
                .setAuthor(client.user.username, client.user.avatarURL)
                //set the timestamp to now
                .setTimestamp(new Date())
                //set the title
                .setTitle(`Action requested: ${action.title}`)
                //set the description (main body of text)
                .setDescription(`source: ${action.src}`)
                //add fields for additional information
                .addField("Trigger type", action.trigger.type)
                .addField("Trigger description:", action.trigger.data)
                .addField("Recommended Action Pending Approval:", action.request)
                .setFooter("react with ✅ to perform the reccomended action.")
            modAction.send({ embed: embed }).then(msg => { //wait for the message to be sent and reacted to.
                msg.react("✅").then(() => { //waits for a ✅ reaction, then executes the requested action.
                    //checks that only one user (not a bot) reacts with a ✅.
                    msg.awaitReactions((reaction, user) => { return reaction.emoji.name === "✅" && !user.bot }, { max: 1 })
                        .then(collected => { //passes through all results that passed the above filter function.
                            //gets the userID of the user that reacted.
                            action.executor = client.guilds.get(action.guildID).members.get(Array.from(collected.get("✅").users)[1][1].id)
                            action.trigger.type = "Manual" //changes trigger type as it had moderator/human input.
                            actionProcessor(client, action)
                        })
                })
            }).catch(err => {
                //catches and logs any errors
                client.log(err, "ERROR")
            })
        }
    }

    /**
     * processes an action object to generate an audit entry - showing that something has changed and what that change is.
     * generates and sends an embed so that moderators can monitor any chnages, eg message deletions/edits, etc.
     * @param {object} client 
     * @param {object} action - action object to be processed to produce an auditLog channel entry. 
     * (not to be confused with the server's built-in audit log).
     */
    const genAudit = async (client, action) => {
        //create a new embed instance
        let embed = new Discord.RichEmbed() //add attributes
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTimestamp(new Date())
            .setTitle(`Change: ${action.change}`)
            .setDescription(action.title)
            //specialised formatting used to generate 'code blocks' - help with contrast and breaking text up.
            .addField("Original:", `\`\`\`\n${action.data}\n\`\`\``)
        switch (action.change) { //switch:case for specific types of change needing specific fields.
            case "deleted":
                //list attachments that were saved and re-uploaded.
                embed.addField("Attachments:", `${action.attachments.join("\n") || "None"}`)
                break;
            case "edited":
                //add a field showing the edited contents.
                embed.addField("Edited Contents:", `\`\`\`\n${action.edit}\n\`\`\``)
                break
        }
        //send the embed to the audit log channel.
        audit.send({ embed: embed }).catch(err => {
            //catch and log any errors
            client.log(err, "ERROR")
        })
    }

    /**
     * processes an action object to create a report of a moderator action - this is supposed to be 'public facing'
     * @param {object} client 
     * @param {object} action  - action to be processed into a report.
     */
    const genModReport = async (client, action) => {
        //create a new embed - add attributes
        let embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setTimestamp(new Date())
            .setTitle(`Action: ${action.title}`)
            .setDescription(`Action description: ${JSON.stringify(action.request)}`)
            .addField(`action trigger: ${action.trigger.type}`, `Executor: ${action.executor}`)
        //send embed to the modReport channel.
        modReport.send({ embed: embed }).catch(err => {
            client.log(err, "ERROR")
        })
    }

    /**
     * processes an action object to generate a nortification for a user to notify them of an action having taken place.
     * such as being muted or banned.
     * @param {object} client 
     * @param {object} action 
     */
    const genNotification = (client, action) => {
        //this is a promise to ensure that the ban does not get triggered before the user is notified.
        return new Promise(resolve => {
            //create new embed instance, add attributes to it.
            let notification = new Discord.RichEmbed()
            notification
                .setTitle(`Notification of action: ${action.request}`)
                .setDescription(`In server ${guild}\n - ${action.src}.\n trigger: ${action.trigger.type}, executor: ${action.executor}.`)
                .setFooter("If you wish to dispute this action, please contact an Administrator.")
            target.send({ embed: notification }).then(() => {
                resolve("Sent!")//placeholder value to resolve the promise.
            })
        })
    }

    /**
     * processes an action's requested action after it has been approved.
     * eg mutes the user, bans the user, deletes some messages.
     * @param {object} client 
     * @param {object} action 
     */
    let actionProcessor = async (client, action) => { //proccessing manager/discriminator for actions,
        if (action.penalty) { //if the action has a 'penalty' attached to it, fork the object to the scheduler to apply punishments.
            //ensure the user has a demerits entry. if they did, return the value, else set to the provided object.
            let data = client.DB.ensure(guild.id, { count: 0, TS: new Date() }, `users.${action.memberID}.demerits`)
            //update the user with the new number of demerits and timestamp.
            client.DB.set(guild.id, { count: data.count + action.penalty, TS: new Date() }, `users.${action.memberID}.demerits`)
            //schedule the action to happen immeadiatly.
            client.schedule(guild.id, { type: "demerit", end: new Date(), memberID: action.memberID, })
        }

        /**
         * actions: objects containing data to be done 'at some point', whether via a scheduler or otherwise.
         * categorised by type, and in this case, by the type of the requested Action.
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

        /**
         * given a target and a guild, mutes the target in the guild, notifies, and then reports.
         * @param {*} client 
         * @param {*} action 
         */
        function mute(client, action) { //given a target, mutes then notifies the target of the action.
            target.addRole(config.mutedRole) //gives the target the specified muted role.
            genNotification(client, action)
            genModReport(client, action)
        }

        /**
         * given a target message in 'full path' notation, deletes the message, notifies then reports.
         * @param {*} client 
         * @param {*} action 
         */
        function deleteMessage(client, action) {
            let args = action.requestedAction.target.split(".")
            //deletes the specified message using it's "Full Path" (guildID.channelID.messageID)
            client.guilds.get(args[0]).channels.get(args[1]).messages.get(args[2]).delete()
            genNotification(client, action)
            genModReport(client, action)

        }

        /**
         * given a target user, checks they can be banned before notifying, banning and then reporting.
         * notifying before it does so as it cannot DM banned users.
         * @param {object} client 
         * @param {object} action 
         */
        async function ban(client, action) {
            //check the both can actually ban the user
            if (!target.bannable) {
                client.log(`Cannot Ban user ${target} - I do not have the permissions!`, "WARN")
                return
            } else {
                try { //catch in case the user has already been banned or some other error occurs.
                    //generate and send the notification of action before banning the user.
                    genNotification(client, action).then(() => {
                        //ban the user
                        target.ban({ reason: action.title })
                    })
                    //genreate a moderation report
                    genModReport(client, action)
                } catch (err) {
                    client.log(err, "ERROR")
                }

            }

        }

        /**
         * given a user as well as a channel, and a count, deletes the last count messages by that user in the specified channel.
         *  where count is action.requestedAction.count, then notifies and reports.
         * @param {object} client 
         * @param {object} action 
         */
        async function bulkDelete(client, action) {
            //get the channel
            let channel = guild.channels.get(action.requestedAction.target.split(".")[1])
            //wait for the messages to be fetched and filtered by authorID
            let toDelete = await ((channel.fetchMessages().then(messages => messages.filter(m => m.author.id === target.id))))
            //deletes all passed messages up to count.
            channel.bulkDelete(toDelete.array().splice(0, action.requestedAction.count))
            //generate a notification and modReport
            genNotification(client, action)
            genModReport(client, action)

        }
    }

    switch (action.type) { //switch:case for flow control to descriminate against different types of actions
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