exports.run = async (client, message, args, basedir) =>{
    const { ownerID } = require(`${basedir}\\Config.json`);
    if (message.author.id != ownerID ) return;
    const decay = 1800000; //1.8 mil milliseconds - 30 minutes.
    let DB = require(`${basedir}\\UserData.json`);
    client.guilds.forEach(guild => {
        guild.members.forEach(member => {
            var users = DB.servers[guild.id].users;
            if (users[member.id].strikes.length > 1){
                users[member.id].strikes.forEach(strike =>{
                    if (new Date() - Date.parse(strike) >= decay){
                        console.log(Date.parse(strike));
                        users[member.user.id].strikes = users[member.user.id].strikes.filter(mstrike => mstrike != strike);
                        console.log(users[member.user.id].strikes);
                    }
                });
            }
        })
    })
};