
import { Message, GuildMember, Client, MessageReaction, User, Role, Channel, GuildChannel, TextChannel, Guild, Emoji, GuildEmoji, PartialGuildMember, PartialMessage, PartialUser, Collection, Speaking, PartialDMChannel, VoiceState } from 'discord.js';
import { EventEmitter } from 'events';

export declare interface GuildPlugin {
    on(event: 'message', listener: (message: Message, callback: () => void) => void): this;
    on(event: 'messageDelete', listener: (message: Message | PartialMessage, callback: () => void) => void): this;
    on(event: 'messageReactionAdd', listener: (messageReaction: MessageReaction, user: User | PartialUser, callback: () => void) => void): this;
    on(event: 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User | PartialUser, callback: () => void) => void): this;
    on(event: 'messageReactionRemoveAll', listener: (message: Message | PartialMessage, callback: () => void) => void): this;
    on(event: 'messageUpdate', listener: (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage, callback: () => void) => void): this;

    on(event: 'channelCreate', listener: (channel: Channel, callback: () => void) => void): this;
    on(event: 'channelDelete', listener: (channel: Channel, callback: () => void) => void): this;
    on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date, callback: () => void) => void): this;
    on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel, callback: () => void) => void): this;

    on(event: 'emojiCreate', listener: (emoji: Emoji, callback: () => void) => void): this;
    on(event: 'emojiDelete', listener: (emoji: Emoji, callback: () => void) => void): this;
    on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji, callback: () => void) => void): this;

    on(event: 'guildBanAdd', listener: (guild: Guild, user: User | PartialUser, callback: () => void) => void): this;
    on(event: 'guildBanRemove', listener: (guild: Guild, user: User | PartialUser, callback: () => void) => void): this;

    on(event: 'guildIntegrationsUpdate', listener: (guild: Guild, callback: () => void) => void): this;

    on(event: 'guildMemberAdd', listener: (member: GuildMember, callback: () => void) => void): this;
    on(event: 'guildMemberAvailable', listener: (member: GuildMember, callback: () => void) => void): this;
    on(event: 'guildMemberRemove', listener: (member: GuildMember, callback: () => void) => void): this;
    on(event: 'guildMembersChunk', listener: (members: Collection<string, GuildMember | PartialGuildMember>, guild: Guild, callback: () => void) => void): this;
    on(event: 'guildMemberSpeaking', listener: (guildMember: GuildMember | PartialGuildMember, speaking: Readonly<Speaking>, callback: () => void) => void): this;
    on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember, callback: () => void) => void): this;

    on(event: 'guildUnavailable', listener: (guild: Guild, callback: () => void) => void): this;
    on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild, callback: () => void) => void): this;

    on(event: 'roleCreate', listener: (role: Role, callback: () => void) => void): this;
    on(event: 'roleDelete', listener: (role: Role, callback: () => void) => void): this;
    on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role, callback: () => void) => void): this;
    on(event: 'typingStart', listener: (channel: Channel | PartialDMChannel, user: User | PartialUser, callback: () => void) => void): this;

    on(event: 'userUpdate', listener: (oldUser: User | PartialUser, newUser: User | PartialUser) => void): this;

    on(event: 'voiceStateUpdate', listener: (oldVoiceState: VoiceState, newVoiceState: VoiceState, callback: () => void) => void): this;
    on(event: 'webhookUpdate', listener: (channel: Channel, callback: () => void) => void): this;

    on(event: 'startup', listener: (guild: Guild, callback: (promise: Promise<void>) => void) => void): this;
    on(event: 'shutdown', listener: (guild: Guild, callback: (promise: Promise<void>) => void) => void): this;
}

export class GuildPlugin extends EventEmitter {

    public static readonly listenerList = [
        'message',
        'messageDelete',
        'messageReactionAdd',
        'messageReactionRemove',
        'messageReactionRemoveAll',
        'messageUpdate',
        'channelCreate',
        'channelDelete',
        'channelPinsUpdate',
        'channelUpdate',
        'emojiCreate',
        'emojiDelete',
        'emojiUpdate',
        'guildBanAdd',
        'guildBanRemove',
        'guildIntegrationsUpdate',
        'guildMemberAdd',
        'guildMemberAvailable',
        'guildMemberRemove',
        'guildMembersChunk',
        'guildMemberSpeaking',
        'guildMemberUpdate',
        'guildUnavailable',
        'guildUpdate',
        'roleCreate',
        'roleDelete',
        'roleUpdate',
        'typingStart',
        'userUpdate',
        'voiceStateUpdate',
        'webhookUpdate',
        'startup',
        'shutdown'
        ]

