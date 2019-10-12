exports.run = (client, basedir) => {
	client.DB.defer.then( (...) => {

	}
};
/*//some documentation here:
	// imports files
	console.time("init");
	const fs = require("fs");
	const jsonfile = require("jsonfile");
	// reads files
	const file = (`${basedir}\\UserData.json`);
	const directory = (`${basedir}\\datastore\\`);
	const { ownerID } = require(`${basedir}\\Config.json`);
	const { prefix } = require(`${basedir}\\Config.json`);
	//console.log(fs.statSync("UserData.json"));
	//if (!= 0){
	let DB = client.DB;
	try{
		const owner = client.users.get(ownerID);
		fs.unlink(`${basedir}\\SHUTDOWN.txt`, err => {
			if (err) console.log("Shutdown flag does not exist - expected.");
		});
		//console.log('\033c');
		client.user.setPresence({ //TODO Update this to rich presence for cool stuffs.
			game: { 
				name: `${prefix}help | SUB TO PEWDIEPIE(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧🛠💜🦄Being Built!🦄💜🛠✧ﾟ･: *ヽ(◕ヮ◕ヽ) (v1.2.4) now on ${client.guilds.size} servers!`,
				type: "PLAYING"
			},
			status: "active"
		});
		if (DB.servers == undefined){
			owner.send("THE DATABASE IS EMPTY SEND HELP ");
			console.log(DB.servers);
			console.log("DB is empty!"); //panics if the DB is, well, gone.
			DB = {
				servers: {},
				images: {}
			};
		}
		//main init and DB check  - checks that all guilds have entries within the Database (keyed by snowflake)
		console.log(`!== Jesse v 2.0 Intialisation starting. current date/time is ${new Date()} ==! `);
		console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
		const stats = fs.statSync(`${basedir}\\main.log`);
		owner.send(`Main log has reached ${(stats.size / 1000000.0)}Mb in size\rtime is ${new Date()}`); //sends owner current log size anmd the date of the reinitalisation. 
		client.guilds.forEach(guild => {
		//initialises guild object within DB if one does not exist
			if (! DB.servers.hasOwnProperty(`${guild.id}`)){
				DB.servers[`${guild.id}`] = {
					users: {},
					config: { "logs": "" }
				};
				console.log(`added guild with id of ${guild.id}`);
			}
			//var logs = DB.servers[guild.id].logs;
			//console.log(logs);
			guild.channels.forEach(channel =>{
				client.getChannelLogs(channel, 1000, function(error){
					console.log(error);
				});
			});
			//reads out the configured logs channel - would eventually use this to send toggleable bootup messages.
			//var logs = guild.channels.find(channel => channel.name == "superlog");
			//logs.send("```diff\n-ChakravartinCore Initialisation complete!\n-Loading XP-User datasets.\n-Loading Imageindex ```"
			var dir = `${basedir}\\datastore\\${guild.id}`;
        
			//checks existance of Sever-specific folders. make new ones keyed by server snowflake if they don't exist
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
        
			//Checks for new members for each guild, and adds them to DB
			guild.members.forEach(member => {

				var users = DB.servers[guild.id].users;
				if (users[member.user.id] == undefined){
					console.log(`user ${member.id} added to data json`);
					users[member.user.id] = { xp: 0, bois: [], strikes: [] }; //XP: integer. bois: array of timecodes. strikes: array of timecodes.
				}
				if (users[member.id].strikes.length > 1){
					users[member.id].strikes.forEach(strike =>{
						if (new Date() - Date.parse(strike) >= decay){
							console.log(Date.parse(strike));
							users[member.user.id].strikes = users[member.user.id].strikes.filter(mstrike => mstrike != strike);
							console.log(users[member.user.id].strikes);
						}

					});
				}
				console.log(member);
				if (member.isMuted){
					let tdelta = new Date() - member.isMuted[1];
					console.log(typeof tdelta);
					console.log(tdelta);

				}
			});		

			//  reads through the files in Directory and appends their names to DB.images
			//  makes sure all files in [directory] have an entry in DB.images
			//  if it doesn't, DB.images[fileName] = 0;
			const files = fs.readdirSync(directory);
			files.forEach(file => {
				const fileName = file.slice(0,-4);
				if (DB.images[fileName] == undefined) {
					DB.images[fileName] = 0;
				}
			});
		});
		jsonfile.writeFile(file, DB, { flag: "w", spaces: 4 });
	}catch (error){
		if (error instanceof SyntaxError && fs.statSync("UserData.json") < 20){ //experimental DB recovery operation.
			console.log("reloading DB");
			jsonfile.writeFile(file, "{}", { flag: "w", spaces: 4 });
			console.log(error);
		}else{
			console.log(error);
	
		}
	}*/