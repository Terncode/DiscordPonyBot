import { clamp, random } from 'lodash';
import { Message } from 'discord.js';
import { getLanguage } from '../../until/guild';
import { checkCommand, getCommandArgs, removePrefixAndCommand } from '../../until/commandsHandler';
import { Language, PTCommands } from '../../language/langTypes';

import { hasPermissionInChannel } from '../../until/util';
import { CustomFaceCanvas, CustomAction } from './actionDraw/CustomFaceCanvas';
import { matchExpression } from './actionDraw/expressionUtils';
import { ExpressionExtra } from './actionDraw/interfaces';
import { ptChecker } from '../..';
import { reportErrorToOwner } from '../../until/errors';

const imageDataURI = require('image-data-uri');

export const PT_COMMANDS: PTCommands = {
    roll: ['roll', 'rand', 'random'],
    candy: ['candies', 'candy'],
    clover: ['clovers', 'clover'],
    eggs: ['eggs'],
    gifts: ['gifts'],
    toys: ['toys'],
    cookies: ['cookie', 'cookies'],
    changeLog: ['changelog'],
    randomFace: ['randomface', 'rf'],
    randomAction: ['action', 'action'],
    command: ['ponytown', 'pt'],
};

export function PTCommands(message: Message) {

    const language = getLanguage(message.guild);
    if (checkCommand(message, [...language.pt.commands.roll, ...PT_COMMANDS.roll])) {
        message.channel.send(roll(message, language));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.candy, ...PT_COMMANDS.candy])) {
        message.channel.send(randomPerId(language, message.author.id.slice(0, 3), '🍬'));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.eggs, ...PT_COMMANDS.eggs])) {
        message.channel.send(randomPerId(language, message.author.id.slice(3, 6), '🥚'));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.clover, ...PT_COMMANDS.clover])) {
        message.channel.send(randomPerId(language, message.author.id.slice(6, 9), '🍀'));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.cookies, ...PT_COMMANDS.cookies])) {
        message.channel.send(randomPerId(language, message.author.id.slice(1, 4), '🍪'));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.gifts, ...PT_COMMANDS.gifts])) {
        message.channel.send(randomPerId(language, message.author.id.slice(9, 12), '🎁'));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.toys, ...PT_COMMANDS.toys])) {
        message.channel.send(toys(/*message,*/ language));
        return true;
    } else if (checkCommand(message, [...language.pt.commands.command, ...PT_COMMANDS.command])) {
        const args = getCommandArgs(message);
        if ([...language.pt.commands.randomAction, ...PT_COMMANDS.randomAction].includes(args[0])) {
            action(message, language);
            return true;
        } else if ([...language.pt.commands.randomFace, ...PT_COMMANDS.randomFace].includes(args[0])) {
            message.channel.send(randomFace(/*message,*/ language));
            return true;
        } else if ([...language.pt.commands.changeLog, ...PT_COMMANDS.changeLog].includes(args[0])) {
            changeLog(message, language);
            return true;
        }
    } else return false;
}

// EXPERIMENTAL FUNCTION DO NOT USE
export async function reactWithPTEmoji(message: Message) {
    if (!message.guild) return;
    if (hasPermissionInChannel(message.channel, 'MANAGE_EMOJIS')) {
        const emojiExpression = message.cleanContent;
        if (!emojiExpression) return;

        const image = generateAction(emojiExpression);
        if (!image) return;

        try {
            const emoji = await message.guild.emojis.create(image.dataBuffer, 'TemporaryEmoji');
            await message.react(emoji);
            await emoji.delete();
        } catch (error) {
            reportErrorToOwner(message.client, error, 'Emoji reaction');
        }
    }
}

function generateAction(emojiExpression: string): any | null {
    let action: CustomAction = {
        blush: false,
        crying: 0,
        hearts: false,
        left: 0,
        leftIris: 0,
        muzzle: 0,
        right: 0,
        rightIris: 0,
        sleeping: false,
    };

    if (emojiExpression.lastIndexOf(' ') !== -1)
        emojiExpression = emojiExpression.slice(emojiExpression.lastIndexOf(' ') + 1);

    const expression = matchExpression(emojiExpression);
    if (!expression) return null;

    const turnOffExtra = (action: CustomAction) => {
        action.sleeping = false;
        action.hearts = false;
        action.blush = false;
        action.crying = 0;
        return action;
    };

    action.left = expression.left;
    action.right = expression.right;

    action.leftIris = expression.leftIris;
    action.rightIris = expression.rightIris;

    action.muzzle = expression.muzzle;

    if (expression.extra !== ExpressionExtra.None) {
        if (!action.sleeping && expression.extra === ExpressionExtra.Blush) action.blush = true;
        else {
            action = turnOffExtra(action);
            if (expression.extra === ExpressionExtra.Zzz) action.sleeping = true;
            if (expression.extra === ExpressionExtra.Cry) action.crying = 2;
            if (expression.extra === ExpressionExtra.Tears) action.crying = 1;
        }
    }
    const canvas = new CustomFaceCanvas(action);
    return imageDataURI.decode(canvas.getData());
}

