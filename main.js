const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		console.log(`[INFO] Loaded command ${command.data.name} from ${filePath}.`)
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`-> Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`-> Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `Flies.`, type: ActivityType.Watching }],
      });
    console.log(`Logged in as ${client.user.tag}!`);

	// Check if any reminders are due
	const reminders = require('./reminders.json');
	const now = new Date();
	for (const reminder of reminders.Reminders) {
		const reminderDate = new Date(reminder.timestamp);
		if (reminderDate < now) {
			console.log(`[REMINDER] ${reminder.roleid}`);

			// Remove the reminder from the list
			const index = reminders.Reminders.indexOf(reminder);
			if (index > -1) {
				reminders.Reminders.splice(index, 1);
			}
		}
	}
	fs.writeFileSync('./reminders.json', JSON.stringify(reminders, null, 2));

	// Set up the reminder interval
	setInterval(() => {

		// Check if any reminders are due
		const reminders = require('./reminders.json');
		const now = new Date();
		for (const reminder of reminders.Reminders) {
			const reminderDate = new Date(reminder.timestamp);
			if (reminderDate < now) {
				console.log(`[REMINDER] ${reminder.roleid}`);

				// Remove the reminder from the list
				const index = reminders.Reminders.indexOf(reminder);
				if (index > -1) {
					reminders.Reminders.splice(index, 1);
				}
			}
		}
		fs.writeFileSync('./reminders.json', JSON.stringify(reminders, null, 2));
	}
	, 60000);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token)