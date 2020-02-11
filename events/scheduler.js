let timeout = null;

module.exports = async function check() {
    console.log(`Checking... (timeout = ${timeout})`);
    // sets timeout to run this function again

    // clears previous check refresher
    clearTimeout(timeout);

    const now = + new Date();
    data = client.DB.get(guild.id, "persistence.time")
    // sets this function up to run again
    const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
    if (closest === Infinity) return;
    const timeTo = closest - now;

    // will only wait a max of 2**31 - 1 because setTimeout breaks after that
    timeout = setTimeout(check, Math.min(timeTo, 2 ** 31 - 1));
};

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
}*/
let guildData = client.DB.get(guild.id, "persistence")
let time = Date.now()
guildData.forEach(action => {
    if (action.time >= time) {
        actionProcessor(client, guild.id, action)
    } else {
        setTimeout(actionProcessor(client, guild.id, action), action.time - Date.now())
    }
})

let actionProcessor = (client, guildID, action) => {
    let guild = client.guilds.get(guildID)
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
    }
}
}