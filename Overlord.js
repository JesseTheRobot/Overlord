const Discord = require("discord.js");
const client = new Discord.Client({autoReconnect:true, messageCacheMaxSize:-1,messageCacheLifetime:0,messageSweepInterval:0,fetchAllMembers:true});
const fs = require("fs");
client.config = require("./config.js");
const enmap = require("enmap");
//const { inspect } = require("util");
client.isShuttingDown = false;
client.diff = require("deep-object-diff").detailedDiff;
/** assigns the client Object a New enmap instance ("DB")*/
client.DB = new enmap({ 
	name: "DB",
	autoFetch: true,
	fetchAll: false,
	polling: true
});


/**optional debug system to monitor any/all changes to the Database Object */
client.DB.changed((Key, Old, New) => {
	console.log(JSON.stringify(client.diff(Old,New)));
	client.dStats.increment("overlord.databaseChange");
});

client.commands = new enmap();
/** Bind the exportable functions from Functions.js to the client object as methods. */
require("./Functions.js")(client); 

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' file (SHUTDOWN.txt) that if present prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
function gracefulShutdown(){
	fs.writeFile("./SHUTDOWN.txt", "SHUTDOWN",{ flag: "w" }, function(err){
		if (err) console.log(err);
		client.log("System","Successfully Written Shutdown File.","GracefulShutdown");
	});
	setTimeout(function(){setImmediate(() => {process.exit(0);});},5500); //after 5.5 seconds, and after all I/O activity has finished, quit the application.
	
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
	})
	.on("uncaughtException", (err) => {
		console.dir(err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./")); /** process error catching with custom stacktrace formatting for ease of reading */
		process.exit(1);
	});

/** catches and logs any Discord.js Client errors */
client
	.on("error",error =>{client.log("ERR",error);})
/** if the client disconnects, report the disconnection */
	.on("disconnect", function(event){
		console.error(event);
	});


/** returns a random integer between two numbers (max exclusive, min inclusive.)
 * @param {int} minimum
 * @param {int} maximum
 */
function getRandomInt(min, max) { 
	min = Math.ceil(min);
	return Math.floor(Math.random() * (Math.floor(max) - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/** removes the operation locking file to allow the bot to accept incoming commands */
fs.unlink(`${process.cwd()}\\SHUTDOWN.txt`, err => {
	if (err) client.log("Log","Shutdown operation locking file does not exist - expected.","LockingFileCheck");
});

/**
 * every 5000ms (5 seconds), checks if the operation locking file is present. if it is, signal to the rest of the application via client variable
 */
setInterval(function(){if(fs.existsSync("./SHUTDOWN.txt")){client.isShuttingDown = true;}},5000); 

/** authenticates the bot to the discord backend through useage of a Token via Discord.js. waits for the Database to load into memory, then starts the initialisation. */
client.login(client.config.token);
client.on("ready",()=>{
	client.DB.defer.then(
		client.init(client)
	);
});



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
