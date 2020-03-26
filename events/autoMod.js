module.exports = async (client, message) => {
    let config = message.settings
    let modConfig = config.autoMod
    let antiSpam = async (client, message) => {
        let ASconfig = modConfig.antiSpam
        let member = message.member
        let trecent = client.trecent
        if (Array.from(member.roles).filter(role => ASconfig.excludedRoles.includes(role)).size >= 1) { return } //exclude those who have configured 'protected' roles
        trecent.ensure(message.guild.id, [], message.channel.id)
        setTimeout(() => { trecent.remove(message.guild.id, member.id, message.channel.id) }, ASconfig.interval)
        if ((trecent.get(message.guild.id, message.channel.id).filter((user) => user === member.id)).length >= ASconfig.count) {
            client.log("exceeded")
        }
    }
}

module.exports.defaultConfig = {
    enabled: true,
    bannedWords: [],
    excludedRoles: [],
    percentCapsLimit: 0,
    floodPercentLimit: 0,
    decay: 30000,
    antiSpam: {
        enabled: true,
        interval: 2000,
        count: 2,
        penalty: 1,
    },
    penalties: {
        repeatOffenceMultiplier: 2,
        repeatOffenceTimeout: 10000
    },
    punishments: {
        5: "mute",
        10: "tempBan",
        15: "ban",
    },
    requiredPermissions: ["MANAGE_MESSAGES"]

}


