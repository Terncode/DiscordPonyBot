import { EventEmitter } from 'events';
import { MessageEmbed } from 'discord.js';
import { ponyApiRandom } from './ponyapi';
import * as Jimp from 'jimp';
import { Fetch } from 'node-derpi';
const ontime = require('ontime');
const colorThief = require('color-thief-jimp');
export declare interface ImageDelivery {
    on(event: 'update', listener: (richEmbed: MessageEmbed, imageUrl: string) => void): this;
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
        const embed = new MessageEmbed();
        if (pony.derpiId) {
            const image = await Fetch.fetchImage(pony.derpiId);
            embed.setTitle(`https://derpibooru.org/images/${pony.derpiId}`);
            embed.setImage(image.representations.full);
            if (image.artistNames) embed.setDescription(`Artist: ${image.artistNames.join(', ')}`);
            embed.setFooter(`${image.height}x${image.width} - ${image.originalFormat}`);
            embed.setTimestamp(image.updated);
            await this.setEmbedColour(embed, image.representations.thumbnailSmall);
            this.emit('update', embed, image.source);
        } else {
            embed.setImage(pony.representations.full);
            embed.setFooter(`${pony.height}x${pony.width} - ${pony.originalFormat}`);
            await this.setEmbedColour(embed, pony.representations.thumbSmall);
            this.emit('update', embed, pony.sourceURL);
        }
    }

    async setEmbedColour(embed: MessageEmbed, image: any) {
        try {
            const colour = await this.stealColor(image);
            embed.setColor(colour);
        } catch (error) {
            embed.setColor('RANDOM');
        }
    }

    async stealColor(image: any): Promise<number> {
        const jimp = Jimp.read(image);
        return parseInt(colorThief.getColorHex(jimp), 16);
    }
}
