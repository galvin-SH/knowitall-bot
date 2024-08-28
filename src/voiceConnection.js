import { joinVoiceChannel } from '@discordjs/voice';

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
