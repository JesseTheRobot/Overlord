module.exports = (client, member) => {
    client.log(`member ${member.displayname} has left guild ${member.guild.name}`, "INFO") //does not delete any info
    if (!client.DB.get(member.guild.id, `modules.guildMemberRemove`)) { return }
    let state = {
        nick: member.displayName,
        roles: Array.from(member.roles.keys()),
        TS: new Date()
    }
    client.DB.set(member.guild.id, state, `users.${member.id}.savedState`)
}
module.exports.defaultConfig = {
    enabled: true
}