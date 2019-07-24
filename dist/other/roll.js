"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
function roll(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (p !== 'roll' && p !== 'rand' && p !== 'random' &&
        !p.startsWith('roll ') && !p.startsWith('rand ') && !p.startsWith('random '))
        return false;
    let language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].roll : DataBase_1.DataBase.getLang()['en'].roll;
    let string = p.slice(p.indexOf(' ')).split('-');
    string[0] = string[0].trim();
    if (string[0] === "🍎") {
        message.channel.send(`:game_die: ${language.rolled} 🍎 ${language.of} 100`).catch(() => { });
        message.react("🍎");
        return true;
    }
    let number = [];
    number[0] = parseInt(string[0]);
    number[1] = parseInt(string[1]);
    if (isNaN(number[0])) {
        return actualRoll(language, message);
    }
    else {
        if (number[0] == 0)
            number[0] = 1;
        if (number[0] > 1000000)
            number[0] = 1000000;
        if (isNaN(number[1])) {
            return actualRoll(language, message, number[0]);
        }
        else {
            if (number[1] > 1000000)
                number[0] = 1000000;
            if (number[0] > number[1])
                return actualRoll(language, message, number[0], number[0]);
            else
                return actualRoll(language, message, number[1], number[0]);
        }
    }
}
exports.roll = roll;
function actualRoll(language, message, max = 100, min = 1) {
    let oneNumber = true;
    if (min === 1)
        oneNumber = false;
    const roled = Math.floor((Math.random() * ((max - min) + 1)) + min);
    if (oneNumber) {
        message.channel.send(`:game_die: ${language.rolled}  ${roled} ${language.of} ${min}-${max}`).catch(() => { });
    }
    else {
        message.channel.send(`:game_die: ${language.rolled}  ${roled} ${language.of} ${max}`).catch(() => { });
    }
    message.react("🎲");
    return true;
}
//# sourceMappingURL=roll.js.map