export interface Language {
    fullName: string;
    iso: string;
    official: boolean;
    notHundredProcent: string;
    timeFormatting: string;
    notWorkInDm: string;
    author: string;
    pt: PT;
    logs: Logs;
    urbanDictionary: UrbanDictionary;
    derpibooru: Derpibooru;
    dictionary: Dictionary;
    help: Help;
    stats: Stats;
    miscellaneous: Miscellaneous;
    translate: Translate;
    date: Date;
    guildAdmin: GuildAdmin;
    disabledCommand: string;
    jokesFacts: {
        noJokes: string;
        jokes: {
            [key: string]: string[];
        }
        noFact: string;
        facts: {
            [key: string]: string[];
        },
    };
}

interface Miscellaneous {
    ping: {
        network: string;
        server: string;
        api: string;
    };
    boops: string;
    hugs: string;
    kisses: string;
    userNotFound: string;
    ambiguous: string;
    nothingFound: string;
    commands: MiscellaneousCommands;
}

interface Date {
    days: string;
    day: string;
    month: string;
    months: string;
    years: string;
    year: string;
    hour: string;
    hours: string;
    minute: string;
    minutes: string;
    seconds: string;
    second: string;
}

interface Stats {

    memberJoinedGuild: string;
    roles: string;
    guildArgs: string[];
    statsCommands: StatsCommands;
    createdUserAccount: string;
    bot: {
        inviteLink: string;
        status: string;
        inviteLinkClick: string;
        channels: string;
        users: string;
        guild: string;
        botOwner: string;
        version: string;
    };
    guild: {
        voiceChannel: string;
        guildCreated: string;
        rolesHoisted: string;
        textChannel: string;
        channels: string;
        members: string;
        humans: string;
        bots: string;
        region: string;
        roles: string;
        rolesNotHoisted: string;
        emojis: string;
        emojisAnimated: string
        emojisNotAnimated: string;
    };
    presence: {
        presence: string;
        game: {
            applicationID: string;
            timeStart: string;
            details: string;
            timeEnd: string;
            name: string;
            url: string;
            type: {
                customStatus: string;
                listenings: string;
                steaming: string;
                watching: string;
                playing: string;
            }
        };
        status: {
            offline: string;
            status: string;
            online: string;
            idle: string;
            dnd: string;
        }
    };
}

interface Logs {
    hasBeenInGuild: string;
    hasBeenKicked: string;
    hasBeenBanned: string;
    hasBeenUnbanned: string;
    accountAge: string;
    joined: string;
    reason: string;
    info: string;
    left: string;
}

interface Help {
    prefix: string;
    urbanDictionary: string;
    derpibooru: string;
    dictionary: string;
    translate: string;
    title: string;
    help: string;
    notAdminHelp: string;
    hugs: string;
    joke: string;
    fact: string;
    boop: string;
    adminHelp: string;
    guildAdminHelp: {
        prefix: string;
        language: string;
        kick: string;
        ban: string;
        purge: string;
        ptUpdates: string;
        ponyImages: string;
        swearProtection: string;
        autoUnitConversion: string;
    };
    commands: {
        helpCommands: HelpCommands;
        adminHelp: HelpCommands;
        AliasesCommands: AliasesCommands;
    };
}

interface PT {
    randomFace: string;
    collected: string;
    rolled: string;
    toys: string;
    missingPermissionAttachFiles: string;
    commands: PTCommands;
}

export interface UrbanDictionary {
    notAllowedInUnknownChannel: string;
    notAllowedInSFW: string;
    notAllowedInDM: string;
    definition: string;
    example: string;
    source: string;
    error: string;
    command: UrbanDictionaryCommands;
}

export interface Derpibooru {
    missingPermissionEmbedLinks: string;
    somethingWentWrong: string;
    derpibooruImage: string;
    unknownArtist: string;
    description: string;
    moreTabs: string;
    noResult: string;
    uploader: string;
    source: string;
    artist: string;
    score: string;
    tags: string;
    commands: DerpibooruCommands;
}

export interface Dictionary {
    noResult: string;
    missingPermissionEmbedLinks: string;
    commands: DictionaryCommands;
}
export interface Translate {
    nothingToTranslate: string;
    somethingWentWrong: string;
    commands: TranslateCommands;
}

export interface MiscellaneousCommands {
    hug: string[];
    boop: string[];
    kiss: string[];
    ping: string[];
    jokes: string[];
    facts: string[];
}

export interface PTCommands {
    command: string[];
    roll: string[];
    candy: string[];
    eggs: string[];
    gifts: string[];
    cookies: string[];
    clover: string[];
    toys: string[];
    randomFace: string[];
    randomAction: string[];
    changeLog: string[];
}

export interface GuildAdmin {
    botDoesNotHavePermissionManageChannels: string;
    botDoesNotHavePermissionKickMembers: string;
    botDoesNotHavePermissionBanMembers: string;
    botDoesNotHavePermissionManageMessages: string;
    youHaveBeenKicked: string;
    youHaveBeenBanned: string;
    noPermissionManageChannels: string;
    noPermissionManageMessage: string;
    noPermissionManageGuild: string;
    prefixLongerThanFiveCharacters: string;
    guildLanguageHasBeenSwitched: string;
    unsubscribedSuccessfully: string;
    subscribedSuccessfully: string;
    languageCommandList: string;
    availableLanguages: string;
    youAreNoGuildAdmin: string;
    memberHasBeenRemoved: string;
    memberHasBeenBaned: string;
    mentionMember: string;
    noPermissionKickMembers: string;
    noPermissionBanMembers: string;
    cannotPerformActionOnUser: string;
    ponyImagesInfo: string;
    ponyTownUpdatesInfo: string;
    swearPreventionInfo: string;
    autoUnitConversionInfo: string;
    alreadySubscribed: string;
    newGuildLanguage: string;
    incorrectUse: string;
    notSubscribed: string;
    prefixChanged: string;
    specifyPrefix: string;
    ponyImages: string;
    unknownError: string;
    sameLanguage: string;
    unsubscribe: string[];
    subscribe: string[];
    updatesPT: string;
    featureEnabled: string;
    featureDisabled: string;
    featureAlreadyEnabled: string;
    featureAlreadyDisabled: string;
    autoConversion: string;
    swearProtection: string;

    true: string[];
    false: string[];
    commands: GuildAdminCommands;
}

export interface GuildAdminCommands {
    changePrefix: string[];
    changeLanguage: string[];
    swearPrevention: string[];
    autoConversion: string[];
    subscribeToPTUpdates: string[];
    subscribeToPonyImages: string[];
    kick: string[];
    ban: string[];
    purge: string[];
}

export declare type TranslateCommands = string[];
export declare type StatsCommands = string[];
export declare type DerpibooruCommands = string[];
export declare type UrbanDictionaryCommands = string[];
export declare type DictionaryCommands = string[];
export declare type HelpCommands = string[];
export declare type AdminHelpCommands = string[];
export declare type AliasesCommands = string[];
