import { TextChannel, RichEmbed, Channel, DMChannel, GroupDMChannel } from 'discord.js';
import { client } from '../index';

export function embedSend(channel: TextChannel | DMChannel | GroupDMChannel, embed) {
    channel.stopTyping();
    addClient(embed);
    channel.send(embed).catch(err => {
        client.emit('error', err);

        channel.send('⛔ ' + err.message + '\nMake sure that I have permission `Embed links` otherwize some of my features are not going to work!')

        console.log(err)
        //textSend(channel, null, embed)
    })
}

function textSend(channel: TextChannel | DMChannel | GroupDMChannel, text?: string, embed?: RichEmbed) {
    channel.stopTyping();
    if (text) channel.send(text);
    else if (embed) {
        channel.send('This is not supported yet').catch(err => {
            client.emit('error', err);
        });
    }
}

export function addClient(embed: RichEmbed) {
    embed.setFooter(client.user.tag, client.user.avatarURL);
    embed.setTimestamp(new Date());
    return embed;
}


export function errorEmbed(text: string) {
    const embed = new RichEmbed();
    embed.setColor("RED");
    embed.addField("Error", text);
    return embed;
}

export function infoEmbed(text: string) {
    const embed = new RichEmbed();
    embed.setColor("GOLD");
    embed.addField("Info", text);
    return embed;
}
