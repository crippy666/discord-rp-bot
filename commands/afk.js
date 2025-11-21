const { SlashCommandBuilder } = require('discord.js');
const Session = require('../models/session');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Shkon AFK'),

    async execute(interaction) {

        const member = interaction.member;
        const afkRole = interaction.guild.roles.cache.get(config.AFK_ROLE);
        const ingameRole = interaction.guild.roles.cache.get(config.INGAME_ROLE);

        if (ingameRole) await member.roles.remove(ingameRole);
        if (afkRole) await member.roles.add(afkRole);

        // close any active session
        const session = await Session.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            leaveTime: null
        }).sort({ joinTime: -1 });

        if (session) {
            session.leaveTime = new Date();
            session.totalMinutes = Math.floor((session.leaveTime - session.joinTime) / 60000);
            await session.save();
        }

        await interaction.reply({ content: "Tani je AFK.", ephemeral: true });
    }
};
