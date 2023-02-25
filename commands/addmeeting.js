const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, Events, ActionRowBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addmeeting')
		.setDescription('Adds a meeting to the database.')
        .addIntegerOption(option => option.setName('timestamp').setDescription('Add Date in TimeStamp Format').setRequired(true))
        .addStringOption(option => option.setName('role').setDescription('Add Role that should be Mentioned for the Meeting').setRequired(true)),

	async execute(interaction) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('Approve')
					.setLabel('Correct')
					.setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('Deny')
                    .setLabel('Incorrect')
                    .setStyle(ButtonStyle.Danger),
			);


        function addRemindertoJSON(timestamp, role) {
            const reminders = require('../reminders.json');
            if (role.includes("@")) {
                const temp_role = role.replace("<@&", "").replace(">", "");
                const roleInfo = interaction.guild.roles.cache.find(role => role.id === temp_role);
                reminders.Reminders.push({ 
                    "timestamp": timestamp, 
                    "roleid": roleInfo.id,
                    "reminders": [{
                        "now": false,
                        "five": false,
                        "fifteen": false,
                        "thirty": false,
                        "hour": false,
                        "day": false
                    }]
                })
            }
            else {
                const roleInfo = interaction.guild.roles.cache.find(role => role.name === role);
                reminders.Reminders.push({ 
                    "timestamp": timestamp, 
                    "roleid": roleInfo.id,
                    "reminders": [{
                        "now": false,
                        "five": false,
                        "fifteen": false,
                        "thirty": false,
                        "hour": false,
                        "day": false
                    }]
                })
            }
            fs.writeFile('./reminders.json', JSON.stringify(reminders), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        // Check if role is valid
        if (interaction.options.getString("role").includes("@")) {
            const temp_role = interaction.options.getString("role").replace("<@&", "").replace(">", "");
            const role = interaction.guild.roles.cache.find(role => role.id === temp_role);
            if (!role) {
                return interaction.reply({ content: `Role ${interaction.options.getString("role")} does not exist.`, ephemeral: true });
            }
        }
        else {
            const role = interaction.guild.roles.cache.find(role => role.name === interaction.options.getString("role"));
            if (!role) {
                return interaction.reply({ content: `Role ${interaction.options.getString("role")} does not exist.`, ephemeral: true });
            }
        }

        // Check if timestamp is valid is before current time
        if (interaction.options.getInteger("timestamp") < Math.floor(Date.now() / 1000)) {
            return interaction.reply({ content: `Timestamp: **${interaction.options.getInteger("timestamp")}** is in the past.`, ephemeral: true });
        }

		await interaction.reply({ content: `Meeting at: ${new Date(parseInt(interaction.options.getInteger("timestamp")) * 1000).toLocaleString()} \nMentioning: ${interaction.options.getString("role")}. \nIs this correct?`, components: [row], ephemeral: true });
        
        const filter = (interaction) => {
            if (interaction.user.id === interaction.user.id) {
                return true;
            }
            return interaction.followUp({ content: 'You cannot use this button.', ephemeral: true });
        }

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1 });

        collector.on('end', async (ButtonInteraction) => {
            if (ButtonInteraction.first().customId === 'Approve') {
                // Dont mention the role
                addRemindertoJSON(parseInt(interaction.options.getInteger("timestamp")) * 1000, interaction.options.getString("role"));
                await ButtonInteraction.first().update({ content: `Meeting Scheduled for ${new Date(parseInt(interaction.options.getInteger("timestamp")) * 1000).toLocaleString()}. Role: ${interaction.options.getString("role")}`, components: [], ephemeral: true });
            }
            else if (ButtonInteraction.first().customId === 'Deny') {
                await ButtonInteraction.first().reply({content:`Meeting not added.`, ephemeral: true });
            }
        });
	},
};