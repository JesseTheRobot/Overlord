/* timeouts for role/nick/ban(s) - 
check for expired actions and execute them - 
role: remove, add : roleID : userID
remind: userID : Message
guild.
*/

function inRange(x, min, max) {
    return ((x - min) * (x - max) < 0);
}

let actionProcessor = async (client, guildID, action) => {
    let guild = client.guilds.get(guildID)
    switch (action.type) {
        case "roleRemove":
            guild.members.get(action.memberID).removeRole(action.roleID)
            break
        case "reminder":
            client.users.get(action.memberID).send(`scheduled reminder: ${action.message}`)
            break
        case "nickReset":
            guild.members.get(action.memberID).setNickname(action.nick)
            break
        case "roleAdd":
            guild.members.get(action.memberID).addRole(action.roleID)
            break;
        case "unban":
            guild.unban(action.memberID)
            break;
        case "demerit":
            let mConf = client.DB.get(guild.id).modules.autoMod
            let data = client.DB.get(guildID, `users.${action.memberID}.demerits`)
            let intervals = Math.max(Math.floor((new Date() - data.TS) / (3600000 * mConf.decay)), 0)
            let afterDecay = data.count - intervals
            let target = guild.members.get(action.memberID)
            Object.entries(client.DB.get(guildID, "modules.autoMod.punishments")).forEach(pt => {
                if (inRange(data.count, pt[1].end, pt[1].start) && !inRange(afterDecay, pt[1].end, pt[1].start)) { //if it was originally in range, but is no longer in range, undo the action.
                    client.log(`Removing Punishment "${pt[0]}" to user ${client.users.get(action.memberID).tag}.`)
                    switch (pt[0]) {
                        case "mute":
                            actionProcessor(client, guildID, { memberID: action.memberID, type: "roleRemove", roleID: guild.mutedRole })
                            break;
                        case "tempBan":
                            actionProcessor(client, guildID, { memberID: action.memberID, type: "unban" })
                            break;
                    }
                } else if (!inRange(data.count, pt[1].end, pt[1].start) && afterDecay > pt[1].start) { //if it wasn't in range and is now above the start, apply.
                    client.log(`Applying Punishment "${pt[0]}" to user ${client.users.get(action.memberID).tag}.`)
                    switch (pt[0]) {
                        case "mute":
                            client.emit("modActions", {
                                type: "actionProcessor",
                                title: "Mute of User",
                                requestedAction: {
                                    type: "mute"
                                },
                                memberID: action.memberID,
                                guildID: guildID,
                                request: `Mute of user ${target.tag}`,
                                src: "Automated punishment due to reaching demerit threshold.",
                                trigger: {
                                    type: "Automatic"
                                },
                                executor: client.user
                            })
                            break;
                        case "tempBan":
                            client.emit("modActions", {
                                type: "actionProcessor",
                                title: "Temporary ban of User",
                                requestedAction: {
                                    type: "ban"
                                },
                                memberID: action.memberID,
                                guildID: guildID,
                                request: `Temporary ban of user ${target.tag}`,
                                src: "Automated punishment due to reaching demerit threshold.",
                                trigger: {
                                    type: "Automatic"
                                },
                                executor: client.user
                            })
                            break;
                        case "ban":
                            client.emit("modActions", {
                                type: "actionProcessor",
                                title: `Ban of User ${target.tag}`,
                                requestedAction: {
                                    type: "ban"
                                },
                                memberID: action.memberID,
                                guildID: guildID,
                                request: "Ban of user",
                                src: "Automated punishment due to reaching demerit threshold",
                                trigger: {
                                    type: "Automatic"
                                },
                                executor: client.user
                            })
                            break;
                    }
                }
                client.DB.set(guildID, { count: afterDecay, TS: new Date() }, `users.${action.memberID}.demerits`)

            })


            action.end = new Date().setTime(new Date().getTime() + (mConf.decay * 3600001))
            client.DB.set(guildID, client.DB.get(guildID, "persistence.time").filter(act => act.memberID !== action.memberID), "persistence.time")
            client.schedule(guildID, action)

            break
        default:
            client.log(`Unknown action type/action ${JSON.stringify(action)}`, "WARN")
            break;
    }
}

module.exports = async function check(client, guildID) {
    /** Scheduler - uses setTimeout to call itself 
     * array of objects (ik ik....)
     * "action:"{end:TS,type:typeInst,...data}
     */
    let timeouts = client.timeouts
    if (!timeouts.has(guildID)) timeouts.set(guildID, null)
    let timeout = timeouts.get(guildID)
    client.log(`Checking... (timeout = ${timeout}) ${new Date()} `, "INFO");
    // clears previous check refresher
    clearTimeout(timeout);
    const now = new Date()
    let data = client.DB.get(guildID, "persistence.time")
    if (data.length == 0) return
    const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
    data.filter(action => action.end <= now).forEach(action => {
        actionProcessor(client, guildID, action)
    })
    client.DB.set(guildID, data.filter(action => action.end >= now), "persistence.time")
    if (closest === Infinity) return;
    const timeTo = closest - now;
    client.log(`checking timeout in ${timeTo} ms`)
    // will only wait a max of 2**31 - 1 because setTimeout breaks after that
    timeouts.set(guildID, setTimeout(check, Math.min(timeTo, 2 ** 31 - 1), client, guildID))
};
module.exports.defaultConfig = {
    requiredPermissions: ["MANAGE_MESSAGES", "MANAGE_ROLES", "MANAGE_NICKNAMES"]
}
