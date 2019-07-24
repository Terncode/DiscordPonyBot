import { Message, RichEmbed } from 'discord.js';
import { getDef } from 'word-definition'
import { prefix } from "./guildPrefix";
import { embedSend } from './sendMessage';

const logo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJuyaXUT9CDxfoxAhEOZXAs0JT1YinMGz5dOkzTwlfBmpnBre9Cw";
const words = ["anal", "anus", "arse", "ass", "assfuck", "asshole", "assfucker", "asshole", "assshole", "bastard", "bitch", "blackcock", "bloodyhell", "boong", "cock", "cockfucker", "cocksuck", "cocksucker", "coon", "coonnass", "crap", "cunt", "cyberfuck", "damn", "darn", "dick", "dirty", "douche", "dummy", "erect", "erection", "erotic", "escort", "fag", "faggot", "fuck", "Fuckoff", "fuckyou", "fuckass", "fuckhole", "goddamn", "gook", "hardcore", "hardcore", "homoerotic", "hore", "lesbian", "lesbians", "mother fucker", "motherfuck", "motherfucker", "negro", "nigger", "orgasim", "orgasm", "penis", "penisfucker", "piss", "pissoff", "porn", "porno", "pornography", "pussy", "retard", "sadist", "sex", "sexy", "shit", "slut", "sonofabitch", "suck", "tits", "viagra", "whore", "xxx"];


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

    //@ts-ignore
    if (message.channel.nsfw !== true) {
        if (words.includes(string.toLowerCase().replace(/[^a-zA-Z:,]+/g, ''))) {
            embed.setColor("RED");
            embed.addField('Error', 'Word ignored')
            embedSend(message.channel, embed);
            return true;
        }
    }

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
