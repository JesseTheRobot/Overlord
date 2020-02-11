module.exports = (client, guild) => {
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