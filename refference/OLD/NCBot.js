const Discord = require("discord.js");
const client = new Discord.Client({autoReconnect:true, messageCacheMaxSize:-1,messageCacheLifetime:0,messageSweepInterval:0,fetchAllMembers:true});
const fs = require("fs");
var download = require("download-file");
var path = require("path");
//var os = require("os");
//var util = require("util");
const config = require("./config.json");
const jsonfile = require("jsonfile");
const basedir =((__dirname).split("\\").slice(0,-1)).join("\\")+"\\Overlord";
console.log(basedir);
const XP = new Set();//check docs for split method for message delete/update operations.
//const antispam = require("./antispam.js");
let interval = 300000; //interval in which the mutecap can be hit.
let mutecap = 4; //number of messages to tolerate in interval ms 
let trecent =[];
const antispam = require("./antispam.js");
console.log("!BEGIN INIT!"); //simple flag
process.on("uncaughtException", (err) => {
	console.error("There was an uncaught error", err);
	process.exit(1); 
});
process.on("SIGINT", function() {
	fs.writeFile(`${basedir}\\SHUTDOWN.txt`, "SHUTDOWN",{ flag: "w" }, function(err){
		if (err) console.log(err);
		console.log("Successfully Written Shutdown File.");
	});
	setImmediate(() => {
		process.exit(0);
	});
});
const file = (`${basedir}\\UserData.json`);
client.on("error",error =>{console.error(error);});
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
try{
	fs.readdir(`${basedir}\\events\\`, (err, files) => {
		if (err) return console.error(err);
		files.forEach(file => {
			if (!file.endsWith(".js")) return;
			let eventFunction = require(`./events/${file}`);
			let eventName = file.split(".")[0];
			// super-secret recipe to call events with all their proper arguments *after* the `client` var.
			client.on(eventName, (...args) => eventFunction.run(client, ...args, basedir));
		});
	});
	console.log("EventHandler Init Sucessful!");
	//console.log(client.emojis.find(emoji => emoji.name === "purple_heart")) 
	client.on("message", message => {
		if (message.author.bot) return;
		delete require.cache[require.resolve(`${file}`)];
		let DB =require(`${file}`);
		let mobj = `{${message.guild.id}:${message.author.id}}`;
		var user = DB.servers[message.guild.id].users[message.author.id];
		setTimeout(() => {trecent.splice(trecent[trecent.indexOf(mobj)],1);}, interval);
		if ((trecent.filter(value => value == mobj)).length >= mutecap){ //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
			trecent =trecent.filter(value => value != mobj); //wipes array after a strike has been added.
			if (!user.strikes){
				user.strikes = [];
			}
			user.strikes.push(new Date());
			message.channel.send(`${message.author} has had a strike added!`);
			jsonfile.writeFile(file, DB, { flag: "w", spaces: 4 });
			antispam.run(client,message,basedir,user, DB);
		}else{
			trecent.push(mobj);
		}
		//function ban{
		//	console.log("aa")
		//}
		//ANTISPAM CODE BELOW!!!
		console.log(trecent);
		message.content = message.cleanContent;
		//if (message.content.includes("uwu")){
		//	ban(message.author,"being a furry");
		//}
		if (message.mentions.users.size != 0 && message.guild.id == 318147823726231554){
			message.react(client.emojis.find(emoji => emoji.name === "angryping"));
		}
		if (message.attachments){
			message.attachments.array().forEach(attachment =>{
				console.log({directory: `${basedir}\\deleted\\`, filename: `${message.id+path.extname(attachment.url)}`});
				download(attachment.url,{directory: `${basedir}\\deleted\\`, filename: `${message.id+path.extname(attachment.url)}`});
			});
		}
		if (!(XP.has(message.author.id))){
			XP.add(message.author.id);
			if (message.channel.type != "dm"){
				//let DB = require(`${basedir}\\UserData.json`);
				console.log(`XP: user ${message.author.id}.`);
				DB.servers[message.guild.id].users[message.author.id].xp =(DB.servers[message.guild.id].users[message.author.id].xp + getRandomInt(15,25));
				console.log(`${DB.servers[message.guild.id].users[message.author.id].xp}`);
				jsonfile.writeFile(file, DB, { flag: "w", spaces: 4 });
			}
		}
		if(message.content.indexOf(config.prefix) !== 0) return;
		if (fs.existsSync(`${basedir}\\SHUTDOWN.txt`)){ //checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
			console.log("command execution failed - system currently shutting down.");
			message.channel.send({embed:{
				color: 3447003,
				title: "System Error",
				fields: [{
					name: "Please try again later",
					value: "the System is currently undergoing a shutdown - please try again later."
				}],
				timestamp: new Date(),
			}});
			return;
		}
		const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		console.log(`user ${message.author.username} used command ${command} at time ${new Date()} with arguements ${args}`);
		try {
			let commandFile = require(`./commands/${command}.js`);
			commandFile.run(client, message, args, basedir);
		} catch (err) {
			console.log("can't find module. (probably) expected.");
			console.log(err);
			try {
				let imgFile = require("./commands/i.js");
				imgFile.run(client, message, args, basedir);
			} catch (er) {
				console.log(er);
			}
		}
	});
	client.login(config.token);
}  catch(err){
	console.error(err);
}