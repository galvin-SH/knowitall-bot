/**
 * @fileoverview Discord voice channel connection management.
 * @module voiceConnection
 */

import { joinVoiceChannel } from '@discordjs/voice';

/**
 * @typedef {import('discord.js').Client} Client
 * @typedef {import('@discordjs/voice').VoiceConnection} VoiceConnection
 */

/**
 * Joins a Discord voice channel and returns the connection.
 *
 * @param {Client} client - The Discord.js client instance
 * @param {string} guild - The guild (server) ID to connect to
 * @param {string} channel - The voice channel ID to join
 * @returns {VoiceConnection} The voice connection instance
 * @throws {Error} If joining the voice channel fails
 */
export function getConnection(client, guild, channel) {
    try {
        return joinVoiceChannel({
            channelId: channel,
            guildId: guild,
            adapterCreator: client.guilds.cache.get(guild).voiceAdapterCreator,
        });
    } catch (error) {
        console.error(error);
    }
}
