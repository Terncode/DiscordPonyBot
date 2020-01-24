import { Message, TextChannel, RichEmbed, Guild, Role } from 'discord.js';

import { checkCommand, removePrefixAndCommand, getCommandArgs } from '../../until/commandsHandler';
import { hasPermissionInChannel } from '../../until/util';
import { stringifyEmbed } from '../../until/embeds';
import { getPrefix } from '../../until/guild';
import { embedSend } from './TernsCodeLabIndex';

const maxPersonalRoles = 3;
const bannedRoleNames = ['anal', 'anus', 'arse', 'ass', 'assfuck', 'asshole', 'assfucker', 'asshole', 'assshole', 'bastard', 'bitch', 'blackcock', 'bloodyhell', 'boong', 'cock', 'cockfucker', 'cocksuck', 'cocksucker', 'coon', 'coonnass', 'crap', 'cunt', 'cyberfuck', 'damn', 'darn', 'dick', 'dirty', 'douche', 'dummy', 'erect', 'erection', 'erotic', 'escort', 'fag', 'faggot', 'fuck', 'Fuckoff', 'fuckyou', 'fuckass', 'fuckhole', 'goddamn', 'gook', 'hardcore', 'hardcore', 'homoerotic', 'hore', 'lesbian', 'lesbians', 'mother fucker', 'motherfuck', 'motherfucker', 'negro', 'nigger', 'orgasim', 'orgasm', 'penis', 'penisfucker', 'piss', 'pissoff', 'porn', 'porno', 'pornography', 'pussy', 'retard', 'sadist', 'sex', 'sexy', 'shit', 'slut', 'sonofabitch', 'suck', 'tits', 'viagra', 'whore', 'xxx'];

// ffff00 admin
// c8c8ff
// 00c000 member

// 80ff80 personal roles
const personalRolesColor = '#80ff80';
const otherRolesColor = '#00ffd2';

export function roleManager(message: Message) {
    if (checkCommand(message, ['role'])) {
        manager(message);
        return true;
    }
    return false;
}
function manager(message: Message) {
    const channel = message.channel as TextChannel;
    const guild = message.guild;
    const prefix = getPrefix(message.guild);
    const embed = new RichEmbed();
    embed.setAuthor('Pony CodeLab', guild.iconURL);

    if (!channel.name.toLowerCase().includes('role-manager')) {
        const roleManagerChannel = guild.channels.find(c => c.name.toLowerCase().includes('role-manager'));
        const roleManager = roleManagerChannel ? roleManagerChannel : '#role-manager';
        embed.setColor('RED');
        if (roleManager)
            embed.addField('Error', `You can only use this command on inside ${roleManager} channel!`);
        embedSend(message.channel, embed);
        return;
    }

    const content = removePrefixAndCommand(message);
    const args = getCommandArgs(message);

    switch (args[0]) {
        case 'list':
            rolesList(message, embed);
            return true;
        case 'add':
            addRole(message, embed, content.toLowerCase().slice(args[0].length, content.length).trim());
            return true;
        case 'remove':
            removeRole(message, embed, content.toLowerCase().slice(args[0].length, content.length).trim());
            return true;
        case 'request':
            requestRole(message, embed, content.toLowerCase().slice(args[0].length, content.length).trim());
            return true;
        case 'suggest': {
            suggestRole(message, embed, content.toLowerCase().slice(args[0].length, content.length).trim());
            return true;
        }
        default:
            embed.setColor('RED');
            embed.addField('Something went wrong', `It looks like you are using commands wrong!`);
            const help = [
                `${prefix}list  - shows available roles`,
                `${prefix}add <role> - adds role`,
                `${prefix}remove <role> - remove role`,
                `${prefix}suggest <role> - suggest Role`,
                `${prefix}request <role> - request role`,
            ];
            embed.addField('Help', help.join('\n'));
            if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
            else message.channel.send(stringifyEmbed(embed, message.client));
            return;
    }
}

