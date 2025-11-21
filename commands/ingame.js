const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Session = require('../models/session');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ingame')
        .setDescription('Hyn ne lojë'),

    async execute(interaction, client) {

        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(config.INGAME_ROLE);

        if (!role) return interaction.reply("Role INGAME nuk u gjet.");

        await member.roles.add(role);

        // Create new session
        const newSession = new Session({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            joinTime: new Date(),
            totalMinutes: 0
        });

        await newSession.save();

        // Log embed
        const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNEL);
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle("Hyrje në lojë")
            .addFields(
                { name: "Lojtari", value: `<@${interaction.user.id}>` },
                { name: "Koha", value: `${new Date().toLocaleString()}` }
            );

        if (logChannel) logChannel.send({ embeds: [embed] });

        await interaction.reply({ content: "U regjistrove si In-Game.", ephemeral: true });
    }
};
