/**
 * Triggered when a user leaves a guild. the bot will copy their state from just before they left and save it
 * (roles and nicknames)
 * @param {object} client
 * @param {object} member - object of the member that just left the guild.
 */
module.exports = (client, member) => {
    //log the fact that a member has left the guild
    client.log(`member ${member.displayname} has left guild ${member.guild.name}`, "INFO")
    //if the module is disabled, do nothing.
    if (!client.DB.get(member.guild.id, `modules.guildMemberRemove`).enabled) { return }
    //create state
    let state = {
        nick: member.displayName,
        roles: Array.from(member.roles.keys()),
        TS: new Date()
    }
    //save state
    client.DB.set(member.guild.id, state, `users.${member.id}.savedState`)
}
module.exports.defaultConfig = {
    enabled: true
}