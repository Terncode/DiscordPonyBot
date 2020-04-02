// import * as mongoose from 'mongoose'; //throws mongoose.connect is not a function
import mongoose = require('mongoose');
import { MongoGuild } from './databaseSchemas';

export async function connectToDB(mongooseConnectionString: string): Promise<void> {
    await mongoose.connect(mongooseConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
}

export async function guildFind(id: string) {
    const result = await MongoGuild.findOne({ id });
    return result;
}

export async function getGuildsInDataBase() {
    const result = await MongoGuild.find();
    return result;
}

export async function removeGuildFromDataBase(id: string) {
    await MongoGuild.deleteMany({ id });
}
