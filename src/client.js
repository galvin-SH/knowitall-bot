/**
 * @fileoverview Discord client configuration and initialization.
 * @module client
 */

import { Client, IntentsBitField } from 'discord.js';
import logger from './logger.js';

/**
 * Creates and returns a configured Discord.js client instance.
 *
 * @returns {Client} Configured Discord.js client with required gateway intents
 * @throws {Error} If client creation fails
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
 */
export function getClient() {
    try {
        return new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.MessageContent,
            ],
        });
    } catch (error) {
        logger.error(error);
    }
}
