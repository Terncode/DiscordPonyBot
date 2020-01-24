import { Schema, Document, model } from 'mongoose';

export interface MongooseGuildSchema extends Document {
    id: string;
    language: string;
    prefix: string;
    swearPrevention: boolean;
    autoConversion: boolean;
    ptUpdateChannels: string[];
    imageDeliveryChannels: string[];
}

const GuildSchema = new Schema({
    id: String,
    prefix: String,
    language: String,
    autoConversion: Boolean,
    swearPrevention: Boolean,
    ptUpdateChannels: [String],
    imageDeliveryChannels: [String],
});

export const MongoGuild = model<MongooseGuildSchema>('Guild', GuildSchema);
