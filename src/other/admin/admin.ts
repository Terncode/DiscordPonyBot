import { isBotOwner, removeFirstWord } from '../../until/util';
import { Message, PresenceStatus } from 'discord.js';
import { checkCommand, removePrefixAndCommand, getCommandArgs } from '../../until/commandsHandler';
import { destroy, updateActivity } from '../..';

export function ownerCommands(message: Message): boolean {
    if (!isBotOwner(message.author)) return false;

    // const dev = process.env.NODE_ENV !== 'production';
    if (/*dev && */ checkCommand(message, ['throw.error'])) {
        message.channel.send(`Throwing error...`);
        setTimeout(() => {
            throw new Error(`Error thrown by ${message.author.tag}`);
        });
        return true;
    } else if (/*dev && */ checkCommand(message, ['promise.reject'])) {
        message.channel.send(`Rejecting promise...`);
        Promise.reject();
        return true;
    } else if (checkCommand(message, ['set.status'])) {
        setStatus(message);
        return true;
    } else if (checkCommand(message, ['shutdown'])) {
        onShutDown(message);
        return true;
    } else if (checkCommand(message, ['set.presence'])) {
        setPresence(message);
        return true;
    } else if (checkCommand(message, ['eval'])) {
        onEval(message);
        return true;
    } else return false;
}

function setStatus(message: Message) {
    const status = removePrefixAndCommand(message).toLowerCase();

    if (['online', 'idle', 'invisible', 'dnd'].includes(status)) {
        const s = status as PresenceStatus;
        message.client.user.setStatus(s)
            .then(() => {
                message.channel.send(`My status has been altered`);
            }).catch(err => message.channel.send(err));
    } else {
        message.channel.send('Incorrect status you can only use `online` `idle` `invisible` `dnd`');
    }
}

function setPresence(message: Message) {
    const status = removePrefixAndCommand(message);
    if (!status) {
        updateActivity();
        return;
    }

    const args = getCommandArgs(message);
    if (['PLAYING', 'LISTENING', 'WATCHING', 'STREAMING'].includes(args[0].toUpperCase())) {
        updateActivity(removeFirstWord(status), args[0] as 'PLAYING' | 'LISTENING' | 'WATCHING' || 'STREAMING')
            .then(() => {
                message.channel.send(`activity has been altered`);
            }).catch((err: any) => {
                message.channel.send(`${err.toString()}`);
            });

        return;
    } else {
        updateActivity(status)
            .then(() => {
                if (!status) message.channel.send(`activity has been default`);
                else message.channel.send(`activity has been altered`);
            }).catch((err: any) => {
                message.channel.send(`${err.toString()}`);
            });
    }
}

function onEval(message: Message) {
    console.warn(`executing eval ${message.author.tag}`);
    const { client } = message;
    const code = removePrefixAndCommand(message);
    const isCode = code.match(/```javascript[ \n\t\S\s\w\W\r]*```/g);
    let result: any;
    try {
        if (client) console.debug();
        // tslint:disable-next-line: no-eval
        if (isCode) result = eval(isCode[0].slice(13, -3));
        // tslint:disable-next-line: no-eval
        else result = eval(code);
    } catch (error) {
        const err = error.toString();
        if (err) message.channel.send(err);
        else message.channel.send('Code error');
        return;
    }
    if (result) {
        message.channel.send(result.toString().slice(0, 2000));
    } else {
        message.channel.send('no results');
    }
}

async function onShutDown(message: Message) {
    await message.channel.send(`shutingDown...`);
    destroy();
}