function rolesList(message: Message, embed: RichEmbed) {
    const prefix = getPrefix(message.guild);
    const guild = message.guild;
    const personalRoles = message.guild.roles.filter(r => r.hexColor === personalRolesColor).map(r => r.name);
    embed.setTitle('Role List');
    embed.setDescription('Some roles can unlock special channels');
    if (personalRoles)
        embed.addField(`Personal roles (max ${maxPersonalRoles})`, personalRoles.join('\n'));
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r.name);
    if (otherRoles)
        embed.addField(`Other roles`, otherRoles.join('\n'));
    const specialRoles = getSpecialRoles(guild).map(r => r.name);

    if (specialRoles.length !== 0)
        embed.addField(`Special roles (use ${prefix}role request [rolename])`, specialRoles.join('\n'));

    embed.setColor('WHITE');
    if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
    else message.channel.send(stringifyEmbed(embed, message.client));
}

function addRole(message: Message, embed: RichEmbed, roleName: string) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);

    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    const prefix = getPrefix(message.guild);

    if (!role) {
        embed.setColor('RED');
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client));
        return true;
    } else if (guildMember.roles.find(r => r === role)) {
        embed.setColor('GOLD');
        embed.addField('Info', `You already have role: \`${roleName}\``);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client));
        return true;
    }

    const personalRoles = guild.roles.filter(r => r.hexColor === personalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);

    if (personalRoles.includes(role)) {
        const memberRoles = guildMember.roles.filter(r => r.hexColor === personalRolesColor);
        if (memberRoles.size > maxPersonalRoles) {
            embed.setColor('RED');
            embed.addField('Error', `Limit reached. You can have only ${maxPersonalRoles} personal roles`);
            if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
            else message.channel.send(stringifyEmbed(embed, message.client));
            return true;
        } else {
            guildMember.addRole(role)
                .then(() => {
                    embed.setColor('GOLD');
                    embed.addField('Info', `Personal role \`${role.name}\` has been successfully added to your account`);
                    if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
                    else message.channel.send(stringifyEmbed(embed, message.client));
                })
                .catch(err => {
                    embed.setColor('RED');
                    embed.addField('ERROR', `Something went wrong ${err.message}`);
                    if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
                    else message.channel.send(stringifyEmbed(embed, message.client));
                });
        }
    } else if (otherRoles.includes(role)) {
        guildMember.addRole(role)
            .then(() => {
                embed.setColor('GOLD');
                embed.addField('Info', `Role \`${role.name}\` has been successfully added to your account`);
                if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
                else message.channel.send(stringifyEmbed(embed, message.client));
            })
            .catch(err => {
                embed.setColor('RED');
                embed.addField('ERROR', `Something went wrong ${err.message}`);
                if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
                else message.channel.send(stringifyEmbed(embed, message.client));
            });
    } else if (specialRoles.includes(role)) {
        embed.setColor('RED');
        embed.addField('Info', `You cannot add this by yourself but you can ask admin for it.\n Use  \`${prefix}role request <RoleName>\``);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client));
    } else if (role.name.toLowerCase().includes('mod') || role.name.toLowerCase().includes('admin')) {
        embed.setColor('RED');
        embed.addField('Info', `Nice try 😉`);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client));
    } else {
        embed.setColor('RED');
        embed.addField('Info', `You cannot add this role by yourself. Sorry 😶`);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client));
    }
    return true;
}
function removeRole(message: Message, embed: RichEmbed, roleName: string) {

    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);

    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);

    if (!role) {
        embed.setColor('RED');
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        embedSend(message.channel, embed);
        return true;
    } else if (!guildMember.roles.find(r => r === role)) {
        embed.setColor('GOLD');
        embed.addField('Info', `You don't have role: \`${roleName}\``);
        embedSend(message.channel, embed);
        return true;
    }

    const persionalRoles = guild.roles.filter(r => r.hexColor === personalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);

    if (persionalRoles.includes(role)) {

        guildMember.removeRole(role)
            .then(() => {
                embed.setColor('GOLD');
                embed.addField('Info', `Personal role \`${role.name}\` has been successfully removed from your account`);
                embedSend(message.channel, embed);
            })
            .catch(err => {
                embed.setColor('RED');
                embed.addField('ERROR', `Something went wrong: ${err.message}`);
                embedSend(message.channel, embed);
            });

    } else if (otherRoles.includes(role)) {
        guildMember.removeRole(role)
            .then(() => {
                embed.setColor('GOLD');
                embed.addField('Info', `Role \`${role.name}\` has been successfully removed from your account`);
                embedSend(message.channel, embed);
            })
            .catch(err => {
                embed.setColor('RED');
                embed.addField('ERROR', `Something went wrong: ${err.message}`);
                embedSend(message.channel, embed);
            });
    } else if (role.name.toLowerCase().includes('cute')) {
        embed.setColor('RED');
        embed.addField('Info', `If you are cute you are cute as simple is that.😄`);
        embedSend(message.channel, embed);
    } else if (specialRoles.includes(role)) {
        embed.setColor('RED');
        embed.addField('Info', `You can't just remove special role by yourself.😐`);
        embedSend(message.channel, embed);
    } else if (role.name.toLowerCase().includes('mod')) {
        guildMember.removeRole(role)
            .then(() => {
                embed.setColor('RED');
                embed.addField('Info', `Okay...😮\n\nRemoved moderator role.`);
                embedSend(message.channel, embed);
            })
            .catch(err => {
                embed.setColor('RED');
                embed.addField('ERROR', `Something went wrong: ${err.message}`);
                embedSend(message.channel, embed);
            });
    } else {
        embed.setColor('RED');
        embed.addField('Info', `You cannot add this role by yourself. Sorry 😶`);
        embedSend(message.channel, embed);
    }
    return true;

}

