
/* timeouts for role/nick/ban(s) - 
check for expired actions and execute them - 
role: remove, add : roleID : userID
remind: userID : Message
guild.
persistence:{
    time:{
        ''messageID'':{
            end: UTS,
            action: role remove RoleID UserID
        }
    },
    messages:{
        id array - used for reaction handling
    }
}
let guildData = client.DB.get(guild.id, "persistence")
let time = Date.now()
guildData.forEach(action => {
    if (action.time >= time) {
        actionProcessor(client, guild.id, action)
    } else {
        setTimeout(actionProcessor(client, guild.id, action), action.time - Date.now())
    }
})
*/
let actionProcessor = async (client, guildID, action) => {
    let guild = client.guilds.get(guildID)
    console.log(action)
    switch (action.type) {
        case "role":
            guild.members.get(action.memberID).roles.removeRole(action.roleID)
            break
        case "reminder":
            client.user.get(action.memberID).send(`scheduled reminder: ${action.message}`)
            break
        case "nick":
            guild.members.get(action.memberID).setNickname(action.nick)
            break
        default:
            console.warn(`unknown Action type/action ${JSON.stringify(action)}`)
            break
    }
}

module.exports = async function check(client, guildID) {
    /** Scheduler - uses setTimeout to call itself 
     * 
     */
    console.log(client)
    console.log(guildID)
    let timeouts = client.timeouts
    if (!timeouts.has(guildID)) timeouts.set(guildID, null)
    let timeout = timeouts.get(guildID)
    console.log(`Checking... (timeout = ${timeout}) ${new Date()} `);
    console.log(timeouts)
    // clears previous check refresher
    clearTimeout(timeout);
    const now = new Date().getTime();
    data = client.DB.get(guildID, "persistence.time")
    const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
    data.filter(action => action.end <= now).forEach(action => {
        actionProcessor(client, guildID, action)
    })
    client.DB.set(guildID, data.filter(action => action.end >= now), "persistence.time")
    if (closest === Infinity) return;
    const timeTo = closest - now;
    console.log(`checking timeout in ${timeTo} ms`)

    // will only wait a max of 2**31 - 1 because setTimeout breaks after that
    timeouts.set(guildID, setTimeout(check, Math.min(timeTo, 2 ** 31 - 1), client, guildID))
    console.log(timeouts)
    console.log(client.timeouts)
};