    constructor(private _guildID: string) {
        super();
    }
    onChannelCreate(channel: Channel): boolean {
        const guildChannel = channel as GuildChannel;
        if (!guildChannel.guild) return false;
        if (guildChannel.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('channelCreate', channel, () => {
            status = true;
        });
        return status;
    }
    onChannelDelete(channel: Channel): boolean {
        const guildChannel = channel as GuildChannel;
        if (!guildChannel.guild) return false;
        if (guildChannel.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('channelDelete', channel, () => {
            status = true;
        });
        return status;
    }
    onChannelPinsUpdate(channel: Channel, time: Date): boolean {
        const guildChannel = channel as GuildChannel;
        if (!guildChannel.guild) return false;
        if (guildChannel.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('channelPinsUpdate', channel, time, () => {
            status = true;
        });
        return status;
    }
    onChannelUpdate(oldChannel: Channel, newChannel: Channel): boolean {
        if (oldChannel.id !== newChannel.id) return false;
        const newGuildChannel = newChannel as GuildChannel;
        const oldGuildChannel = oldChannel as GuildChannel;
        if (!newGuildChannel.guild) return false;
        if (newGuildChannel.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('channelUpdate', oldGuildChannel, newGuildChannel, () => {
            status = true;
        });
        return status;
    }
    onEmojiCreate(emoji: GuildEmoji): boolean {
        if (emoji.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('emojiCreate', emoji, () => {
            status = true;
        });

        return status;
    }
    onEmojiDelete(emoji: GuildEmoji): boolean {
        if (emoji.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('emojiDelete', emoji, () => {
            status = true;
        });

        return status;
    }
    onEmojiUpdate(oldEmoji: GuildEmoji, newEmoji: GuildEmoji): boolean {
        if (oldEmoji.id !== newEmoji.id) return false;
        if (oldEmoji.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('emojiUpdate', oldEmoji, newEmoji, () => {
            status = true;
        });

        return status;
    }
    onGuildBanAdd(guild: Guild, user: User | PartialUser) {
        if (guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildBanAdd', guild, user, () => {
            status = true;
        });

        return status;
    }
    onGuildBanRemove(guild: Guild, user: User | PartialUser) {
        if (guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildBanRemove', guild, user, () => {
            status = true;
        });

        return status;
    }
    onGuildMemberAdd(member: GuildMember | PartialGuildMember): boolean {
        if (member.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMemberAdd', member, () => {
            status = true;
        });
        return status;
    }
    onGuildMemberAvailable(member: GuildMember | PartialGuildMember): boolean {
        if (member.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMemberAvailable', member, () => {
            status = true;
        });
        return status;
    }
    onGuildMemberRemove(member: GuildMember | PartialGuildMember): boolean {
        if (member.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMemberRemove', member, () => {
            status = true;
        });
        return status;
    }
    onGuildMembersChunk(members: Collection<string, GuildMember | PartialGuildMember>, guild: Guild): boolean {
        if (guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMembersChunk', members, guild, () => {
            status = true;
        });
        return status;
    }
    onGuildMemberSpeaking(guildMember: GuildMember | PartialGuildMember, speaking: Readonly<Speaking>): boolean {
        if (guildMember.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMemberSpeaking', guildMember, speaking, () => {
            status = true;
        });
        return status;
    }
    onGuildMemberUpdate(oldMember:  GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember): boolean {
        if (oldMember.id !== newMember.id) return false;
        if (oldMember.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildMemberUpdate', oldMember, newMember, () => {
            status = true;
        });
        return status;
    }
    onMessage(message: Message): boolean {
        if (!message.guild) return false;
        if (message.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('message', message, () => {
            status = true;
        });
        return status;
    }
    onMessageDelete(message: Message | PartialMessage): boolean {
        if (!message.guild) return false;
        if (message.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('messageDelete', message, () => {
            status = true;
        });
        return status;
    }
    onMessageReactionAdd(messageReaction: MessageReaction, user: User | PartialUser): boolean {
        if (!messageReaction.message.guild) return false;
        if (messageReaction.message.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('messageReactionAdd', messageReaction, user, () => {
            status = true;
        });
        return status;
    }
    onMessageReactionRemove(messageReaction: MessageReaction, user: User | PartialUser): boolean {
        if (!messageReaction.message.guild) return false;
        if (messageReaction.message.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('messageReactionRemove', messageReaction, user, () => {
            status = true;
        });
        return status;
    }
    onMessageReactionRemoveAll(message: Message | PartialMessage): boolean {
        if (!message.guild) return false;
        if (message.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('messageDelete', message, () => {
            status = true;
        });
        return status;
    }
    onMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): boolean {
        if (!oldMessage.guild || !newMessage.guild) return false;
        if (oldMessage.guild.id !== this.guildID) return false;
        if (newMessage.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('messageUpdate', oldMessage, newMessage, () => {
            status = true;
        });
        return status;
    }

    onRoleCreate(role: Role): boolean {
        if (!role.guild) return false;
        if (role.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('roleCreate', role, () => {
            status = true;
        });
        return status;
    }
    onRoleDelete(role: Role): boolean {
        if (!role.guild) return false;
        if (role.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('roleDelete', role, () => {
            status = true;
        });
        return status;
    }
    onRoleUpdate(oldRole: Role, newRole: Role): boolean {
        if (!oldRole.guild) return false;
        if (!newRole.guild) return false;
        if (oldRole.guild.id !== this.guildID) return false;
        if (newRole.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('roleUpdate', oldRole, newRole, () => {
            status = true;
        });
        return status;
    }
    onTypingStart(channel: Channel | PartialDMChannel, user: User | PartialUser): boolean {
        const guildChannel = channel as GuildChannel;
        if (!guildChannel.guild) return false;
        let status = false;
        this.emit('typingStart', channel, user, () => {
            status = true;
        });
        return status;
    }
    onUserUpdate(oldUser: User | PartialUser, newUser: User | PartialUser): boolean {
        if (oldUser.id !== newUser.id) return false;
        const client = oldUser.client;
        const guild = client.guilds.cache.find(g => g.id === this.guildID);
        if (!guild) return false;
        const isUserInGuild = guild.members.cache.find(m => m.user.id === oldUser.id);
        if (!isUserInGuild) return false;

        this.emit('userUpdate', oldUser, newUser);
        return false;
    }
    onVoiceStateUpdate(oldVoiceState: VoiceState, newVoiceState: VoiceState): boolean {
        if (!oldVoiceState.guild) return false;
        if (!newVoiceState.guild) return false;
        if (oldVoiceState.guild.id !== this.guildID) return false;
        if (newVoiceState.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('voiceStateUpdate', oldVoiceState, newVoiceState, () => {
            status = true;
        });
        return status;
    }
    onWebhookUpdate(channel: TextChannel): boolean {
        if (!channel.guild) return false;
        if (channel.guild.id !== this.guildID) return false;
        let status = false;
        this.emit('webhookUpdate', channel, () => {
            status = true;
        });
        return status;
    }
    onGuildUnavailable(guild: Guild): boolean {
        if (guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildUnavailable', guild, () => {
            status = true;
        });
        return status;
    }
    onGuildUpdate(oldGuild: Guild, newGuild: Guild): boolean {
        if (oldGuild.id !== newGuild.id) return false;
        if (oldGuild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildUpdate', oldGuild, newGuild, () => {
            status = true;
        });
        return status;
    }

    onGuildIntegrationsUpdate(guild: Guild): boolean {
        if (guild.id !== this.guildID) return false;
        let status = false;
        this.emit('guildIntegrationsUpdate', guild, () => {
            status = true;
        });
        return status;
    }

    onStartUp(client: Client): Promise<void> {
        return new Promise(resolve => {
            const guild = client.guilds.cache.find(g => g.id === this.guildID);
            if (!guild) return resolve();
            let callbackProvided = false;
            this.emit('startup', guild, async (shouldBePromise: Promise<void>) => {
                callbackProvided = true;
                if (shouldBePromise instanceof Promise) return resolve(await shouldBePromise);
                else return resolve();

            });
            if (!callbackProvided) return resolve();
        });
    }
    onShutDown(client: Client): Promise<void> {
        return new Promise(resolve => {
            const guild = client.guilds.cache.find(g => g.id === this.guildID);
            if (!guild) return resolve();
            let callbackProvided = false;
            this.emit('shutdown', guild, async (shouldBePromise: Promise<void>) => {
                callbackProvided = true;
                if (shouldBePromise instanceof Promise) return resolve(await shouldBePromise);
                else return resolve();
            });
            if (!callbackProvided) return resolve();
        });
    }
    get guildID() {
        return this._guildID;
    }
}
