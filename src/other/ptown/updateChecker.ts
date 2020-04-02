import { EventEmitter } from 'events';
import { MessageEmbed } from 'discord.js';
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
    on(event: 'update', listener: (richEmbed: MessageEmbed, changeLog: Changelog) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
}

export class PTUpdateChecker extends EventEmitter {

    private version?: string;
    private changes?: string;
    private name: string;
    private domain: string;
    private logo: string;
    private timeout?: NodeJS.Timeout;

    constructor(name: string, domain: string, logo: string) {
        super();
        this.name = name;
        this.domain = domain.charAt(domain.length - 1) === '/' ? domain : `${domain}/`;
        this.logo = logo;
        this.init();
    }
    async init() {
        try {
            const currentVersion = await this.getCurrentScriptVersion();
            if (currentVersion) this.version = currentVersion;

            const changeLog = await this.getChangeLog(currentVersion);
            if (changeLog) this.changes = JSON.stringify(changeLog.changes);
        } catch (_) { /* ignored */ }

        this.timeout = setInterval(() => {
            this.daemon();
        }, TIME_CHECKING);
    }

    destroy() {
        if (this.timeout) clearInterval(this.timeout);
    }

    async fetchChangeLog(version: string) {
        if (version) {
            const regVersion = version.match(/[0-9]|\./g);
            version = regVersion ? regVersion.join('') : '';
        }

        const currentVersion = await this.getCurrentScriptVersion();
        if (!currentVersion) throw new Error('Unable to get script');

        const changeLog = await this.getChangeLog(currentVersion, version);
        if (!this.checkIfVersionsAreEqual(currentVersion)) {
            const currentChangeLog = await this.getChangeLog(currentVersion);
            this.shouldPush(currentVersion, currentChangeLog);
        }

        return {
            richEmbed: this.changeLogEmbed(changeLog.version, changeLog.bootstrapRevision, changeLog),
            changeLog,
        };
    }

    private async daemon() {
        await this.checkUpdate();
    }

    private async checkUpdate() {
        try {
            const version = await this.getCurrentScriptVersion();
            const changeLog = await this.getChangeLog(version);
            this.shouldPush(version, changeLog);
        } catch (error) {
            console.error(error);
            this.emit('error', error);
        }
    }

    private shouldPush(version: string, changeLog: Changelog) {
        if (!this.checkIfVersionsAreEqual(version)) {
            if (this.checkIfChangelogAreEqual(changeLog)) {
                this.pushUpdate(version, changeLog, true);
            }
            else {
                this.pushUpdate(version, changeLog, false);
            }
        }
    }


    private checkIfChangelogAreEqual(changelog: Changelog) {
        let changesString: string;
        try {
            changesString = JSON.stringify(changelog.changes);
        } catch (error) {
            this.emit('error', error);
            return false;
        }
        if (this.changes === undefined) this.changes = changesString;

        const result = this.changes === changesString;
        return result;
    }

    private checkIfVersionsAreEqual(version: string) {
        if (this.version === undefined) this.version = version;
        return this.version === version;
    }

    private pushUpdate(version: string, changeLog: Changelog, sameChangelog: boolean) {
        try {
            if (this.version === undefined) throw new Error('version is undefined');
            this.version = version;
            this.changes = JSON.stringify(changeLog.changes);
            let embed: MessageEmbed;
            if (sameChangelog) embed = this.changeLogEmbed(changeLog.version, changeLog.bootstrapRevision);
            else embed = this.changeLogEmbed(changeLog.version, changeLog.bootstrapRevision, changeLog);
            this.emit('update', embed, changeLog);
        } catch (error) {
            console.error(error);
            this.emit('error', error);
        }
    }

    private async getCurrentScriptVersion(): Promise<string> {
        const response = await axios.get(this.domain);
        let data = response.data;
        if (data.indexOf('bootstrap') === -1) throw new Error('Cannot find script!');
        data = data.slice(data.indexOf('bootstrap'));
        data = data.slice(0, data.indexOf('"'));
        return data;
    }

    private async getChangeLog(script: string, requestedVersion = ''): Promise<Changelog> {
        const response = await axios.get(`${this.domain}assets/scripts/${script}`);

        let data = response.data;
        if (data.indexOf(`version:"v${requestedVersion}`) === -1) throw new Error('Version does not exist');
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
            return changeLog;
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }


    private changeLogEmbed(version: string, bootstrapRevision: string, changelog?: Changelog) {
        const embed = new MessageEmbed();
        embed.setColor([255, 226, 94]);
        embed.setAuthor(this.name, this.logo, this.domain);

        if (changelog) {
            let description = '- ' + changelog.changes.join('\n- ')
                .replace(/<\/?code>/g, '`')
                .replace(/<\/?kbd>/g, '**')
                .replace(/<\/?em>/g, '*')
                .replace(/<\/?b>/g, '')
                .replace(/&gt;/g, '')
                .replace(/&lt;/g, '');
            embed.setDescription(description);

            if (description.length > 2000) {
                description = description.slice(0, 2000);
                const lastNewlineIndex = description.lastIndexOf('\n');
                description = lastNewlineIndex === -1 ? `${description}...` : `${description.slice(0, lastNewlineIndex)}...`;
            }
        }

        embed.setTitle(version);
        if (bootstrapRevision)
            embed.setFooter(bootstrapRevision);
        return embed;
    }
}
