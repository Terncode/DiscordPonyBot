import { Client } from 'discord.js';
import { getBotOwner } from './util';

export async function reportErrorToOwner(client: Client, shouldBeError: any, note?: string) {

    note = note ? `${note}\n` : '';
    const user = getBotOwner(client);
    if (user) {
        const dm = await user.createDM();
        try {
            if (shouldBeError && shouldBeError.stack) dm.send(`${note}\n${shouldBeError.stack}`);
            else dm.send(`${note}${shouldBeError.toString()}`);
        } catch (error) {
            console.error(error, shouldBeError);
        }
    }
    console.error(shouldBeError);

}
