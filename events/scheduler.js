/**
 * givens a min, max, and value to test, determines if a value is in range or not.
 * @param {number} x  value that you want to check
 * @param {number} min the minimum of the range
 * @param {number} max the maximum of the range
 */
function inRange(x, min, max) {
    return ((x - min) * (x - max) < 0);
}
/**
 * processes actions that need to be executed by the scheduler, such as punishments, role removals, reminders, etc.
 * @param {object} client 
 * @param {string} guildID 
 * @param {object} action - object containing data for processing.
 */
let actionProcessor = async (client, guildID, action) => {
    let guild = client.guilds.get(guildID)
    let target = guild.members.get(action.memberID)
    //switch:case discrimnator for each action type
    switch (action.type) {
        case "roleRemove": //removes a given role from a given user
            target.removeRole(action.roleID)
            break
        case "reminder": //sends a given user a given string as a reminder.
            target.send(`scheduled reminder: ${action.message}`)
            break
        case "nick": //sets the nickname of a given user to a given string
            target.setNickname(action.nick)
            break
        case "roleAdd": //add a given role to a given user
            target.addRole(action.roleID)
            break;
        case "unban": //unbans a given user
            guild.unban(action.memberID)
            break;
        case "demerit":
            let mConf = client.DB.get(guild.id).modules.autoMod
            let data = client.DB.ensure(guildID, { TS: new Date(), count: 0 } `users.${action.memberID}.demerits`)
            //determine how many decay cycles have occured between this execution and last execution.
            let intervals = Math.max(Math.floor((new Date() - data.TS) / (3600000 * mConf.decay)), 0)
            //determine the new demerit count after the number of cycles, bounding it to be >=0.
            //this system was made so that perminent punishments (eg permbans) can be given an end of -1 to be infinite.
            let afterDecay = Math.max((data.count - intervals), 0)
            let pAction = {
                type: "actionProcessor",
                memberID: action.memberID,
                guildID: guildID,
                trigger: {
                    type: "Automatic"
                },
                src: "Automated punishment due to reaching demerit threshold.",
                executor: client.user
            } //punishment action - variant of action
            //iterate over all the punishment tiers
            Object.entries(mConf.punishments).forEach(pt => {
                //if it was originally in range (count, pt[1]-start-end), but is no longer (afterdecay) in range, undo the action/punishment.
                if (inRange(data.count, pt[1].end, pt[1].start) && !inRange(afterDecay, pt[1].end, pt[1].start)) {
                    client.log(`Removing Punishment "${pt[0]}" to user ${client.users.get(action.memberID).tag}.`)
                    switch (pt[0]) {
                        case "mute":
                            actionProcessor(client, guildID, { memberID: action.memberID, type: "roleRemove", roleID: guild.mutedRole })
                            break;
                        case "tempBan":
                            actionProcessor(client, guildID, { memberID: action.memberID, type: "unban" })
                            break;
                    }
                    //if it wasn't in range and is now above the start, apply the punishment.
                } else if (!inRange(data.count, pt[1].end, pt[1].start) && afterDecay > pt[1].start) {
                    client.log(`Applying Punishment "${pt[0]}" to user ${client.users.get(action.memberID).tag}.`)
                    //switch:case for the name of the punishment
                    switch (pt[0]) {
                        case "mute":
                            client.emit("modActions", {
                                ...pAction, ...{
                                    title: "Mute of User",
                                    requestedAction: {
                                        type: "mute"
                                    },
                                    request: `Mute of user ${target.tag}`,
                                }
                            })
                            break;
                        case "tempBan":
                            client.emit("modActions", {
                                ...pAction, ...{
                                    title: "Temporary ban of User",
                                    requestedAction: {
                                        type: "ban"
                                    },
                                    request: `Temporary ban of user ${target.tag}`,
                                }
                            })
                            break;
                        case "ban":
                            client.emit("modActions", {
                                ...pAction, ...{
                                    title: `Ban of User ${target.tag}`,
                                    requestedAction: {
                                        type: "ban"
                                    },
                                    request: "Ban of user",
                                }
                            })
                            break;
                    }
                }
                if (afterDecay <= 0) { //if the user is out of demerits, delete the property.
                    client.DB.remove(guildID, `users.${action.memberID}.demerits`)
                } else {
                    //set the demerits property of the user to a modified version, with the new counts and Timestamp.
                    client.DB.set(guildID, { count: afterDecay, TS: new Date() }, `users.${action.memberID}.demerits`)
                }
            })

            action.end = new Date().setTime(new Date().getTime() + (mConf.decay * 3600001))
            //reschedule the action, after filterrng out any duplicate entries (as these contain non-essential data)
            client.DB.set(guildID, client.DB.get(guildID, "persistence.time").filter(act => act.memberID !== action.memberID), "persistence.time")
            //re-schedule the action.
            client.schedule(guildID, action)
            break
        default:
            client.log(`Unknown action type/action ${JSON.stringify(action)}`, "WARN")
            break;
    }
}
/**
 * custom scheduler engine designed to have a greatly reduced memory footprint in larger deployments compared to the built-in scheduler.
 * @param {object} client
 * @param {string} guildID - the ID of the guild that the scheduler should check for tasks.
 */
module.exports = async function check(client, guildID) {
    /** Scheduler - uses setTimeout to call itself 
     * array of objects (
     * "action:"{end:TS,type:typeInst,...data}
     */
    let timeouts = client.timeouts //alias for tiemouts.
    if (!timeouts.has(guildID)) timeouts.set(guildID, null) //ensure the guild exists in timeouts.
    let timeout = timeouts.get(guildID) //get timeout for this guild
    client.log(`Checking... (timeout = ${timeout}) ${client.guilds.get(guildID).name} `); //notification that the scheduler is operating
    // clears previous check refresher
    clearTimeout(timeout);
    const now = new Date()
    //gets persistence data from the DB
    let data = client.DB.get(guildID, "persistence.time")
    if (data.length == 0) return
    //finds the shortest delta between now and the end of all the actions.
    const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
    //executes all the actions that should've been executed  - eg if the bot crashes. this allows it to catch back up, so to speak.
    data.filter(action => action.end <= now).forEach(action => {
        actionProcessor(client, guildID, action)
    })
    client.DB.set(guildID, data.filter(action => action.end >= now), "persistence.time")
    if (closest === Infinity) return; //if the number is infinity then there are no pending actions.
    const timeTo = closest - now;
    client.log(`checking timeout in ${timeTo} ms`)
    // will only wait a max of 2**31 - 1 because setTimeout breaks after that
    timeouts.set(guildID, setTimeout(check, Math.min(timeTo, 2 ** 31 - 1), client, guildID))
};
module.exports.defaultConfig = {
    requiredPermissions: ["MANAGE_MESSAGES", "MANAGE_ROLES", "MANAGE_NICKNAMES"]
}
