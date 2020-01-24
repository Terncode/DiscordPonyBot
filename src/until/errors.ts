import { Client } from 'discord.js';
import { getBotOwner } from './util';

export function reportErrorToOwner(client: Client, shouldBeError: any, note?: string) {
    return new Promise(resolve => {
        note = note ? `${note}\n` : '';
        const user = getBotOwner(client);
        if (user) {
            user.createDM()
                .then(c => {
                    if (shouldBeError && shouldBeError.stack) {
                        c.send(`${note}${shouldBeError.stack}`);
                    } else
                        c.send(`${note}${shouldBeError.toString()}`);
                    resolve();
                })
                .catch(err => { console.error(err, shouldBeError); });
        }
        console.error(shouldBeError);
    });
}
