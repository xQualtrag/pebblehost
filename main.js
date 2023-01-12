const { Client, Collection } = require('discord.js');
const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const chalk = require('chalk');
const client = new Client({
    intents: 3597
})
require('dotenv').config();

client.commands = new Collection();

const commandFolder = fs.readdirSync('./commands').filter(file => !file.endsWith('.js'));

let commandsPath;

for (const folder of commandFolder) {
	commandsPath = path.join(__dirname, `commands/${folder}`);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(chalk.red('[Error]') + ' ' + error);
		console.error(error);
		let err = 'There was an error trying to execute that command!' + '```' + error + '```';
		if (err.length > 2000) {
			err = err.slice(0, 2000);
		}
		if (config.owner_ids.includes(interaction.user.id)) {
			await interaction.reply({ content: err , ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
		}
	}
});

client.login(process.env.TOKEN);

// Anti Crash Script:

process.on("unhandledRejection", (reason, p) => {
    console.log(" [antiCrash] :: Unhandled Rejection/Catch");
    // console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch");
    // console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    // console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    console.log(" [antiCrash] :: Multiple Resolves");
    // console.log(type, promise, reason);
});

