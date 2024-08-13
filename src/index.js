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
            content:
                content +
                `. The message you are responding to was sent by user: (${message.author.username})`,
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
