import { Message, RichEmbed } from 'discord.js';
import { getDef } from 'word-definition'
import { prefix } from "./guildPrefix";
import { embedSend } from './sendMessage';

const logo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJuyaXUT9CDxfoxAhEOZXAs0JT1YinMGz5dOkzTwlfBmpnBre9Cw";

export function dictonary(message: Message) {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (!p.startsWith('d ') && !p.startsWith('worddefinition ') && !p.startsWith('define ')) return false;
    const embed = new RichEmbed();
    embed.setAuthor('Word definition', logo);
    if (p === 'd' || p === 'worddefinition' || p === 'define ') {

        embed.setColor("RED");
        embed.addField('Error', 'No word to define')
        embedSend(message.channel, embed);
        return true
    }
    let string = p.slice(p.indexOf(' ')).trim();

    define(message, string, embed);




}



function define(message: Message, word: string, embed: RichEmbed) {
    getDef(word, 'en', null, definition => {
        if (definition.err != undefined) {
            embed.setColor("RED");
            embed.addField('Error', `Cannot find word: \`${word}\``)
            embedSend(message.channel, embed);
        } else {
            embed.setTitle(definition.word)
            embed.addField("Definition:", definition.definition)
            embed.setColor("WHITE");
            embedSend(message.channel, embed);
        }
    });


}
