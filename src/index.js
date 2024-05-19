require('dotenv').config();
const client = require('./client').getClient();
const ollama = require('./ollama').getOllama();
const { sendRequest } = require('./ollama');
const { Events } = require('discord.js');

// Listen for the ready event
client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.displayName}!`);
});

// Listen for the messageCreate event
client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from bots and messages that don't mention the client
    if (message.author.bot || !message.mentions.has(client.user)) return;
    // Send a request to the Ollama server
    console.log('Sending request to Ollama server...');
    console.log(`User: ${message.content}`);
    const response = await sendRequest(ollama, message.content);
    // Send the response from the Ollama server
    console.log('Received response from Ollama server!');
    console.log(`Bot: ${response.message.content}`);
    await message.reply(response.message.content);
});

// Define an async function to start the bot
async function main() {
    // Log in to Discord with the client
    await client.login(process.env.DISCORD_TOKEN);
    // Connect to the Ollama server
    (await ollama)
        ? console.log('Connected to the Ollama server!')
        : console.error('Failed to connect to the Ollama server!');
    const response = await ollama.generate({
        model: 'llama3:latest',
        format: 'json',
    });
    console.log(`${await response.model} loaded successfully!`);
}

main().catch(console.error);
