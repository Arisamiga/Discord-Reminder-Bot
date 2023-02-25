const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
const { token, clientId, guildId, reminderchannel, activityText } = require('./config.json');

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
		console.error(error);
	}
})();

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: activityText, type: ActivityType.Watching }],
      });
    console.log(`Logged in as ${client.user.tag}!`);

	// Check if any reminders are due
	const reminders = require('./reminders.json');
	const now = new Date();
	for (const reminder of reminders.Reminders) {
		const reminderDate = new Date(reminder.timestamp);
		if (reminderDate < now) {
			console.log("[INFO] Reminder Was Due Before Bot Started. Removing Reminder...");
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
		const now = new Date().getTime();
		for (const reminder of reminders.Reminders) {
			const reminderDate = reminder.timestamp;
			// Check for reminders happening now
			if (reminderDate < now && !reminder.reminders[0].now) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting is Starting Now!`);
				reminder.reminders[0].now = true;
				// Remove the reminder from the list
				const index = reminders.Reminders.indexOf(reminder);
				if (index > -1) {
					reminders.Reminders.splice(index, 1);
				}
			}
			// Check for reminders happening in 5 minutes
			else if (reminderDate < now + 300000 && !reminder.reminders[0].five) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting in 5 minutes!`);
				reminder.reminders[0].five = true;

				// Set all others to true so they don't get sent
				reminder.reminders[0].fifteen = true;
				reminder.reminders[0].thirty = true;
				reminder.reminders[0].hour = true;
				reminder.reminders[0].day = true;
			}
			// Check for reminders happening in 15 minutes
			else if (reminderDate < now + 900000 && !reminder.reminders[0].fifteen) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting in 15 minutes!`);
				reminder.reminders[0].fifteen = true;

				// Set all others to true so they don't get sent
				reminder.reminders[0].thirty = true;
				reminder.reminders[0].hour = true;
				reminder.reminders[0].day = true;

			}

			// Check for reminders happening in 30 minutes
			else if (reminderDate < now + 1800000 && !reminder.reminders[0].thirty) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting in 30 minutes!`);
				reminder.reminders[0].thirty = true;

				// Set all others to true so they don't get sent
				reminder.reminders[0].hour = true;
				reminder.reminders[0].day = true;
			}

			// Check for reminders happening in a hour
			else if (reminderDate < now + 3600000 && !reminder.reminders[0].hour) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting in 1 hour!`);
				reminder.reminders[0].hour = true;

				// Set all others to true so they don't get sent
				reminder.reminders[0].day = true;
			}

			// Check for reminders happening in a day
			else if (reminderDate < now + 86400000 && !reminder.reminders[0].day) {
				client.channels.cache.get(reminderchannel).send(`<@&${reminder.roleid}> Meeting in 1 day!`);
				reminder.reminders[0].day = true;
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