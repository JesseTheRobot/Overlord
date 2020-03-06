
/* timeouts for role/nick/ban(s) - 
check for expired actions and execute them - 
role: remove, add : roleID : userID
remind: userID : Message
guild.
*/
let actionProcessor = async (client, guildID, action) => {
    let guild = client.guilds.get(guildID)
    console.log(action)
    switch (action.type) {
        case "roleRemove":
            guild.members.get(action.memberID).roles.removeRole(action.roleID)
            break
        case "reminder":
            client.users.get(action.memberID).send(`scheduled reminder: ${action.message}`)
            break
        case "nickReset":
            guild.members.get(action.memberID).setNickname(action.nick)
            break
        default:
            client.log(`unknown Action type/action ${JSON.stringify(action)}`, "WARN")
            break
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
    client.log(`Checking... (timeout = ${timeout}) ${new Date()} `);
    // clears previous check refresher
    clearTimeout(timeout);
    const now = new Date().getTime();
    let data = client.DB.get(guildID, "persistence.time")
    if (!data) return
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
