const Discord = require("discord.js");
const client = new Discord.Client({autoReconnect:true, messageCacheMaxSize:-1,messageCacheLifetime:0,messageSweepInterval:0,fetchAllMembers:true});
const fs = require("fs");
var download = require("download-file");
var path = require("path");
const config = require("./config.js");
const enmap = require("enmap");
var trecent =[];
const basedir =((__dirname).split("\\").slice(0,-1)).join("\\")+"\\Overlord";
//const { inspect } = require("util");


/** assigns the client Object a New enmap instance ("DB")*/
Object.assign(client, new enmap({ 
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true
}));

/** Bind the exportable functions from Functions.js to the client object as methods. */
require(`${basedir}\\Functions.js`)(client); 

/** process error catching with custom stacktrace formatting for ease of reading */
process.on("uncaughtException", (err) => {
	console.dir(err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./")); 
	process.exit(1);
});

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' file (SHUTDOWN.txt) that if present prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
function gracefulShutdown(){
	fs.writeFile(`${basedir}\\SHUTDOWN.txt`, "SHUTDOWN",{ flag: "w" }, function(err){
		if (err) console.log(err);
		console.log("Successfully Written Shutdown File.");
	});
	setImmediate(() => {
		process.exit(0);
	});
}

/** PM2 SIGINT and Message handling for invoking a graceful shutdown through PM2 on both UNIX and windows systems */
process
	.on("SIGINT", function() { //unix SIGINT graceful PM2 app shutdown.
		gracefulShutdown();
	})
	.on("message", (msg) => {//Windows "message" graceful PM2 app shutdown. 
		if (msg == "shutdown") {
			gracefulShutdown();
		}
	});

/** catches and logs any Discord.js Client errors */
client.on("error",error =>{client.log("ERR",error);});

/** returns a random integer between two numbers (max exclusive, min inclusive.)
 * @param {int} minimum
 * @param {int} maximum
 */
function getRandomInt(min, max) { 
	min = Math.ceil(min);
	return Math.floor(Math.random() * (Math.floor(max) - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/** authenticates the bot to the discord backend through useage of a Token via Discord.js */
client.login(config.token).then(client =>{
	client.init(client);
});

/** if the client disconnects, gracefully shutdown - this is suboptimal. */
client.on("disconnect", function(event){
	console.error(event)
	gracefulShutdown()
})

/* try{
	console.log("EventHandler Init Sucessful!");
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	client.on("message", message => {
		if (message.author.bot) return;
		message.content = message.cleanContent; //prevent the bot from echo-ing mentions 
		if (message.guild){
			let mobj = `{${message.guild.id}:${message.author.id}}`;
			var usrkey = `${message.guild.id}.users.${message.author.id}`;
			var user = DB.get("servers",usrkey);
			if (!user.strikes){
				user.strikes = [];
			}
			user.strikes.push(new Date());
			user.strikes.push("test");
			//console.log(DB.get("servers",usrkey));
			DB.set("servers",user,usrkey);
			setTimeout(() => {trecent.splice(trecent[trecent.indexOf(mobj)],1);}, interval);
			if ((trecent.filter(value => value == mobj)).length >= mutecap){ //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
				trecent =trecent.filter(value => value != mobj); //wipes array after a strike has been added.
				if (!user.strikes){
					user.strikes = [];
				}
				user.strikes.push(new Date());
				message.channel.send(`${message.author} has had a strike added!`);
			
				//antispam.run(client,message,basedir,user, DB);
			}else{
				trecent.push(mobj);
			}

		}
		
		console.log(trecent);
		
	});
		
}catch(err){
	console.error(err);
} */
