import { EventEmitter } from 'events';
import { RichEmbed } from 'discord.js';
import { MINUTE } from '../../until/constants';
import axios from 'axios';
const safeEval = require('safe-eval');

const TIME_CHECKING = MINUTE * 1;

interface Changelog {
    version: string;
    changes: string[];
    bootstrapRevision: string;
}

export declare interface PTUpdateChecker {
    on(event: 'update', listener: (richEmbed: RichEmbed, changeLog: Changelog) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
}

export class PTUpdateChecker extends EventEmitter {

    private version?: string;
    private name: string;
    private domain: string;
    private logo: string;

    constructor(name: string, domain: string, logo: string) {
        super();
        this.name = name;
        this.domain = domain.charAt(domain.length - 1) === '/' ? domain : `${domain}/`;
        this.logo = logo;
        this.daemon();
    }

    async fetchChangeLog(version: string): Promise<{ richEmbed: RichEmbed, changeLog: Changelog }> {
        return new Promise(async (resolve, rejects) => {
            if (version) {
                const regVersion = version.match(/[0-9]|\./g);
                version = regVersion ? regVersion.join('') : '';
            }
            try {
                const currentVersion = await this.getCurrentScriptVersion();
                if (!currentVersion) throw new Error('Unable to get script');

                const changeLog = await this.getChangeLog(currentVersion, version);
                if (!this.checkIfVersionsAreEqual(currentVersion)) {
                    if (!version) await this.pushUpdate(currentVersion, changeLog);
                    else await this.pushUpdate(currentVersion);
                }

                resolve({
                    richEmbed: await this.changeLogEmbed(changeLog, false),
                    changeLog,
                });
            } catch (error) {
                rejects(error);
            }
        });
    }

    private async daemon() {
        await this.checkUpdate();
        setTimeout(() => {
            this.daemon();
        }, TIME_CHECKING);
    }

    private checkUpdate() {
        return new Promise(async (resolve) => {
            try {
                const version = await this.getCurrentScriptVersion();
                if (!this.checkIfVersionsAreEqual(version)) await this.pushUpdate(version);

            } catch (error) {
                this.emit('error', error);
            } finally {
                resolve();
            }

        });
    }

    private checkIfVersionsAreEqual(version: string) {
        if (this.version === undefined) this.version = version;
        return this.version === version;
    }

    private pushUpdate(version: string, changeLog?: Changelog): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                if (this.version === undefined) throw new Error('version is undefined');
                this.version = version;
                if (!changeLog) changeLog = await this.getChangeLog(this.version);
                const embed = this.changeLogEmbed(changeLog);
                this.emit('update', embed, changeLog);
            } catch (error) {
                this.emit('error', error);
            } finally {
                resolve();
            }
        });
    }

    private getCurrentScriptVersion(): Promise<string> {
        return new Promise((resolve, reject) => {
            axios.get(this.domain)
                .then((res: any) => {
                    let data = res.data;
                    if (data.indexOf('bootstrap') === -1) reject(new Error('Cannot find script!'));
                    data = data.slice(data.indexOf('bootstrap'));
                    data = data.slice(0, data.indexOf('"'));
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    private getChangeLog(script: string, requestedVersion = ''): Promise<Changelog> {
        return new Promise((resolve, reject) => {
            console.log(`\n\n\n ${this.domain}assets/scripts/${script} \n\n\n`);
            axios.get(`${this.domain}assets/scripts/${script}`)
                .then((res: any) => {
                    let data = res.data;
                    if (data.indexOf(`version:"v${requestedVersion}`) === -1) return reject(new Error('Version does not exist'));
                    data = data.slice(data.indexOf(`version:"v${requestedVersion}`));
                    data = data.slice(9);
                    data = data.slice(0, data.indexOf(`version:"v${requestedVersion}`));
                    const version = data.slice(0, data.indexOf('"'));
                    const arrayString = data.slice(data.indexOf('['), data.indexOf(']') + 1);

                    try {
                        const changes: string[] = safeEval(arrayString);
                        const changeLog: Changelog = {
                            version,
                            changes,
                            bootstrapRevision: script,
                        };
                        resolve(changeLog);
                    } catch (err) {
                        this.emit('error', err);
                        reject(err);
                    }
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    private changeLogEmbed(changelog: Changelog, bootstrapRevision = true) {
        const embed = new RichEmbed();
        embed.setColor([255, 226, 94]);
        embed.setTitle('Changelog');
        embed.setAuthor(this.name, this.logo, this.domain);

        let description = '- ' + changelog.changes.join('\n- ')
            .replace(/<\/?code>/g, '`')
            .replace(/<\/?kbd>/g, '**')
            .replace(/<\/?em>/g, '*')
            .replace(/<\/?b>/g, '')
            .replace(/&gt;/g, '')
            .replace(/&lt;/g, '');

        if (description.length > 2000) {
            description = description.slice(0, 2000);
            const lastNewlineIndex = description.lastIndexOf('\n');
            description = lastNewlineIndex === -1 ? `${description}...` : `${description.slice(0, lastNewlineIndex)}...`;
        }

        embed.setTitle(changelog.version);
        embed.setDescription(description);
        if (bootstrapRevision)
            embed.setFooter(changelog.bootstrapRevision);
        return embed;
    }
}
