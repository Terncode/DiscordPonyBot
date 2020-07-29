import { Message, TextChannel, GuildMember } from 'discord.js';
import { GuildAdminCommands, Language } from '../../language/langTypes';
import { getLanguage, changeGuildPrefix, getAvailableLanguages, changeGuildLanguage, addPTUpdateChannel, removeImageDeliveryChannel, addImageDeliveryChannel, removePTUpdateChannel, enableDisableGuildAutoConversion, enableDisableGuildSwearPrevention, ChannelFlag, setFlagToChannel } from '../../until/guild';
import { checkCommand, getCommandArgs, removePrefixAndCommand } from '../../until/commandsHandler';
import { reportErrorToOwner } from '../../until/errors';
import { hasPermissionInChannel, extractMessage } from '../../until/util';
import { onGuildMemberKick } from '../joinLeaves';
import { SECOND, WEEK } from '../../until/constants';

export const GUILD_ADMIN_COMMANDS: GuildAdminCommands = {
    changeLanguage: ['a.lang', 'a.language'],
    changePrefix: ['a.prefix', 'a.setprefix'],
    subscribeToPTUpdates: ['a.ptupdates', 'a.pt'],
    subscribeToPonyImages: ['a.pony', 'a.pics', 'a.img'],
    autoConversion: ['a.conversion', 'a.autounit'],
    swearPrevention: ['a.swearprotection', 'a.swearprotection'],
    kick: ['a.kick', 'a.throw'],
    setFlag: ['a.flag'],
    ban: ['a.ban'],
    purge: ['a.purge'],
    purgeAll: ['a.purge.all'],
};

export function guildAdmin(message: Message): boolean {
    if (!message.guild || !message.member) return false;
    const language = getLanguage(message.guild);
    if (checkCommand(message, [...language.guildAdmin.commands.changeLanguage, ...GUILD_ADMIN_COMMANDS.changeLanguage])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) changeLanguage(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageGuild);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.changePrefix, ...GUILD_ADMIN_COMMANDS.changePrefix])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) changePrefix(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageGuild);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.subscribeToPTUpdates, ...GUILD_ADMIN_COMMANDS.subscribeToPTUpdates])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) updatesPT(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageChannels);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.subscribeToPonyImages, ...GUILD_ADMIN_COMMANDS.subscribeToPonyImages])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) imageDelivery(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageChannels);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.swearPrevention, ...GUILD_ADMIN_COMMANDS.swearPrevention])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) enableDisableSwearPrevention(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageGuild);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.autoConversion, ...GUILD_ADMIN_COMMANDS.autoConversion])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) enableDisableAutoConversion(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageGuild);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.kick, ...GUILD_ADMIN_COMMANDS.kick])) {
        if (message.member.permissionsIn(message.channel).has('KICK_MEMBERS')) kickMember(message, language);
        else message.channel.send(language.guildAdmin.noPermissionKickMembers);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.ban, ...GUILD_ADMIN_COMMANDS.ban])) {
        if (message.member.permissionsIn(message.channel).has('BAN_MEMBERS')) banMember(message, language);
        else message.channel.send(language.guildAdmin.noPermissionBanMembers);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.setFlag, ...GUILD_ADMIN_COMMANDS.setFlag])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) ignoreChannel(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageChannels);
        return true;
    }  else if (checkCommand(message, [...language.guildAdmin.commands.purge, ...GUILD_ADMIN_COMMANDS.purge])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_MESSAGES')) purge(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageChannels);
        return true;
    } else if (checkCommand(message, [...language.guildAdmin.commands.purgeAll, ...GUILD_ADMIN_COMMANDS.purgeAll])) {
        if (message.member.permissionsIn(message.channel).has('MANAGE_MESSAGES')) purgeAll(message, language);
        else message.channel.send(language.guildAdmin.noPermissionManageChannels);
        return true;
    }
    return false;
}

async function enableDisableAutoConversion(message: Message, language: Language) {
    if (!message.guild) return;
    const args = getCommandArgs(message);
    const feature = language.guildAdmin.autoConversion;
    try {
        if (language.guildAdmin.true.includes(args[0])) {
            const status = await enableDisableGuildAutoConversion(message.guild, true);
            if (status) message.channel.send(`${language.guildAdmin.featureEnabled.replace(/&FEATURE/g, feature)}\n${language.guildAdmin.autoUnitConversionInfo}`);
            else message.channel.send(language.guildAdmin.featureAlreadyEnabled.replace(/&FEATURE/g, feature));
        } else if (language.guildAdmin.false.includes(args[0])) {
            const status = await enableDisableGuildAutoConversion(message.guild, false);
            if (status) message.channel.send(language.guildAdmin.featureDisabled.replace(/&FEATURE/g, feature));
            else message.channel.send(language.guildAdmin.featureAlreadyDisabled.replace(/&FEATURE/g, feature));
        } else {
            message.channel.send(language.guildAdmin.incorrectUse);
        }
    } catch (error) {
        message.channel.send(language.guildAdmin.unknownError);
    }
}

