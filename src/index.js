require('dotenv').config();
const client = require('./client').getClient();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.displayName}!`);
});

async function main() {
    await client.login(process.env.DISCORD_TOKEN);
}

main().catch(console.error);
