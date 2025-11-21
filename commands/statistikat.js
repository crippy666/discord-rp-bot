const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Session = require('../models/session');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statistikat')
        .setDescription('Shikon top 10 lojtaret me kohe me te madhe'),

    async execute(interaction) {

        const agg = await Session.aggregate([
            { $group: { _id: "$userId", total: { $sum: "$totalMinutes" } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle("Top 10 Lojtarët")
            .setDescription(
                agg.map((x, i) => `**#${i+1}** <@${x._id}> — **${x.total} min**`).join("\n")
            );

        await interaction.reply({ embeds: [embed] });
    }
};
