import { Language } from '../language/langTypes';
import moment from 'moment';

export function momentFormat(inp: string | number | void | moment.Moment | Date | moment.MomentInputObject, language: Language, duration = false) {
    let time = moment(inp).format(language.timeFormatting);
    if (duration) time = `${time} (${getAge(moment(inp).toDate(), language)})`;
    return time;
}

export function getAge(dateDate: Date, language: Language) {
    const { date } = language;

    const today = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    const differenceMs = Math.abs(today.getTime() - dateDate.getTime());
    let days = Math.round(differenceMs / oneDay);

    const yearDays = 365.2425;

    let dayText: string;
    let years: number;
    if (days > 365) {
        years = Math.floor(days / yearDays);
        days = Math.floor(days - yearDays * years);

        let yearText;

        if (years === 1) yearText = date.year;
        else yearText = date.years;

        if (days === 1) dayText = language.date.day;
        else dayText = language.date.days;

        return `${years} ${yearText}, ${days} ${dayText}`;
    }

    if (days === 1) dayText = language.date.day;
    else dayText = language.date.days;
    return `${days} ${dayText}`;
}
