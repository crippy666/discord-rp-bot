require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load config
const config = require('./config.json');

// Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Load commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath);

for (const file of files) {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
    commands.push(cmd.data.toJSON());
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );
    console.log("Commands registered");
})();

// DB connect
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected");
});

// Command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction, client);
    } catch (err) {
        console.error(err);
        interaction.reply({ content: "Error executing command", ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