async function enableDisableSwearPrevention(message: Message, language: Language) {
    if (!message.member || !message.guild) return;
    const args = getCommandArgs(message);
    const feature = language.guildAdmin.swearProtection;
    try {
        if (language.guildAdmin.true.includes(args[0])) {

            if (message.member.permissions.has('MANAGE_MESSAGES') && hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES')) {
                const status = await enableDisableGuildSwearPrevention(message.guild, true);
                if (status) message.channel.send(`${language.guildAdmin.featureEnabled.replace(/&FEATURE/g, feature)}\n${language.guildAdmin.swearPreventionInfo}`);
                else message.channel.send(language.guildAdmin.featureAlreadyEnabled.replace(/&FEATURE/g, feature));
            } else {
                message.channel.send(language.guildAdmin.botDoesNotHavePermissionManageChannels);
            }
        } else if (language.guildAdmin.false.includes(args[0])) {
            const status = await enableDisableGuildSwearPrevention(message.guild, false);
            if (status) message.channel.send(language.guildAdmin.featureDisabled.replace(/&FEATURE/g, feature));
            else message.channel.send(language.guildAdmin.featureAlreadyDisabled.replace(/&FEATURE/g, feature));
        } else {
            message.channel.send(language.guildAdmin.incorrectUse);
        }
    } catch (error) {
        message.channel.send(language.guildAdmin.unknownError);
    }
}

async function changePrefix(message: Message, language: Language) {
    if (!message.guild) return;
    const args = getCommandArgs(message);
    if (!args[0]) {
        message.channel.send(language.guildAdmin.specifyPrefix);
        return;
    }
    if (args[0].length >= 5) {
        message.channel.send(language.guildAdmin.prefixLongerThanFiveCharacters);
        return;
    }

    await changeGuildPrefix(message.guild, args[0])
        .then(prefix => {
            message.channel.send(language.guildAdmin.prefixChanged.replace(/&PREFIX/g, prefix));
        }).catch(err => {
            message.channel.send(language.guildAdmin.unknownError);
            reportErrorToOwner(message.client, err);
        });
}

async function changeLanguage(message: Message, language: Language) {
    if (!message.guild) return;
    const content = removePrefixAndCommand(message).replace(/ /g, '-').toLowerCase();
    const availableLanguages = getAvailableLanguages(true);
    if (availableLanguages.includes(content)) {
        try {
            const changed = await changeGuildLanguage(message.guild, content);
            language = getLanguage(message.guild);
            if (changed) {
                let response = language.guildAdmin.newGuildLanguage.replace(/&LANGUAGE_NAME/g, language.fullName);
                response = language.official ? response : `${response}\n${language.notHundredProcent}`;
                message.channel.send(response);
            } else {
                message.channel.send(language.guildAdmin.sameLanguage.replace(/&LANGUAGE_NAME/g, language.fullName));
            }
        } catch (error) {
            message.channel.send(language.guildAdmin.unknownError);
        }
    } else {
        message.channel.send(language.guildAdmin.availableLanguages.replace(/&LANGUAGES/g, getAvailableLanguages().join(', ')));
    }
}

async function imageDelivery(message: Message, language: Language) {
    if (!message.guild) return;
    const channel = message.channel;
    const args = getCommandArgs(message);
    const channelName = channel.toString();
    const serviceName = language.guildAdmin.ponyImages;
    try {
        if (language.guildAdmin.subscribe.includes(args[0])) {
            const status = await addImageDeliveryChannel(message.guild, channel as TextChannel);
            if (status) message.channel.send(replaceString(language.guildAdmin.subscribedSuccessfully, channelName, serviceName));
            else message.channel.send(replaceString(language.guildAdmin.alreadySubscribed, channelName, serviceName));
        } else if (language.guildAdmin.unsubscribe.includes(args[0])) {
            const status = await removeImageDeliveryChannel(message.guild, channel.id);
            if (status) message.channel.send(replaceString(language.guildAdmin.unsubscribedSuccessfully, channelName, serviceName));
            else message.channel.send(replaceString(language.guildAdmin.notSubscribed, channelName, serviceName));
        } else {
            message.channel.send(language.guildAdmin.incorrectUse);
        }
    } catch (error) {
        message.channel.send(language.guildAdmin.unknownError);
    }
}

