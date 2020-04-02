import { Client, MessageEmbed, Guild } from 'discord.js';
export function signEmbed(client: Client) {
    const embed = new MessageEmbed();
    embed.setFooter(client.user!.tag, client.user!.displayAvatarURL());
    embed.setTimestamp(Date.now());
    return embed;
}

export function stringifyEmbed(embed: MessageEmbed, client: Client, guild?: Guild | null) {
    const markup = '```';
    let content = '';

    if (embed.title) content += `${removeMarkup(embed.title, client, guild)}\n`;
    if (embed.description) content += `${removeMarkup(embed.description, client, guild)}\n`;

    if (embed.fields)
        embed.fields.forEach(field => {
            content += `${field.name}/n${field.value}`;
        });

    return `${markup}\n${content}${markup}`;
}

export function removeMarkup(text: string, client: Client, guild?: Guild | null) {
    if (!text) return text;
    const underlines = text.match(/__[\S]*__/gi);
    if (underlines)
        for (const underline of underlines) {
            const removed = underline.slice(2, -2);
            text = text.replace(underline, removed);
        }
    const embedPreventers = text.match(/<[\S]*>/gi);
    if (embedPreventers)
        for (const embedPreventer of embedPreventers) {
            const removed = embedPreventer.slice(1, -1);
            text = text.replace(embedPreventer, removed);
        }

    const codes = text.match(/```[\S\n\t ]*```/gi);
    if (codes)
        for (const code of codes) {
            const removed = code.slice(3, -3);
            text = text.replace(code, removed);
        }

    const codeBlocks = text.match(/`[\S ]*`/gi);
    if (codeBlocks)
        for (const codeBlock of codeBlocks) {
            const removed = codeBlock.slice(1, -1);
            text = text.replace(codeBlock, removed);
        }

    const bolds = text.match(/\*\*[\S]*\*\*/gi);
    if (bolds)
        for (const bold of bolds) {
            const removed = bold.slice(2, -2);
            text = text.replace(bold, removed);
        }
    const italics = text.match(/\*[\S]*\*|_[\S]*_/gi);
    if (italics)
        for (const italic of italics) {
            const removed = italic.slice(1, -1);
            text = text.replace(italic, removed);
        }

    const strikes = text.match(/```[\S]*```/gi);
    if (strikes)
        for (const strike of strikes) {
            const removed = strike.slice(2, -2);
            text = text.replace(strike, removed);
        }
    const links = text.match(/\[[\S ]*\]\([\S]*\)/gi);
    if (links)
        for (const link of links) {
            const removed = link.replace(/[\)\]]/g, '').replace(/[\(\[]/g, '\n');
            text = text.replace(link, removed);
        }
    if (client) {
        const users = text.match(/<@[0-9]*>/gi);
        if (users)
            for (const user of users) {
                const id = user.replace(/[<@!>]/g, '');
                let guildUser = null;
                if (guild) guildUser = guild.members.cache.find(u => u.user.id === id);
                if (guildUser) {
                    text = text.replace(user, guildUser.displayName);
                } else {
                    const discordUser = client.users.cache.find(u => u.id === id);
                    if (discordUser) text = text.replace(user, discordUser.tag);
                }
            }
    }
    if (guild) {
        const channels = text.match(/<#[0-9]*>/gi);
        if (channels)
            for (const channel of channels) {
                const id = channel.replace(/[<#!\>]/g, '');
                const guildChannel = guild.channels.cache.find(c => c.id === id);
                if (guildChannel)
                    text = text.replace(channel, guildChannel.name);
            }
    }
    return text;
}
