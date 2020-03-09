module.exports = async (client, message) => {
    let config = message.settings
    let modConfig = config.autoMod
    let antiSpam = async (client, message) => {
        let member = message.member
        let trecent = client.trecent.get(message.guild.id)
        if (member.roles.array.filter(role => config.excludedRoles.has(role)).size >= 1) { return } //exclude those who have configured 'protected' roles
        trecent.ensure(member.id, `${message.channel.id}`)

        setTimeout(() => { trecent.splice(trecent[trecent.indexOf(mobj)], 1); }, interval);
        if ((trecent.filter(value => value == mobj)).length >= mutecap) { //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
            trecent = trecent.filter(value => value != mobj); //wipes array after a strike has been added.
            if (!user.strikes) {
                user.strikes = [];
            }
            user.strikes.push(new Date());
            message.channel.send(`${message.author} has had a strike added!`);
            //penalise the user!
        } else {
            trecent.push(mobj);
        }
    }
    let antiMention = (client, message) => {
        if (message.mentions.array.filter(mentionedID => modConfig.antiMention.has(mentionedID)).length >= 1) {
            //penalise the user!
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
    antiMention: {
        enabled: true,
        protectedRoleIDs: [],
        pingEveryone: false,
        penalty: 5,
    },
    requiredPermissions: ["MANAGE_MESSAGES"]

}