function requestRole(message: Message, embed: RichEmbed, roleName: string) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);

    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);

    if (!role) {
        embed.setColor('RED');
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        embedSend(message.channel, embed);
        return;
    } else if (guildMember.roles.find(r => r === role)) {
        embed.setColor('GOLD');
        embed.addField('Info', `You already have this role: \`${roleName}\``);
        embedSend(message.channel, embed);
        return;
    }

    const personalRoles = guild.roles.filter(r => r.hexColor === personalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);

    const prefix = getPrefix(message.guild);
    if (personalRoles.includes(role) || otherRoles.includes(role)) {
        embed.setColor('WHITE');
        embed.addField('info', `You don't have to request this roll, you can add it by yourself\n \`${prefix}role add ${role.name}\``);
        embedSend(message.channel, embed);
    } else if (specialRoles.includes(role)) {
        embed.setColor('GOLD');
        embed.addField('info', `Request was sent to admin`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs')) as TextChannel;
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category') botLog.send(`Member ${message.author} wants role ${role.name}`);
        embedSend(message.channel, embed);
    } else if (role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('mod')) {
        embed.setColor('RED');
        embed.addField('Error', `Nope`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs')) as TextChannel;
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category') botLog.send(`Member ${message.author} wants role ${role.name}`);
        embedSend(message.channel, embed);
        return;
    } else {
        embed.setColor('GOLD');
        embed.addField('info', `Hmm will think about that...`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs')) as TextChannel;
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category') botLog.send(`User ${message.author} wants role ${role.name}`);
        embedSend(message.channel, embed);

    }
}

function suggestRole(message: Message, embed: RichEmbed, roleName: string) {
    const guild = message.guild;

    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    const guildRoles = guild.roles.map(r => r);

    if (guildRoles.includes(role)) {
        embed.setColor('RED');
        embed.addField('Error', `Unable to suggest existing role`);
        embedSend(message.channel, embed);
        return true;
    } else {
        if (roleName.length < 5) {
            embed.setColor('RED');
            embed.addField('Error', `Role name must be longer than 4 characters!...`);
            embedSend(message.channel, embed);
            return;

        }

        for (const bannedName of bannedRoleNames) {
            if ((roleName.toLowerCase().replace(/[^a-zA-Z:,]+/g, '').includes(bannedName))) {
                embed.setColor('RED');
                embed.addField('Error', `Blocked role name!`);
                embedSend(message.channel, embed);
                return;
            }
        }
        embed.setColor('GOLD');
        embed.addField('info', `Role suggested...`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('suggestion')) as TextChannel;
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category') botLog.send(`User ${message.author} suggest role ${roleName}`);
        embedSend(message.channel, embed);
    }
}

function getSpecialRoles(guild: Guild): Role[] {

    const specialRoles = [];
    const devRole = guild.roles.find(r => r.name.toLowerCase().includes('dev'));
    const artist = guild.roles.find(r => r.name.toLowerCase().includes('artist'));
    const bestFriend = guild.roles.find(r => r.name.toLowerCase().includes('writer'));
    const memeMaster = guild.roles.find(r => r.name.toLowerCase().includes('best friend'));
    if (devRole) specialRoles.push(devRole);
    if (artist) specialRoles.push(artist);
    if (bestFriend) specialRoles.push(bestFriend);
    if (memeMaster) specialRoles.push(memeMaster);
    return specialRoles;
}
