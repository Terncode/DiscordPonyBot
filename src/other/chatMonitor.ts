import { Message } from 'discord.js';


const swears = ["anal", "anus", "arse", "ass", "assfuck", "asshole", "assfucker", "asshole", "assshole", "bastard", "bitch", "blackcock", "bloodyhell", "boong", "cock", "cockfucker", "cocksuck", "cocksucker", "coon", "coonnass", "crap", "cunt", "cyberfuck", "damn", "darn", "dick", "dirty", "douche", "dummy", "erect", "erection", "erotic", "escort", "fag", "faggot", "fuck", "Fuckoff", "fuckyou", "fuckass", "fuckhole", "goddamn", "gook", "hardcore", "hardcore", "homoerotic", "hore", "lesbian", "lesbians", "mother fucker", "motherfuck", "motherfucker", "negro", "nigger", "orgasim", "orgasm", "penis", "penisfucker", "piss", "pissoff", "porn", "porno", "pornography", "pussy", "retard", "sadist", "sex", "sexy", "shit", "slut", "sonofabitch", "suck", "tits", "viagra", "whore", "xxx"];


const IM = require('convert-units');

const unitFullName = {
    "inches": "in",
    "inch": "in",
    "feet": "ft",
    "yard": "yd",
    "yards": "yd",
    "mile": "mi",
    "miles": "mi",
    "ounces": "oz",
    "ounce": "oz",
    "pounds": "lb",
    "pound": "lb",
    "meter": "m",
    "meters": "m",
    "°F": "F",
    "°C": "C"
};

const fromToUnit = {
    "in": "cm",
    "cm": "in",
    "ft": "cm",
    "lb": "kg",
    "kg": "lb",
    "mi": "km",
    "km": "mi",
    "m": "yd",
    "yd": "m",
    "C": "F",
    "F": "C",
    "oz": "g",
    "g": "oz"
};


export function chatMonitor(message: Message) {
    capsDetection(message);
    swearsDetection(message);
    unitDetection(message);
}

function capsDetection(message: Message) {

    const msg = message.content.replace(/[^a-zA-Z:,]+/g, '');

    const numUpper = (msg.match(/[A-Z]/g) || []).length;
    if (msg.length > 6 && numUpper > msg.length / 2) {
        message.react("😲").catch(() => { });
    }
}

function swearsDetection(message: Message) {
    //@ts-ignore
    if (!message.guild && message.channel.nsfw) return;
    const msg = message.content.toLowerCase().replace(/[^a-zA-Z:,]+/g, '');
    const guild = message.guild;

    for (let i of swears) {
        if (msg.includes(i)) {
            let emoji: any = guild.emojis.find(e => e.name.toLowerCase() === 'think')
            if (!emoji) emoji = guild.emojis.find(e => e.name.toLowerCase() === ':thinking: ')
            if (!emoji) emoji = '🤔';
            message.react(emoji).catch(() => { });
            return;
        }
    }
}

function unitDetection(message: Message) {

    if (!message.content.match(/[0-9]+/g)) return;
    let words = message.content.replace(/[^a-zA-Z0-9 ]+/g, '').replace(/  +/g, '').split(' ');


    let conversion: string[] = [];

    for (let i = 0; i < words.length; i++) {
        const number = parseFloat(words[i]);
        if (isNaN(number)) continue;
        if (number > 10000 || number < -10000) continue;

        let unit = words[i].replace(/[0-9]+/g, '')

        if (unit === '' && words[i + 1]) unit = words[i + 1].replace(/[0-9]+/g, '')


        const fullNames = Object.keys(unitFullName);
        if (fullNames.includes(unit)) unit = unitFullName[unit];

        const supporetedConversion = Object.keys(fromToUnit);
        if (supporetedConversion.includes(unit)) {
            const result = convert(number, unit);
            conversion.push(result);
        }
    }
    if (conversion.length !== 0) message.channel.send(conversion.join(', ')).catch(() => { });
}


function convert(number: number, unit: string) {

    let toUnit = fromToUnit[unit];
    let converted = IM(number).from(unit).to(toUnit);
    if (converted.toFixed(2) != 0.00) converted = converted.toFixed(2);

    return `\`${number}${unit} = ${converted}${toUnit}\``;
}