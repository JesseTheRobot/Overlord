/**Dependancy Import and initialisation */
console.time("init");
const Discord = require("discord.js");
const enmap = require("enmap");
const client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: -1, messageCacheLifetime: 0, messageSweepInterval: 0, fetchAllMembers: true });
client.config = require("./config.js");
client.isShuttingDown = false;
client.fs = require("fs");
client.diff = require("deep-object-diff").detailedDiff;
client.transfer = require("transfer-sh");
client.download = require("download-file");
client.tf = require("@tensorflow/tfjs-node");
client.version = "0.1.9.21112019"; //release.major.minor.date

console.log(`!== Overlord v${client.version} Intialisation starting. current date/time is ${new Date()} ==! `);
async (client) => {
	client.NSFWModel = await require("nsfwjs").load("file://./model/", { size: 299 }); //load NN for NSFW detection
	client.toxicModel = await require("@tensorflow-models/toxicity").load(); //load NN for Toxicity
};
/** assigns the client Object a New enmap instance ("DB") - */
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: false,
	polling: true,
	dataDir: client.config.datadir
});

/**optional debug system to monitor any/all changes to the ENMAP Database */
client.DB.changed((Key, Old, New) => {
	console.log(JSON.stringify(client.diff(Old, New)));
	client.dStats.increment("overlord.databaseChange"); //reports to dStats for load statistics
});

client.commands = new enmap();
/** Bind the exportable functions from Functions.js to the client object as methods. */
require("./Functions.js")(client);

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' variable  (client.isShuttingDown) that if true prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
function gracefulShutdown() {
	client.log("System", "Successfully Received Shutdown Request", "GracefulShutdown");
	setTimeout(function () { setImmediate(() => { process.exit(0); }); }, 5500); //after 5.5 seconds, and after all I/O activity has finished, quit the application.
}

/**
 * every 5000ms (5 seconds), checks if the client variable isShuttingDown is true. if it is, signal for the graceful shutdown to begin
 */
setInterval(function () { if (client.isShuttingDown == true) { gracefulShutdown(); } }, 5000);

/** PM2 SIGINT and Message handling for invoking a graceful shutdown through PM2 on both UNIX and windows systems */
process
	.on("SIGINT", function () {//unix SIGINT graceful PM2 app shutdown.
		client.isShuttingDown = true;
	})
	.on("message", (msg) => {//Windows "message" graceful PM2 app shutdown. 
		if (msg == "shutdown") {
			client.isShuttingDown = true;
		}
	})
	.on("uncaughtException", (err) => {
		console.dir(err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./")); /** process error catching with custom stacktrace formatting for ease of reading */
		process.exit(1);
	});

/** catches and logs any Discord.js Client errors */
client
	.on("error", error => { client.log("ERR", error); })
	/** if the client disconnects, report the disconnection */
	.on("disconnect", function (event) {
		console.error(event);
		client.isShuttingDown = true; /**this event signifies that the connection to discord cannot be re-established and will no longer be re-attempted. so we restart the bot process to (hopefully) fix this (note: requires PM2 to restart the process).
										*this seems dumb, like why not just use an event emitter? well, it means I can easily block commands from processing by just cehcking the value of this variable in the message event handler. otherwise I would've used an Emitter.
										*/
	});

/** authenticates the bot to the discord backend through useage of a Token via Discord.js. waits for the Database to load into memory, then starts the initialisation. */
client.login(client.config.token);
client.on("ready", () => {
	client.DB.defer.then(
		client.init(client)
	);
});