import { Message, RichEmbed } from 'discord.js';
import { term, random } from 'urban-dictionary';
import { prefix } from './guildPrefix';
import { embedSend, errorEmbed } from './sendMessage';

const urbanDictonaryIco = 'https://firebounty.com/image/635-urban-dictionary';
const urbanDictonaryUrl = 'https://www.urbandictionary.com';
export function urbanDictonary(message: Message) {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (!p.startsWith('ud') && !p.startsWith('urbandictonary')) return false;

    //@ts-ignore
    if (!message.channel.nsfw) {
        if (message.channel.type !== 'dm')
            embedSend(message.channel, errorEmbed('This command only works in nsfw channels!'));
        else {
            embedSend(message.channel, errorEmbed('This command do not works in dm channels!'));
        }
        return true;
    }

    if (p.indexOf(' ') === -1) return randomWord(message)
    let string = p.slice(p.indexOf(' ')).trim();

    dictionary(message, string);
    return true;
}

function randomWord(message: Message) {
    message.channel.startTyping();
    const embed = new RichEmbed();
    embed.setAuthor('UrbanDictonary', urbanDictonaryIco, urbanDictonaryUrl)

    //@ts-ignore
    random((error, entries) => {
        message.channel.stopTyping();
        if (error) {
            embed.setColor("RED");
            embed.addField('Error', error.message.toString());

            embedSend(message.channel, embed);
        } else {
            embed.setColor([240, 145, 21])
            embed.setTitle(entries.word)
            embed.addField('Definition', bold(entries.definition.slice(0, 1024)));
            embed.addField('Example', bold(entries.example.slice(0, 1024)));
            embed.addField('Source', `https://www.urbandictionary.com/define.php?term=${entries.word.replace(/ /g, '+')}`);
            embedSend(message.channel, embed);
        }
    });
}


function dictionary(message: Message, word: string) {
    message.channel.startTyping();
    const embed = new RichEmbed();
    embed.setAuthor('UrbanDictonary', urbanDictonaryIco, urbanDictonaryUrl)

    //@ts-ignore
    term(word, (error, entries) => {
        message.channel.stopTyping();
        if (error) {
            embed.setColor("RED");
            embed.addField('Error', error.message.toString());

            embedSend(message.channel, embed);
        } else {
            embed.setColor([240, 145, 21])
            embed.setTitle(entries[0].word)
            embed.addField('Definition', bold(entries[0].definition.slice(0, 1024)));
            embed.addField('Example', bold(entries[0].example.slice(0, 1024)));
            embed.addField('Source', `https://www.urbandictionary.com/define.php?term=${entries[0].word.replace(/ /g, '+')}`);
            embedSend(message.channel, embed);
        }
    });
}

function bold(msg: string) {

    while (msg.includes("[")) msg = msg.replace("[", "**");
    while (msg.includes("]")) msg = msg.replace("]", "**");

    return msg;
}
