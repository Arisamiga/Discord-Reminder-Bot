const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timestamp')
		.setDescription('Converts a date to a timestamp')
        .addStringOption(option => option.setName('date').setDescription('Add Date in YYYY-MM-DD HH:MM:SS Format').setRequired(true)),
	async execute(interaction) {
        // Check if date is valid
        if (isNaN(Date.parse(interaction.options.getString("date")))) {
            return interaction.reply({ content: `Date: **${interaction.options.getString("date")}** is not a valid date.`, ephemeral: true });
        }
		await interaction.reply(`Timestamp: **${Date.parse(interaction.options.getString("date"))/1000}**`);
	},
};