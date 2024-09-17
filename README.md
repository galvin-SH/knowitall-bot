# knowitall-bot
![MIT License](https://img.shields.io/badge/License-MIT%20License-blue)
## Description
A Discord bot which which allows users to interact with a locally hosted LLM and recieve both text and audio responses to their prompts.

## Table of Contents

- [Installation and Usage](#installation)
- [License](#license)
- [How to Contribute](#contributing)
- [Tests](#tests)
- [Questions](#questions)

## Installation and Usage
This project is intended to interface with a locally hosted LLM via Ollama which can be found at the following link
- https://ollama.com/download

Full documentation for Ollama and the API this app interfaces with can be found at the following link
- https://github.com/ollama/ollama/tree/main/docs

Additionally, this project interfaces with Applio, in order to generate audio based on the text provided by the LLM.
- https://github.com/IAHispano/Applio/releases

And of course as a Discord bot, this project requires a Discord bot token and you will also need to add the bot to your server. Some relevant information regarding this can be found at the following link
- https://discord.com/developers/docs/quick-start/getting-started#step-1-creating-an-app

To prepare Ollama, in a terminal window run the following command
```
ollama serve
```
To prepare Applio, run the `run-applio.bat` file in Applio's root directory

After ensuring both Ollama and Applio are installed and running, the following steps can be taken to install the bot
1. Clone this repository
>```git clone git@github.com:galvin-SH/knowitall-bot.git```
2. Install node dependencies
>```npm install```
3. Create a .env file in the root directory of the project including the following fields
```
DISCORD_TOKEN={Your discord bot token}
OLLAMA_MODEL={The name of the model Ollama will use to generate responses}
VOICE_MODEL={The name of the model Applio will use to generate audio}
DISCORD_GUILD_ID={The ID of the discord server the bot will be used in}
DISCORD_CHANNEL_ID={The ID of the voice channel that the bot will play audio in}
```
All of these variables are required for the bot to function correctly and should all be in string format enclosed in quotes

4. Open a terminal window in the root directory of the project and run the following command
>```npm run start```
5. The bot can now be used in the discord server it was added to.
- Join the voice channel that the bot was assigned to in the .env file
- Send the bot a message by typing a message that includes a 'mention' of the bot, for example `@knowitall-bot hello` or by replying to a message the bot has sent in the past.
- The bot should the join the voice channel, reply to the message in the channel it was sent in and play the audio response in the voice channel it was assigned to.

## License
This project is licenced under [MIT License](https://choosealicense.com/licenses/mit)

## Contributing
This project is not currently seeking any collaborators

## Tests
This project does not currently implement any test functionality

## Questions
If you have any questions or concerns regarding this project, I can be contacted via email at the following address

Additionally my github profile can be located by using the following link
https://github.com/galvin-sh