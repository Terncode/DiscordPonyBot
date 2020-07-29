import { GuildPlugin } from "./Plugins/GuildPlugin";
import { Client, MessageReaction, User, PartialUser, Message, PartialMessage, Channel, TextChannel, VoiceChannel, GuildEmoji, Guild, GuildMember, PartialGuildMember, Collection, Speaking, Role, PartialDMChannel, VoiceState } from "discord.js";


// Plugins
import { ternsCodeLab } from "./Plugins/TernsCodelab/TernsCodeLabIndex";
import { onMessage } from "./main";
import { config, updateActivity, shouldUpdateActivity } from ".";
import { clientGuildJoin, onGuildMemberJoin, onGuildMemberLeave, onGuildMemberBan, onGuildMemberBanRemove } from "./other/joinLeaves";



const plugins: GuildPlugin[] = [
    ternsCodeLab
];


const guildPluginLoaded = new Map<string, GuildPlugin[]>();



export function setupPluginManager(client: Client) {
    if (client.readyAt === null) throw new Error('Client is not ready');

    setupListeners();
    setupClientListeners(client);
    onStartUp(client);
}

function setupListeners() {
    for (const plugin of plugins) {
        if (plugin instanceof GuildPlugin) {
            for (const listener of GuildPlugin.listenerList) {
                if (plugin.listeners(listener).length) {
                    addGuildPlugin(listener, plugin);
                }
            }
        } else {
            console.error(Error('Trying to load guild plugin that is not plugin!'));
        }
    }
}

