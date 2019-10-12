exports.run = (client, member, basedir) =>{
	let file = (`${basedir}\\UserData.json`);
	console.log(`new member with ID ${member.id} has joined ${member.guild.name}`);
	let DB = require(file);
	let jsonfile = require("jsonfile");
	console.log(member.id);
	DB.servers[member.guild.id].users[member.user.id] ={xp: 0, bois: []};
	jsonfile.writeFile(file, DB, { flag: "w", spaces: 4 });
	if(member.guild.systemChannel){
		member.guild.systemChannel.send(`${member} has joined ${member.guild.name}!`);
	}
	//try{
	////}catch(e){
	////    console.log(e);
	//}
};