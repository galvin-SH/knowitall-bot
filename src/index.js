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
import { generateTTS } from './gradio.js';

const client = getClient();
const ollama = getOllama();
const context = getContext();

// Listen for the ready event
client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.displayName}!`);
});

// Listen for the messageCreate event
client.on(Events.MessageCreate, async (message) => {
    try {
        // Define a mention regex
        const MENTION_REGEX = /(<+@)+[0-9]+>/g;
        // Ignore messages from bots and messages that don't mention the client
        if (message.author.bot || !message.mentions.has(client.user)) return;
        // if the message was sent by a user not currently in the bots voice channel, return
        if (message.member.voice.channel.id !== process.env.DISCORD_CHANNEL_ID)
            return message.reply(
                'Please join the voice channel that I am currently in to use this command!'
            );
        // Remove the mention from the message content
        const content = await message.content.replace(MENTION_REGEX, '');
        if (!content.trim()) return;

        // Add the message to the context
        await addContext(context, {
            role: 'user',
            content: `${message.author.username} said: "${content}"`,
        });

        const connection = getConnection(
            client,
            process.env.DISCORD_GUILD_ID,
            process.env.DISCORD_CHANNEL_ID
        );
        (await connection)
            ? console.log('Connected to the voice channel!')
            : console.error('Failed to connect to the voice channel!');
        // Create an audio player
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });

        // Send a request to the Ollama server
        const response = await sendRequest(ollama, context);

        // Add the response to the context window for the model to keep track of the conversation
        await addContext(context, response.message);

        // Define a variable to store the bot message and an array to store the bot messages if the message is too long
        // Clean up the response by trimming whitespace
        let botMessage = response.message.content.trim();
        const botMessages = [];

        // If the response is empty, set the bot message to a default message
        if (!botMessage) botMessage = 'Sorry, something went wrong on my end!';

        // Generate the TTS audio
        await generateTTS(botMessage, process.env.VOICE_MODEL);
        // Create an audio resource
        const resource = createAudioResource(
            'C:/Users/matth/Applio/Applio-3.2.3/assets/audios/tts_rvc_output.wav',
            {
                inputType: StreamType.Arbitrary,
            }
        );
        // Play the audio resource
        player.play(resource);
        // Subscribe the player to the connection
        connection.subscribe(player);
        // Listen for the audio player state change
        player.on('stateChange', (oldState, newState) => {
            console.log(
                `Audio player transitioned from ${oldState.status} to ${newState.status}`
            );
        });

        // If the message is longer than 1950 characters, find the next space and split it
        while (botMessage.length > 1950) {
            let lastSpace = botMessage.lastIndexOf(' ', 1950);
            botMessages.push(botMessage.substring(0, lastSpace));
            botMessage = botMessage.substring(lastSpace + 1);
        }
        // Push the remaining message to the array
        botMessages.push(botMessage);

        // Send the bot messages to the channel
        // Add the index of the message to the message
        // to keep track of the message count
        for (const msg of botMessages) {
            await message.reply(
                `${msg} (${botMessages.indexOf(msg) + 1}/${botMessages.length})`
            );
        }
        (await player.state.status) === 'idle';
    } catch (error) {
        console.error(error);
    }
});

// Define an async function to start the bot
async function main() {
    // Log in to Discord with the client
    await client.login(process.env.DISCORD_TOKEN);
    // Connect to the Ollama server
    (await ollama)
        ? console.log('Connected to the Ollama server!')
        : console.error('Failed to connect to the Ollama server!');
    // Generate an empty response from the model to load it into memory
    (await ollama.generate({
        model: process.env.OLLAMA_MODEL,
        keep_alive: 600000,
    }))
        ? console.log('Model loaded successfully!')
        : console.error('Failed to load model!');
    // Load the context
    (await context)
        ? console.log('Context loaded successfully!')
        : console.error('Failed to load context!');
}

main().catch(console.error);
