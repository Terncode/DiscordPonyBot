import { Message, TextChannel } from 'discord.js';

import { hasBadWords } from './ptown/swears';
import { hasPermissionInChannel } from '../until/util';
import { isSwearPreventionEnabled, isAutoConversionEnabled } from '../until/guild';
const IM = require('convert-units');

interface ObjectWithDynamicNames {
    [key: string]: string;
}

const unitFullName: ObjectWithDynamicNames = {
    'inches': 'in',
    'inch': 'in',
    'feet': 'ft',
    'yard': 'yd',
    'yards': 'yd',
    'mile': 'mi',
    'miles': 'mi',
    'ounces': 'oz',
    'ounce': 'oz',
    'pounds': 'lb',
    'pound': 'lb',
    'meter': 'm',
    'meters': 'm',
    '°F': 'F',
    '°C': 'C',
};

const fromToUnit: ObjectWithDynamicNames = {
    'cm': 'in',
    'ft': 'cm',
    'lb': 'kg',
    'kg': 'lb',
    'mi': 'km',
    'km': 'mi',
    'm': 'yd',
    'yd': 'm',
    'C': 'F',
    'F': 'C',
    'oz': 'g',
    'g': 'oz',
};

export function chatMonitor(message: Message) {
    if (!message.guild) return;
    capsDetection(message);
    swearsDetection(message);
    unitDetection(message);
}

function capsDetection(message: Message) {
    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        const msg = message.content.replace(/[^a-zA-Z:,]+/g, '');
        const numUpper = (msg.match(/[A-Z]/g) || []).length;
        if (msg.length > 6 && numUpper > msg.length / 2) {
            message.react('😲');
        }
    }
}

function swearsDetection(message: Message) {
    const guildChannel = message.channel as TextChannel;

    if (guildChannel.nsfw) return;
    const content = message.content.toLowerCase().replace(/[^a-zA-Z:,]+/g, '');
    const guild = message.guild;
    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS') || hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES')) {
        if (hasBadWords(content)) {
            if (isSwearPreventionEnabled(message.guild) && hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES')) {
                message.delete();
            } else if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
                let emoji: any = guild.emojis.find(e => e.name.toLowerCase() === 'think');
                if (!emoji) emoji = guild.emojis.find(e => e.name.toLowerCase() === ':thinking:');
                if (!emoji) emoji = '🤔';
                message.react(emoji);
                return;
            }
        }
    }
}

function unitDetection(message: Message) {
    if (!isAutoConversionEnabled(message.guild)) return;
    if (!message.content.match(/[0-9]+/g)) return;
    const words = message.content.replace(/[^a-zA-Z0-9 ]+/g, '').replace(/  +/g, '').split(' ');

    const conversion: string[] = [];
    for (let i = 0; i < words.length; i++) {
        const num = parseFloat(words[i]);
        if (isNaN(num)) continue;
        if (num > 10000 || num < -10000) continue;
        let unit = words[i].replace(/[0-9]+/g, '');
        if (unit === '' && words[i + 1]) unit = words[i + 1].replace(/[0-9]+/g, '');

        const fullNames = Object.keys(unitFullName);

        if (fullNames.includes(unit))
            unit = unitFullName[unit];

        const supportedConversion = Object.keys(fromToUnit);
        if (supportedConversion.includes(unit)) {
            const result = convert(num, unit);
            conversion.push(result);
        }
    }
    if (conversion.length !== 0) message.channel.send(conversion.join(', ')).catch(() => { });
}

function convert(num: number, unit: string) {
    const toUnit = fromToUnit[unit];
    let converted = IM(num).from(unit).to(toUnit);
    if (converted.toFixed(2) !== 0.00) converted = converted.toFixed(2);
    return `\`${num}${unit} = ${converted}${toUnit}\``;
}
