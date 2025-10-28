import { Client, IntentsBitField } from 'discord.js';

export function getClient() {
    try {
        return new Client({
            // Enable the required gateway intents
            // https://discord.com/developers/docs/topics/gateway#gateway-intents
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.MessageContent,
            ],
        });
    } catch (error) {
        console.error(error);
    }
}