function setupClientListeners(client: Client) {
    client.on('message', (message: Message) => {
        if (message.guild) {
            for (const plugin of getGuilds('message', message.guild.id)) {
                if (plugin.onMessage(message)) return;
            }
        }
        onMessage(message);
    });

    client.on('messageUpdate', (message: Message | PartialMessage, messageOld: Message | PartialMessage) => {
        if (message.guild) {
            for (const plugin of getGuilds('messageUpdate', message.guild.id)) {
                if (plugin.onMessageUpdate(message, messageOld)) return;
            }
        }
    });

    client.on('messageDelete', (message: Message | PartialMessage) => {
        if (message.guild) {
            for (const plugin of getGuilds('messageDelete', message.guild.id)) {
                if (plugin.onMessageDelete(message)) return;
            }
        }
    });

    client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User | PartialUser) => {
        if (messageReaction.message.guild) {
            for (const plugin of getGuilds('messageReactionAdd', messageReaction.message.guild.id)) {
                if (plugin.onMessageReactionAdd(messageReaction, user)) return;
            }
        }
    });

    client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User | PartialUser) => {
        if (messageReaction.message.guild) {
            for (const plugin of getGuilds('messageReactionRemove', messageReaction.message.guild.id)) {
                if (plugin.onMessageReactionRemove(messageReaction, user)) return;
            }
        }
    });

    client.on('messageReactionRemoveAll', (message: Message | PartialMessage) => {
        if (message.guild) {
            for (const plugin of getGuilds('messageReactionRemoveAll', message.guild.id)) {
                if (plugin.onMessageReactionRemoveAll(message)) return;
            }
        }
    });

    client.on('channelCreate', (channel: Channel) => {
        const ch = channel as TextChannel | VoiceChannel;
        if (ch.guild) {
            for (const plugin of getGuilds('channelCreate', ch.guild.id)) {
                if (plugin.onChannelCreate(channel)) return;
            }
        }
    });

    client.on('channelDelete', (channel: Channel) => {
        const ch = channel as TextChannel | VoiceChannel;
        if (ch.guild) {
            for (const plugin of getGuilds('channelDelete', ch.guild.id)) {
                if (plugin.onChannelDelete(channel)) return;
            }
        }
    });

    client.on('channelPinsUpdate', (channel: Channel, time: Date) => {
        const ch = channel as TextChannel | VoiceChannel;
        if (ch.guild) {
            for (const plugin of getGuilds('channelPinsUpdate', ch.guild.id)) {
                if (plugin.onChannelPinsUpdate(channel, time)) return;
            }
        }
    });

    client.on('channelUpdate', (oldChannel: Channel, newChannel: Channel) => {
        const nch = oldChannel as TextChannel | VoiceChannel;
        const och = newChannel as TextChannel | VoiceChannel;
        if (nch.guild && och.guild && nch.guild.id === och.guild.id) {
            for (const plugin of getGuilds('channelUpdate', och.guild.id)) {
                if (plugin.onChannelUpdate(oldChannel, newChannel)) return;
            }
        }
    });

    client.on('emojiCreate', (emoji: GuildEmoji) => {
        if (emoji.guild) {
            for (const plugin of getGuilds('emojiCreate', emoji.guild.id)) {
                if (plugin.onEmojiCreate(emoji)) return;
            }
        }
    });

    client.on('emojiDelete', (emoji: GuildEmoji) => {
        if (emoji.guild) {
            for (const plugin of getGuilds('emojiDelete', emoji.guild.id)) {
                if (plugin.onEmojiDelete(emoji)) return;
            }
        }
    });

    client.on('emojiUpdate', (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
        const nem = oldEmoji as GuildEmoji;
        const oem = newEmoji as GuildEmoji;
        if (nem.guild && oem.guild && nem.guild.id === oem.guild.id) {
            for (const plugin of getGuilds('emojiUpdate', oem.guild.id)) {
                if (plugin.onEmojiUpdate(oldEmoji, newEmoji)) return;
            }
        }
    });

    client.on('guildBanAdd', (guild: Guild, user: User | PartialUser) => {
        for (const plugin of getGuilds('guildBanAdd', guild.id)) {
            if (plugin.onGuildBanAdd(guild, user)) return;
        }
        onGuildMemberBan(guild, user);
    });

    client.on('guildBanRemove', (guild: Guild, user: User | PartialUser) => {
        for (const plugin of getGuilds('guildBanRemove', guild.id)) {
            if (plugin.onGuildBanRemove(guild, user)) return;
        }
        onGuildMemberBanRemove(guild, user);
    });

    client.on('guildIntegrationsUpdate', (guild: Guild) => {
        for (const plugin of getGuilds('guildIntegrationsUpdate', guild.id)) {
            if (plugin.onGuildIntegrationsUpdate(guild)) return;
        }
    });

    client.on('guildMemberAdd', (member: GuildMember | PartialGuildMember) => {
        for (const plugin of getGuilds('guildMemberAdd', member.guild.id)) {
            if (plugin.onGuildMemberAdd(member)) return;
        }
        onGuildMemberJoin(member);
    });

    client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
        for (const plugin of getGuilds('guildMemberRemove', member.guild.id)) {
            if (plugin.onGuildMemberRemove(member)) return;
        }
        onGuildMemberLeave(member);
    });

    client.on('guildMemberAvailable', (guildMember: GuildMember | PartialGuildMember) => {
        for (const plugin of getGuilds('guildMemberAvailable', guildMember.guild.id)) {
            if (plugin.onGuildMemberAvailable(guildMember)) return;
        }
    });

    client.on('guildMembersChunk', (members: Collection<string, GuildMember | PartialGuildMember>, guild: Guild) => {
        for (const plugin of getGuilds('guildMembersChunk', guild.id)) {
            if (plugin.onGuildMembersChunk(members, guild)) return;
        }
    });

    client.on('guildMemberSpeaking', (guildMember: GuildMember | PartialGuildMember, speaking: Readonly<Speaking>) => {
        for (const plugin of getGuilds('guildMemberSpeaking', guildMember.guild.id)) {
            if (plugin.onGuildMemberSpeaking(guildMember, speaking)) return;
        }
    });

    client.on('guildMemberUpdate', (oldGuildMember: GuildMember | PartialGuildMember, newGuildMember: GuildMember | PartialGuildMember) => {
        for (const plugin of getGuilds('guildMemberUpdate', oldGuildMember.guild.id)) {
            if (plugin.onGuildMemberUpdate(oldGuildMember, newGuildMember)) return;
        }
    });

    client.on('guildUnavailable', (guild: Guild) => {
        for (const plugin of getGuilds('guildUnavailable', guild.id)) {
            if (plugin.onGuildUnavailable(guild)) return;
        }
    });

    client.on('guildUpdate', (oldGuild: Guild, newGuild: Guild) => {
        for (const plugin of getGuilds('guildUpdate', newGuild.id)) {
            if (plugin.onGuildUpdate(oldGuild, newGuild)) return;
        }
    });

    client.on('roleCreate', (role: Role) => {
        for (const plugin of getGuilds('roleCreate', role.guild.id)) {
            if (plugin.onRoleCreate(role)) return;
        }
    });

    client.on('roleDelete', (role: Role) => {
        for (const plugin of getGuilds('roleDelete', role.guild.id)) {
            if (plugin.onRoleDelete(role)) return;
        }
    });

    client.on('roleUpdate', (oldRole: Role, newRole: Role) => {
        for (const plugin of getGuilds('roleDelete', newRole.guild.id)) {
            if (plugin.onRoleUpdate(oldRole, newRole)) return;
        }
    });

    client.on('typingStart', (channel: Channel | PartialDMChannel, user: User | PartialUser) => {
        const ch = channel as TextChannel;
        if (ch.guild) {
            for (const plugin of getGuilds('typingStart', ch.guild.id)) {
                if (plugin.onTypingStart(channel, user)) return;
            }
        }
    });

    client.on('userUpdate', (oldUser: User | PartialUser, newUser: User | PartialUser) => {
            for (const plugin of getGuilds('userUpdate', '*')) {
                if (plugin.onUserUpdate(oldUser, newUser)) return;
            }
    });

    client.on('voiceStateUpdate', (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
        for (const plugin of getGuilds('voiceStateUpdate', newVoiceState.guild.id)) {
            if (plugin.onVoiceStateUpdate(oldVoiceState, newVoiceState)) return;
        }
    });

    client.on('webhookUpdate', (textChannel: TextChannel) => {
        for (const plugin of getGuilds('webhookUpdate', textChannel.guild.id)) {
            if (plugin.onWebhookUpdate(textChannel)) return;
        }
    });


    client.on('guildCreate', guild => {
        if (shouldUpdateActivity) updateActivity();
        clientGuildJoin(guild);
        for (const plugin of getGuildPlugins(guild.id)) {
            plugin.onStartUp(client);
        }
        client.removeAllListeners();
        setupClientListeners(client);

    });
    client.on('guildDelete', guild => {
        if (shouldUpdateActivity) updateActivity();
        for (const plugin of getGuildPlugins(guild.id)) {
            plugin.onShutDown(client);
        }

        client.removeAllListeners();
        setupClientListeners(client);
    });
    
    client.on('debug', bug => { if (config.DEBUG) console.log(bug); });
    client.on('error', console.error);
    

}

export async function onStartUp(client: Client) {
    for (const plugin of getGuildPlugins('startup')) {
        await plugin.onStartUp(client);
    }
}

export async function onShutDown(client: Client) {
    for (const plugin of getGuildPlugins('shutdown')) {
        await plugin.onShutDown(client);
    }
}

function getGuildPlugins(key: string): GuildPlugin[] {
    return guildPluginLoaded.get(key) || [];
}

function addGuildPlugin(key: string, guildPlugin: GuildPlugin): boolean {
    const messagesGuildPlugin = getGuildPlugins(key);
    if (messagesGuildPlugin.includes(guildPlugin)) return false;
    messagesGuildPlugin.push(guildPlugin);
    guildPluginLoaded.set(key, messagesGuildPlugin);
    return true;
}

function getGuilds(key: string, guildID: string) {
    if (guildID === '*') return getGuildPlugins(key);    
    return getGuildPlugins(key).filter(g => g.guildID === guildID);
}