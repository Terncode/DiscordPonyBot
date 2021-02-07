import { GuildChannel, GuildMember, Message, MessageEmbed } from 'discord.js';
import { checkCommand, getCommandArgs } from '../../until/commandsHandler';
import moment from 'moment';
import { MongoVote } from './VoteMongooseShema';
import { DiscordMentions, Mentions, Proposal, Vote } from './voteInterfaces';
import { reportErrorToOwner } from '../../until/errors';
export const VOTE_COMMANDS = ['vote'];

export function vote(message: Message): boolean {
    if (checkCommand(message, VOTE_COMMANDS)) {
        const args = getCommandArgs(message);
        if (!args.length) {
            message.channel.send('No args provided');
            return true;
        }
        switch (args[0]) {
            case 'create':
                createVote(message, args.slice(1));
                break;
            case 'cast':
                cast(message, args.slice(1));
                break;
            default:
                message.channel.send('Unknown sub-command!');
                break;
        }
        return true;
    }
    return false;
}

async function createVote(message: Message, args: string[]) {
    if (message.channel.type === 'dm') {
        return message.channel.send('This command cannot be executed from dms');
    }
    const member = message.guild!.me;
    if (!member) {
        return message.channel.send('Something went wrong try again later!');
    }
    const permissions = (message.channel as GuildChannel).permissionsFor(member);
    if (!permissions || !permissions.has('EMBED_LINKS')) {
        return message.channel.send("I don't have permission to send embeds!");
    }

    if (args.length < 2) {
        return message.channel.send('Please provide a vote id and vote duration!');
    }
    const voteId = args[0];
    const time = args[1];

    if (!/[0-9A-Za-z]+/.test(voteId)) {
        return message.channel.send('Id is not valid!');
    }
    const vote = await MongoVote.findOne({
        voteId,
    });

    if (vote) {
        return message.channel.send('Vote under this name already exists!');
    }

    const timeSplit = time.split(/([a-z]+)/);

    let timeMilliseconds = 0;

    for (let i = 0; i + 1 < timeSplit.length; i += 2) {
        const quantity = parseInt(timeSplit[i], 10);
        const unit = timeSplit[i + 1];
        if (isNaN(quantity)) {
            return message.channel.send('You need to provide numbers in duration! (eg 2days12hours2minutes)');
        }

        if (isAmongThePrefixesOf(unit, 'days')) {
            timeMilliseconds += quantity * 24 * 60 * 60 * 1000;
        } else if (isAmongThePrefixesOf(unit, 'hours')) {
            timeMilliseconds += quantity * 60 * 60 * 1000;
        } else if (isAmongThePrefixesOf(unit, 'minutes')) {
            timeMilliseconds += quantity * 60 * 1000;
        } else {
            return message.channel.send(
                `Unrecognized time unit \`${unit}\`! allowed \`days\`, \`hours\`, \`minutes\`.`,
            );
        }
    }
    const proposalArray: Proposal[] = [];

    const lines = message.content.split('\n');
    let description = '';
    let extraText = '';
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^- *([A-Za-z0-9]*)( +(.*[^ ]))? */);
        if (match) {
            const proposal: Proposal = {
                name: match[1],
                description: match[3] || '',
            };
            if (extraText) {
                return message.channel.send('You cannot have text between proposals!');
            }

            proposalArray.push(proposal);
        } else {
            if (!proposalArray.length) {
                description += `${line}\n`;
            } else {
                extraText += line;
            }
        }
    }
    const discordMentions = message.mentions.toJSON() as Partial<DiscordMentions>;

    delete discordMentions.channels;
    delete discordMentions.crosspostedChannels;

    const mentions = discordMentions as Mentions;

    const votingSystem: Vote['votingSystem'] = (args[2] as Vote['votingSystem']) || 'approval';
    const allowedVotes: Vote['votingSystem'][] = ['approval', 'first-past-the-post', 'instant-runoff'];

    if (!allowedVotes.includes(votingSystem)) {
        const svbSys = `\`${allowedVotes.join('`, `')}\``;
        return message.channel.send(`Unknown vote system \`${votingSystem}\`! Available vote systems ${svbSys}`);
    }

    const endDate = new Date(Date.now() + timeMilliseconds).toISOString();

    const mongoVote = new MongoVote({
        endDate,
        proposalArray,
        channelId: message.channel.id,
        mentions,
        voteId,
        votingSystem,
        tallyArray: [],
        description,
    } as Vote);

    try {
        const embed = new MessageEmbed();
        embed.setTitle(voteId);
        embed.setAuthor(message.author.tag, message.author.avatarURL() || message.author.defaultAvatarURL);
        if (description) {
            embed.setTitle(description);
        }
        for (const proposal of proposalArray) {
            embed.addField(proposal.name, proposal.description || '-');
        }

        const date = new Date(endDate);
        embed.setFooter(`(${votingSystem}) ${moment.duration(timeMilliseconds).humanize()}`);
        embed.setTimestamp(date);
        await mongoVote.save();
        message.channel.send(embed);
    } catch (error) {
        message.channel.send(`Something went wrong ${error.message}`);
        reportErrorToOwner(message.client, error, 'Unable to create vote');
    }
}