async function updatesPT(message: Message, language: Language) {
    if (!message.guild) return;
    const channel = message.channel;
    const args = getCommandArgs(message);
    const channelName = channel.toString();
    const serviceName = language.guildAdmin.updatesPT;
    try {
        if (language.guildAdmin.subscribe.includes(args[0])) {
            const status = await addPTUpdateChannel(message.guild, channel as TextChannel);
            if (status) message.channel.send(replaceString(language.guildAdmin.subscribedSuccessfully, channelName, serviceName));
            else message.channel.send(replaceString(language.guildAdmin.alreadySubscribed, channelName, serviceName));
        } else if (language.guildAdmin.unsubscribe.includes(args[0])) {
            const status = await removePTUpdateChannel(message.guild, channel.id);
            if (status) message.channel.send(replaceString(language.guildAdmin.unsubscribedSuccessfully, channelName, serviceName));
            else message.channel.send(replaceString(language.guildAdmin.notSubscribed, channelName, serviceName));
        } else {
            message.channel.send(language.guildAdmin.incorrectUse);
        }
    } catch (error) {
        message.channel.send(language.guildAdmin.unknownError);
    }
}

function replaceString(text: string, channel: string, service: string) {
    return text.replace(/&CHANNEL/g, channel)
        .replace(/&SERVICE_NAME/g, service);
}

async function kickMember(message: Message, language: Language) {

    if (!message.guild || !message.guild.me) return;
    if (!message.guild.me.permissions.has('KICK_MEMBERS')) {
        message.channel.send(language.guildAdmin.noPermissionKickMembers);
        return;
    }

    const mentionsCollections = message.mentions.members;
    const mentions = mentionsCollections ? mentionsCollections.map(m => m) : [];
    const content = removePrefixAndCommand(message).replace(/<@!?[0-9]*>/g, '');

    if (!mentions.length) {
        message.channel.send(language.guildAdmin.mentionMember);
        return;
    }
    const member = mentions[0];
    if (member.kickable) {
        const r = content ? `| ${language.logs.reason}: ${content}` : '';
        try {
            const dm = await member.user.createDM();
            await dm.send(language.guildAdmin.youHaveBeenKicked.replace(/&GUILD_NAME/g, message.guild.name).replace(/&REASON/g, r));
        } catch (_) {/* ignored */ }

        member.kick(content)
            .then(member => {
                message.channel.send(language.guildAdmin.memberHasBeenRemoved.replace(/&USER/g, member.user.tag));
                onGuildMemberKick(member.guild, member.user, content);
            }).catch(() => {
                message.channel.send(language.guildAdmin.cannotPerformActionOnUser);
            });
    } else {
        message.channel.send(language.guildAdmin.cannotPerformActionOnUser);
    }
}

async function banMember(message: Message, language: Language) {
    if (!message.guild || !message.guild.me) return;
    if (!message.guild.me.permissions.has('BAN_MEMBERS')) {
        message.channel.send(language.guildAdmin.botDoesNotHavePermissionBanMembers);
        return;
    }
    const mentionsCollections = message.mentions.members;
    const mentions = mentionsCollections ? mentionsCollections.map(m => m) : [];
    const content = removePrefixAndCommand(message).replace(/<@!?[0-9]*>/g, '');

    if (!mentions.length) {
        message.channel.send(language.guildAdmin.mentionMember);
        return;
    }
    const member = mentions[0];
    if (member.bannable) {
        const r = content ? `| ${language.logs.reason}: ${content}` : '';
        try {
            const dm = await member.user.createDM();
            await dm.send(language.guildAdmin.youHaveBeenBanned.replace(/&GUILD_NAME/g, message.guild.name).replace(/&REASON/g, r));
        } catch (_) {/* ignored */ }
        try {
            const m = await member.ban({ reason: content });
            message.channel.send(language.guildAdmin.memberHasBeenBaned.replace(/&USER/g, m.user.tag));
        } catch (error) {
            message.channel.send(language.guildAdmin.cannotPerformActionOnUser);
        }
    } else {
        message.channel.send(language.guildAdmin.cannotPerformActionOnUser);
    }
}

