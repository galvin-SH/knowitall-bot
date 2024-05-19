const {
    Client,
    IntentsBitField: { Flags: IntentsFlags },
} = require('discord.js');

module.exports = {
    getClient() {
        return new Client({
            intents: [IntentsFlags.Guilds, IntentsFlags.GuildMessages],
        });
    },
};
