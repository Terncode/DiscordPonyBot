import { EventEmitter } from 'events';
import { RichEmbed } from 'discord.js';
import { ponyApiRandom } from './ponyapi';
import * as Jimp from 'jimp';
import { Fetch } from 'node-derpi';
const ontime = require('ontime');
const colorThief = require('color-thief-jimp');

export declare interface ImageDelivery {
    on(event: 'update', listener: (richEmbed: RichEmbed, imageUrl: string) => void): this;
}

export class ImageDelivery extends EventEmitter {

    constructor() {
        super();
        ontime({
            cycle: ['06:00:00', '18:00:00'],
        }, (ot: any) => {
            this.doThing();
            ot.done();
            return;
        });
    }

    async doThing() {
        const pony = await ponyApiRandom(['cute']);
        const embed = new RichEmbed();
        if (pony.derpiId) {
            const image = await Fetch.fetchImage(pony.derpiId);
            embed.setTitle(`https://derpibooru.org/images/${pony.derpiId}`);
            embed.setImage(image.representations.full);

            if (image.artistName)
                embed.setDescription(`Artist: ${image.artistName}`);
            embed.setFooter(`${image.height}x${image.width} - ${image.originalFormat}`);
            embed.setTimestamp(image.updated);

            await this.stealColor(image.representations.thumbnailSmall)
                .then(color => {
                    embed.setColor(color);
                }).catch((err) => {
                    embed.setColor('RANDOM');
                    console.error(err);
                });
            this.emit('update', embed, image.source);
        } else {
            embed.setImage(pony.representations.full);

            embed.setFooter(`${pony.height}x${pony.width} - ${pony.originalFormat}`);
            await this.stealColor(pony.representations.thumbSmall)
                .then(color => {
                    embed.setColor(color);
                }).catch((err) => {
                    embed.setColor('RANDOM');
                    console.error(err);
                });
            this.emit('update', embed, pony.sourceURL);
        }
    }

    stealColor(image: any): Promise<number> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            Jimp.read(image, (err: Error, image: any) => {
                if (err) return reject(err);

                try {
                    const color = parseInt(colorThief.getColorHex(image), 16);
                    return resolve(color);
                } catch (err) {
                    return reject(err);
                }
            });
        });
    }
}
