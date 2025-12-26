/**
 * @fileoverview Main entry point for the Discord bot.
 * Handles message events, LLM responses, and voice playback.
 * @module index
 */

import 'dotenv/config.js';
import { getClient } from './client.js';
import { getOllama, sendRequest } from './ollama.js';
import { getContext, addContext } from './context.js';
import { getConnection } from './voiceConnection.js';
import { Events } from 'discord.js';
import {
    createAudioPlayer,
    createAudioResource,
    StreamType,
    NoSubscriberBehavior,
} from '@discordjs/voice';
import { generateTTS } from './tts.js';
import logger from './logger.js';

/** @constant {RegExp} MENTION_REGEX - Pattern to match Discord user mentions */
const MENTION_REGEX = /(<+@)+[0-9]+>/g;

/** @constant {string} BOT_OWNER_ID - Discord user ID of the bot owner (bypasses voice channel check) */
const BOT_OWNER_ID = process.env.MY_DISCORD_ID;

/** @constant {number} MAX_MESSAGE_LENGTH - Maximum characters per Discord message */
const MAX_MESSAGE_LENGTH = 1950;

const client = getClient();
const ollama = getOllama();
const context = getContext();

/**
 * Handles the ClientReady event when the bot successfully logs in.
 */
client.on(Events.ClientReady, () => {
    logger.info(`Logged in as ${client.user.displayName}!`);
});

/**
 * Handles incoming messages that mention the bot.
 * Processes the message through Ollama, generates TTS, and plays audio in voice channel.
 */
client.on(Events.MessageCreate, async (message) => {
    try {
        // Ignore messages from bots and messages that don't mention the client
        if (message.author.bot || !message.mentions.has(client.user)) return;

        // Require users to be in the bot's voice channel (except bot owner)
        if (message.author.id !== BOT_OWNER_ID) {
            if (
                message.member.voice.channel?.id !==
                process.env.DISCORD_CHANNEL_ID
            ) {
                return message.reply(
                    'Please join the voice channel that I am currently in to use this command!'
                );
            }
        }

        // Extract message content without the mention
        const content = message.content.replace(MENTION_REGEX, '').trim();
        if (!content) return;

        // Add user message to context
        await addContext(context, {
            role: 'user',
            content: `${message.author.username} said: "${content}"`,
        });

        // Connect to voice channel
        const connection = getConnection(
            client,
            process.env.DISCORD_GUILD_ID,
            process.env.DISCORD_CHANNEL_ID
        );
        (await connection)
            ? logger.info('Connected to the voice channel!')
            : logger.error('Failed to connect to the voice channel!');

        // Create audio player
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });

        // Get response from Ollama
        const response = await sendRequest(ollama, context);
        await addContext(context, response.message);

        let botMessage = response.message.content.trim();
        if (!botMessage) botMessage = 'Sorry, something went wrong on my end!';

        // Generate and play TTS audio
        const audioPath = await generateTTS(
            botMessage,
            process.env.VOICE_MODEL
        );
        const resource = createAudioResource(audioPath, {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
        connection.subscribe(player);

        player.on('stateChange', (oldState, newState) => {
            logger.debug(
                `Audio player transitioned from ${oldState.status} to ${newState.status}`
            );
        });

        // Split long messages to fit Discord's character limit
        const botMessages = [];
        while (botMessage.length > MAX_MESSAGE_LENGTH) {
            const lastSpace = botMessage.lastIndexOf(' ', MAX_MESSAGE_LENGTH);
            botMessages.push(botMessage.substring(0, lastSpace));
            botMessage = botMessage.substring(lastSpace + 1);
        }
        botMessages.push(botMessage);

        // Send all message chunks to the channel
        for (const msg of botMessages) {
            await message.reply(
                `${msg} (${botMessages.indexOf(msg) + 1}/${botMessages.length})`
            );
        }
    } catch (error) {
        logger.error(error);
    }
});

/**
 * Initializes and starts the Discord bot.
 *
 * @async
 * @returns {Promise<void>}
 */
async function main() {
    await client.login(process.env.DISCORD_TOKEN);

    (await ollama)
        ? logger.info('Connected to the Ollama server!')
        : logger.error('Failed to connect to the Ollama server!');

    // Pre-load the model into memory
    (await ollama.generate({
        model: process.env.OLLAMA_MODEL,
        keep_alive: 600000,
    }))
        ? logger.info('Model loaded successfully!')
        : logger.error('Failed to load model!');

    (await context)
        ? logger.info('Context loaded successfully!')
        : logger.error('Failed to load context!');
}

main().catch((error) => logger.error(error));