function roll(message: Message, language: Language): string {
    const content = removePrefixAndCommand(message);
    const [, min, max] = /^(?:(\d+)-)?(\d+)$/.exec(content) || ['', '', ''];
    const ROLL_MAX = 1000000;
    const minValue = clamp((min ? parseInt(min, 10) : 1) | 0, 0, ROLL_MAX);
    const maxValue = clamp((max ? parseInt(max, 10) : 100) | 0, minValue, ROLL_MAX);
    const RESULT = content === '🍎' ? content : random(minValue, maxValue).toString();
    const MAX_VALUE = `${minValue !== 1 ? `${minValue}-` : ''}${maxValue}`;
    return language.pt.rolled.replace(/&RESULT/g, RESULT).replace(/&MAX_VALUE/g, MAX_VALUE);
}

function randomPerId(language: Language, RESULT: string, EMOJI: string): string {
    if (!RESULT) RESULT = random(200, 999).toString();
    if (RESULT.startsWith('0')) RESULT = `1${RESULT.slice(1)}`;
    return language.pt.collected.replace(/&RESULT/g, RESULT).replace(/&EMOJI/g, EMOJI);
}

function toys(/*message: Message,*/ language: Language) {
    return language.pt.toys.replace(/&RESULT/g, '64').replace(/&MAX_TOYS/g, '64');
}

async function changeLog(message: Message, language: Language) {
    if (!ptChecker) {
        message.channel.send(language.disabledCommand);
        return;
    }
    message.channel.startTyping();
    try {
        const data = await ptChecker.fetchChangeLog(message.content);
        await message.channel.stopTyping();
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS'))
            message.channel.send(data.richEmbed);
        else {
            const changes = data.changeLog.changes.join('\n')
            message.channel.send(`\`\`\`\n${data.changeLog.version}\n${changes.length > 2000 ? `changes.slice(0,2000)` : changes}\`\`\``);
        }
    } catch (error) {
        await message.channel.stopTyping();
        throw error;
    }
}

function randomFace(language: Language) {
    const mouthOptions = ['C', 'p', 'm', '-', '_', 'A', '.', 'P', '~', 'o'];
    const eyeOptions = ['0', 'e', 'g', 'd', '>', '<', '=', 'u', 'a', 'ó', 'ò', 't', 'ô', 'O', 'Ò', 'Ó', 'Ô', '6'];

    const love = '/love';
    const cry = '/cry';
    const sleep = '/sleep';
    let command = '';
    let thisBlush = false;

    const ranIntAry = (max: number) => {
        return Math.floor(Math.random() * max);
    };

    const leftEye = eyeOptions[ranIntAry(eyeOptions.length)];
    const mouth = mouthOptions[ranIntAry(mouthOptions.length)];
    const rightEye = eyeOptions[ranIntAry(eyeOptions.length)];

    const blush = Math.floor(Math.random() * 4);
    const heart = Math.floor(Math.random() * 8);
    const sleeping = Math.floor(Math.random() * 12);
    const crying = Math.floor(Math.random() * 14);

    if (!blush) thisBlush = true;
    if (!sleeping || !heart || crying) {
        if (!sleeping || !heart) {
            if (Math.floor(Math.random() * 2) === 1) command = sleep;
            else command = love;
        }
        if (!sleeping || !crying) {
            if (Math.floor(Math.random() * 2) === 1) command = sleep;
            else command = cry;
        }
        if (!heart || !crying) {
            if (Math.floor(Math.random() * 2) === 1) command = love;
            else command = cry;
        }
    }
    let isBlush = '';
    if (thisBlush) isBlush = '//';
    const RESULT = `${command} ${leftEye}${isBlush}${mouth}${isBlush}${rightEye}`;

    return language.pt.randomFace.replace(/&RANDOM_FACE/g, RESULT);
}

async function action(message: Message, language: Language) {
    if (!hasPermissionInChannel(message.channel, 'ATTACH_FILES')) {
        message.channel.send(language.pt.missingPermissionAttachFiles);
        return;
    }

    setTimeout(async () => {
        const content = removePrefixAndCommand(message);
        let image = generateAction(content);
        if (!image) {
            const eye = random(0, 24);
            const look = random(0, 6);

            const action: CustomAction = {
                blush: !random(0, 25),
                crying: !!random(0, 10) ? 0 : random(0, 2),
                hearts: !random(0, 10),
                rightIris: eye ? look : random(0, 6),
                right: eye ? eye : random(0, 24),
                left: eye ? eye : random(0, 24),
                leftIris: eye ? look : random(0, 6),
                muzzle: random(0, 25),
                sleeping: !random(0, 10),
            };
            const canvas = new CustomFaceCanvas(action);
            image = imageDataURI.decode(canvas.getData());
        }
        message.channel.send(undefined, { files: [image.dataBuffer] });
    });
}
