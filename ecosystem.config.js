module.exports = {
	apps: [{
		name: "Overlord",
		script: "Overlord.js",
		// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/ - very helpful resource!
		instances: 1,
		autorestart: true,
		watch: false,
		max_memory_restart: "2G",
		combine_logs: true,
		log: ".\\main.log",
		log_date_format: "YYYY-MM-DD HH:mm:ss"
	}],
};
