module.exports = (client, guild) => {
    /* timeouts for role/nick/ban(s) - 
    check for expired actions and execute them - 
    role: remove, add : roleID : userID
    remind: userID : Message
    
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
    let guildData = client.DB.get(guild.id).persistence
    guildData

    */

}