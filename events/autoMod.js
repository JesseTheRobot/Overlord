module.exports = async (client, message) => {
    let user = message.member
    let config = message.settings
    if (user.roles.)
        "guildID.messageID.UserID"
    client.trecent.ensure("")
    let mobj = `{${message.guild.id}:${message.author.id}}`;
    var user = client.DB.get(message.guild.id, `users.${message.author.id}`);
    var trecent = client.trecent[`${message.guild.id}`];
    var interval = message.settings.modules.autoMod.interval;
    var mutecap = message.settings.modules.autoMod.mutecap;
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
        protectedIDs: [],
        penalty: 5,
    }

}

