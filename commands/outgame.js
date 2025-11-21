const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Session = require('../models/session');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('outgame')
        .setDescription('Del nga loja'),

    async execute(interaction) {

        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(config.INGAME_ROLE);
        if (!role) return interaction.reply("Role INGAME nuk u gjet.");

        await member.roles.remove(role);

        // Find last session
        const session = await Session.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            leaveTime: null
        }).sort({ joinTime: -1 });

        if (!session)
            return interaction.reply("Nuk ke asnjë hyrje aktive.");

        session.leaveTime = new Date();

        const diffMs = session.leaveTime - session.joinTime;
        const minutes = Math.floor(diffMs / 60000);

        session.totalMinutes = minutes;
        await session.save();

        // Log embed
        const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNEL);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle("Dalje nga loja")
            .addFields(
                { name: "Lojtari", value: `<@${interaction.user.id}>` },
                { name: "Hyri ne", value: session.joinTime.toLocaleString() },
                { name: "Doli ne", value: session.leaveTime.toLocaleString() },
                { name: "Koha totale", value: `${minutes} minuta` }
            );

        if (logChannel) logChannel.send({ embeds: [embed] });

        await interaction.reply({ content: `Dole nga loja. Total: ${minutes} min`, ephemeral: true });
    }
};
