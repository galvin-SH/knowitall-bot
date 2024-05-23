require('dotenv').config();
const client = require('./client').getClient();
const ollama = require('./ollama').getOllama();
const context = require('./context').getContext();
const { addContext } = require('./context');
const { sendRequest } = require('./ollama');
const { Events } = require('discord.js');

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
        // Remove the mention from the message content
        const content = await message.content.replace(MENTION_REGEX, '');
        // Add the message to the context
        await addContext(context, {
            role: 'user',
            content: content,
        });
        // Send a request to the Ollama server
        const response = await sendRequest(ollama, context);
        // Add the response to the context
        await addContext(context, response.message);
        // Bot replies to the message with the response
        // Split the response into chunks of 1950 characters or less
        // and send each chunk as a separate message
        // to avoid the 2000 character limit
        const chunks = response.message.content.match(/[\s\S]{1,1950}\W|\w+$/g);
        for (const chunk of chunks) {
            await message.reply(
                `${chunk} (${chunks.indexOf(chunk) + 1}/${chunks.length})`
            );
        }
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
    // Generate a response from the model to load it into memory
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
