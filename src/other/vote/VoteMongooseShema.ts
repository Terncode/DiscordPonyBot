import { Schema, Document, model } from 'mongoose';
import { Vote } from './voteInterfaces';

export interface MongooseVoteSchema extends Document, Vote {}

const VoteSchema = new Schema(
    {
        voteId: String,
        endDate: String,
        votingSystem: String,
        channelId: String,
        description: String,
        proposalArray: [
            {
                name: String,
                description: String,
            },
        ],
        tallyArray: [
            {
                userId: String,
                ballot: [[String]],
            },
        ],
        mentions: {
            everyone: Boolean,
            users: [String],
            roles: [String],
            members: [String],
        },
    },
    {
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeout: 1000,
        },
    },
);

export const MongoVote = model<MongooseVoteSchema>('Vote', VoteSchema);
