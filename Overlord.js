/**Dependancy Import and initialisation */
console.time("init");
const Discord = require("discord.js");
const enmap = require("enmap");
const client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: 20000, messageCacheLifetime: 86400, messageSweepInterval: 100, disabledEvents: [""] });
client.config = require("./config.js");
client.isShuttingDown = false;
client.fs = require("fs");
client.diff = require("deep-object-diff").detailedDiff;
client.transfer = require("transfer-sh");
client.download = require("download-file");
client.tf = require("@tensorflow/tfjs-node");
client.version = "0.1.9.21012020"; //release.major.minor.date

console.log(`!== Overlord v${client.version} Intialisation starting. current date/time is ${new Date()} ==! `);

async (client) => {//loads Models into memory asyncronously
	if (!client.config.enableModels) return;
	var toxicity = require("@tensorflow-models/toxicity");
	client.NSFWmodel = await require("nsfwjs").load("file://./models/NSFW/", { size: 299 }); //eslint-disable-line
	client.toxicModel = new toxicity.ToxicityClassifier; //eslint-disable-line
	client.toxicModel.loadModel = () => { //overwrite default LoadModel method due to *hard coded* reliance on web-based model files. I didn't like this so I made it use local files instead.
		return require("@tensorflow/tfjs-converter").loadGraphModel("file://./models/toxic/model.json");
	};
	await client.toxicModel.load();

	console.log("Models loaded!");
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
if (process.env.NODE_ENV != "production") {
	client.DB.changed((Key, Old, New) => {
		console.log(`${Key} - ${JSON.stringify(client.diff(Old, New))}`);
		client.dStats.increment("overlord.databaseChange"); //reports to dStats for load statistics
	})
}

client.commands = new enmap();
/** Bind the exportable functions from Functions.js to the client object as methods. */
require("./Functions.js")(client);

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' variable  (client.isShuttingDown) that if true prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
function gracefulShutdown() {
	client.log("System", "Successfully Received Shutdown Request", "GracefulShutdown");
	setTimeout(() => { setImmediate(() => { process.exit(0); }); }, 5500); //after 5.5 seconds, and after all I/O activity has finished, quit the application.
}

/**
 * every 5000ms (5 seconds), checks if the client variable isShuttingDown is true. if it is, signal for the graceful shutdown to begin
 */
setInterval(() => { if (client.isShuttingDown == true) { gracefulShutdown(); } }, 5000);

/**
 * every 12000 seconds, clears out the loaded database keys to help reduce the memory footprint of the bot.
 */
setInterval(() => { client.DB.evict(client.DB.keyArray()); }, 12000);

/** PM2 SIGINT and Message handling for invoking a graceful shutdown through PM2 on both UNIX and windows systems */
process
	.on("SIGINT", () => {//unix SIGINT graceful PM2 app shutdown.
		client.isShuttingDown = true;
	})
	.on("message", (msg) => {//Windows "message" graceful PM2 app shutdown. 
		if (msg == "shutdown") {
			client.isShuttingDown = true;
		}
	})
	.on("uncaughtException", (err) => {
		console.dir(err.stack.replace(new RegExp(`${__dirname} / `, "g"), "./")); /** process error catching with custom stacktrace formatting for ease of reading */
		process.exit(1);
	});

/** catches and logs any Discord.js Client errors */
client
	.on("error", error => { client.log("ERR", error); })
	/** if the client disconnects, report the disconnection */
	.on("disconnect", (event) => {
		console.error(event);
		client.isShuttingDown = true; /**this event signifies that the connection to discord cannot be re-established and will no longer be re-attempted. so we restart the bot process to (hopefully) fix this (note: requires PM2 to restart the process).*/
	});

/** authenticates the bot to the discord backend through useage of a Token via Discord.js. waits for the Database to load into memory, then starts the initialisation. */
client.login(client.config.token);
client.on("ready", () => {
	client.DB.defer.then(
		client.init(client)
	);
});