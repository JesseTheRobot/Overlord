const Discord = require("discord.js");
const client = new Discord.Client();
const enmap = require("enmap");
//const { StatsD } = require("hot-shots");
//client.dStats = new StatsD("localhost", 8125);
const basedir =((__dirname).split("\\").slice(0,-1)).join("\\")+"\\Overlord";
const fs = require("fs");
//Object.assign(client, enmap.multi(["settings", "blacklist", "testing"], {fetchAll: true, cloneLevel: "deep", ensureProps: true, polling: true,}));
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true,
	ensureProps: true
});
client.commands = new enmap();
console.log( String.fromCharCode(8203));
//.replace(/`/g, "`" + String.fromCharCode(8203));
require(`${basedir}\\Functions.js`)(client);

client.DB.changed = (key,oldVal,newVal) =>{
	client.log("Log",`Key ${key} : ${oldVal} => ${newVal}`);
};

client.login(require("./config.js").token);
client.on("ready",()=>{
	client.DB.defer.then(client.init(client));
});

// take a look at https://github.com/c3duan/Swag-Bot for some inspiration.
//hello, world!