export interface Vote {
    voteId: string;
    endDate: string; // ISO Date
    votingSystem: 'approval' | 'instant-runoff' | 'first-past-the-post';
    proposalArray: Proposal[];
    tallyArray: Tally[];
    mentions: Mentions;
    channelId: string;
    description: string;
}
export interface Proposal {
    name: string;
    description: string;
}
export interface Tally {
    userId: string;
    ballot: string[][]; // vote of a user that has voted
}

export interface Mentions {
    everyone: boolean;
    users: string[];
    roles: string[];
    members: string[];
}

export interface DiscordMentions extends Mentions {
    crosspostedChannels: string[];
    channels: string[];
}
