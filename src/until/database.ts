// import * as mongoose from 'mongoose'; //throws mongoose.connect is not a function
import mongoose = require('mongoose');
import { MongoGuild, MongooseGuildSchema } from './databaseSchemas';

export function connectToDB(mongooseConnectionString: string): Promise<void> {
    return new Promise((resolve, reject) => {
        mongoose.connect(mongooseConnectionString, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            });
    });
}

export function guildFind(id: string): Promise<MongooseGuildSchema | null> {
    return new Promise(async (resolve, rejects) => {
        MongoGuild.findOne({ id }, (err, data) => {
            if (err) rejects(err);
            else resolve(data);
        });
    });
}

export function getGuildsInDataBase(): Promise<MongooseGuildSchema[]> {
    return new Promise((resolve, reject) => {
        MongoGuild.find()
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}

export function removeGuildFromDataBase(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        MongoGuild.deleteMany({ id }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