async function cast(message: Message, args: string[]) {
    if (message.channel.type === 'dm') {
        return message.channel.send('This command cannot be executed from dms');
    }
    const member = message.guild!.me;
    if (!member) {
        return message.channel.send('Something went wrong try again later!');
    }
    const voteId = args[0];
    if (!voteId) {
        return message.channel.send('Please provide vote id!');
    }

    const vote = await MongoVote.findOne({
        voteId,
    });
    if (!vote) {
        return message.channel.send(`Vote \`${voteId}\` dost not exist!`);
    }

    if (vote.channelId !== message.channel.id) {
        const voteChannel = message.guild!.channels.cache.get(vote.channelId);
        if (voteChannel) {
            return message.channel.send(`You cannot voted in ${message.channel}. You should vote in ${voteChannel}!`);
        } else {
            return message.channel.send(
                `You cannot voted in ${message.channel}. You should vote in the channel where vote was created!`,
            );
        }
    }

    const canVote = userIsMentioned(message, vote.mentions);
    if (!canVote) {
        return message.channel.send('You cannot take part in this vote!');
    }

    const proposalNames = vote.proposalArray.map((p) => p.name);
    const lines = message.content.split('\n');
    const usedProposals = new Set<string>();
    const unusedProposals = new Set<string>();
    proposalNames.forEach((p) => unusedProposals.add(p));
    let hasSlash = false;
    const ballot: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
        const words = lines[i].trim().split(/ +/);
        if (!(words.length === 1 && words[0] === '/')) {
            for (const word of words) {
                if (!proposalNames.includes(word)) {
                    return message.channel.send(
                        `Unknown proposal \`${word}\`. Available proposals: \`${proposalNames.join('`, `')}\``,
                    );
                }
                if (usedProposals.has(word)) {
                    return message.channel.send(`Already used proposal \`${word}\``);
                }
                usedProposals.add(word);
                unusedProposals.delete(word);
            }
        } else {
            if (hasSlash) {
                return message.channel.send(`You cannot put more than one slash!`);
            }
            hasSlash = true;
        }
        ballot.push(words);
    }
    if (!hasSlash) {
        ballot.push(['/']);
    }
    if (unusedProposals.size) {
        ballot.push([...unusedProposals.keys()]);
    }

    const existingTally = vote.tallyArray.find((t) => t.userId === message.author.id);
    if (existingTally) {
        existingTally.ballot = ballot;
    } else {
        vote.tallyArray.push({
            userId: message.author.id,
            ballot,
        });
    }

    try {
        await vote.save();
        const lineArray = ['Approved proposals:'];
        let k = 1;

        if (ballot[0].length === 1 && ballot[0][0] === '/') {
            lineArray.push('-');
        }

        for (let i = 0; i < ballot.length; i++) {
            if (ballot[i].length === 1 && ballot[i][0] === '/') {
                lineArray.push('Rejected proposals:');
                if (i === ballot.length - 1) {
                    lineArray.push('-');
                }
            } else {
                lineArray.push(`${k}. ${ballot[i].join(', ')}`);
                k++;
            }
        }
        return message.channel.send(lineArray.join('\n'));
    } catch (error) {
        message.channel.send(`Something went wrong ${error.message}. The ballot cannot be saved`);
        reportErrorToOwner(message.client, error, 'Unable to cast vote');
    }

    // vote.mentions.roles;

    /*
        /vote cast voteId
        optionNameC
        optionNameA
        /
        optionNameB
        optionNameD optionNameE
    */

    //!vote cast id

    // const permissions = (message.channel as GuildChannel).permissionsFor(member);
    // if (!permissions || !permissions.has('EMBED_LINKS')) {
    //     return message.channel.send("I don't have permission to send embeds!");
    // }

    // if (args.length < 2) {
    //     return message.channel.send('Please provide a vote id and vote duration!');
    // }
}

function isAmongThePrefixesOf(word: string, pattern: string): boolean {
    return pattern.startsWith(word);
}

function userHasRole(member: GuildMember, role: string) {
    return member.roles.cache.has(role);
}

function userIsMentioned(message: Message, mentionObject: Mentions) {
    if (mentionObject.everyone) {
        return true;
    }
    if (mentionObject.users.some((userId) => userId == message.author.id)) {
        return true;
    }
    const member = message.member;
    const hasRole = member && mentionObject.roles.some((roleId) => userHasRole(member, roleId));
    if (hasRole) {
        return true;
    }
    return false;
}

export function initVote() {}
