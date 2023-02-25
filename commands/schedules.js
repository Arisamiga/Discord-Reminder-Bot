const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedules')
		.setDescription('Shows all scheduled meetings'),
	async execute(interaction) {
        const reminders = require('../reminders.json');
        if (reminders.Reminders.length == 0) {
            return interaction.reply({ content: `There are no scheduled meetings.`, ephemeral: true });
        }
        const embed = {
            "title": "Scheduled Meetings",
            "description": "Here are all scheduled meetings",
            "color": 16711680,
            "fields": []
        }
        for (var i = 0; i < reminders.Reminders.length; i++) {
            const role = interaction.guild.roles.cache.find(role => role.id === reminders.Reminders[i].roleid);
            embed.fields.push({
                "name": "Meeting",
                "value": `**Date:** ${new Date(reminders.Reminders[i].timestamp * 1000)}\n**Role:** ${role}`
            })
        }
        await interaction.reply({ embeds: [embed] });
	},
};