require('dotenv').config();
const client = require('./client').getClient();
const ollama = require('./connection').getOllama();
const { Events } = require('discord.js');

// Listen for the ready event
client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.displayName}!`);
});

// Listen for the messageCreate event
client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from bots and messages that don't mention the client
    if (message.author.bot || !message.mentions.has(client.user)) return;
    // Reply to the message
    await message.reply('You mentioned me!');
});

// Define an async function to start the bot
async function main() {
    // Log in to Discord with the client
    await client.login(process.env.DISCORD_TOKEN);
    // Connect to the Ollama server
    await ollama;
    console.log('Connected to the Ollama server!');
}

main().catch(console.error);
