const {
    Client,
    IntentsBitField: { Flags: IntentsFlags },
} = require('discord.js');

module.exports = {
    // Create a new client instance
    getClient() {
        return new Client({
            // Enable the required gateway intents
            // https://discord.com/developers/docs/topics/gateway#gateway-intents
            intents: [IntentsFlags.Guilds, IntentsFlags.GuildMessages],
        });
    },
};