async function purge(message: Message, language: Language) {
    if (!hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES')) {
        message.channel.send(language.guildAdmin.botDoesNotHavePermissionManageMessages);
        return;
    }

    let member: GuildMember | null = null;
    if (message.mentions.members) member = message.mentions.members.map(m => m)[0];

    const args = getCommandArgs(message);
    const numberArg = args[0];
    const numberOfMessages = parseInt(numberArg);

    if (isNaN(numberOfMessages)) {
        message.channel.send('Please specify number').then(msg => {
            setTimeout(() => {
                extractMessage(msg, m => {
                    message.delete().catch(console.error);
                    m.delete().catch(console.error);
                });
            }, SECOND * 10);
        });
        return;
    } else if (numberOfMessages > 100) {
        message.channel.send(`Limit exceeded. 100 messages max`)
            .then(msg => {
                setTimeout(() => {
                    extractMessage(msg, m => {
                        message.delete().catch(console.error);
                        m.delete().catch(console.error);
                    });
                }, SECOND * 10);
            });
        return;
    } else if (numberOfMessages <= 0) {
        message.channel.send(`Limit to low. Number must be grater than 0`)
            .then(msg => {
                setTimeout(() => {
                    extractMessage(msg, m => {
                        message.delete().catch(console.error);
                        m.delete().catch(console.error);
                    });
                }, SECOND * 10);
            });
        return;
    }
    let messages: Message[];
    if (member) messages = message.channel.messages.cache.map(m => m).filter(m => m.author === member!.user).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    else messages = message.channel.messages.cache.map(m => m).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    const twoWeeksAgo = Date.now() - (WEEK * 2);

    if (messages.length >= numberOfMessages + 1) {
        const shouldBulk = !!messages.find(e => e.createdTimestamp > twoWeeksAgo);
        if (shouldBulk) {
            await message.channel.bulkDelete(messages);
        } else {
            const purgeMessages = messages.splice(0, numberOfMessages + 1);
            for (const purgeMessage of purgeMessages) {
                await purgeMessage.delete().catch(console.error);
            }
            await message.delete().catch(console.error);
        }

    } else {
        try {
            await message.delete().catch(console.error);
            const messagesCollection = await message.channel.messages.fetch({ limit: numberOfMessages + 1 > 100 ? 100 : numberOfMessages + 1 });
            messages = messagesCollection.map(m => m).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            if (member) messages = message.channel.messages.cache.map(m => m).filter(m => m.author === member!.user).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            else messages = message.channel.messages.cache.map(m => m).sort((a, b) => b.createdTimestamp - a.createdTimestamp);

            const purgeMessages = messages.splice(0, messages.length < numberOfMessages ? messages.length : numberOfMessages);

            const deletedCollection = await message.channel.bulkDelete(purgeMessages);
            const deleted = deletedCollection.map(m => m);
            for (const delMsg of deleted) {
                const indexOf = purgeMessages.indexOf(delMsg);
                if (indexOf !== -1) purgeMessages.splice(indexOf, 1);
            }
            for (const message of purgeMessages) {
                await message.delete().catch(console.error);

            }

        } catch (error) {
            message.channel.send(language.guildAdmin.unknownError);
        }
    }
}

async function purgeAll(message: Message, language: Language) {
    if (!message.guild) return;
    const channel = message.channel as TextChannel;
    if (hasPermissionInChannel(message.channel, 'MANAGE_CHANNELS')) {
        const pos = channel.position;
        const newChannel = await channel.clone();
        await channel.delete();
        await newChannel.setPosition(pos);
    } else {
        message.channel.send(language.guildAdmin.noPermissionManageChannels);
    }
}

async function ignoreChannel(message: Message, language: Language) {
    if (!message.guild) return;
    const args = getCommandArgs(message);
    const flag = args[0].toLowerCase();
    const ignore = ['ignore', ...language.guildAdmin.flagIgnore];
    const doNotReact = ['do-not-react', ...language.guildAdmin.flagDoNotReact];
    const preventSwears = ['prevent-swears', ...language.guildAdmin.flagPreventSwears];
    const clear = ['clear', ...language.guildAdmin.flagClear];
    
    if (ignore.includes(flag)) {
        const result = await setFlagToChannel(message.channel as TextChannel, ChannelFlag.Ignore);
        message.channel.send(result ? language.guildAdmin.flagIgnoreMessage : language.guildAdmin.flagSomethingWentWrong);    
    } else if (doNotReact.includes(flag)) {
        const result = await setFlagToChannel(message.channel as TextChannel, ChannelFlag.DoNotReact);
        message.channel.send(result ? language.guildAdmin.flagDoNotReactMessage : language.guildAdmin.flagSomethingWentWrong);
    } else if (preventSwears.includes(flag)) {
        const result = await setFlagToChannel(message.channel as TextChannel, ChannelFlag.PreventSwears);
        message.channel.send(result ? language.guildAdmin.flagPreventSwearsMessage : language.guildAdmin.flagSomethingWentWrong);    
    } else if (clear.includes(flag)) {
        const result = await setFlagToChannel(message.channel as TextChannel, ChannelFlag.Clear);
        message.channel.send(result ? language.guildAdmin.flagClearMessage : language.guildAdmin.flagSomethingWentWrong);       
    } else {
        message.channel.send(language.guildAdmin.flagUnknownFlag);  
    }
}