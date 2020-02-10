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
        

    }
    let removeRole = async(client,guildID,memberID,roleID) =>{
        let guild = client.guilds.get(guildID)
        guild.members.get(memberID).removeRole(guild.roles.get(roleID))
    }
    let actionProcessor =(client,guildID,action){
        let guildData = client.DB.get(guildID,"persistence")
        client.get(guildID).members.get()

        switch(action.type){
            case "role":{

            },
            case "reminder":{

            }
        }
    }
    
    switch()

    */

}