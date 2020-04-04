// expression

export const enum Muzzle {
    Smile = 0,
    Frown = 1,
    Neutral = 2,
    Scrunch = 3,
    Blep = 4,
    SmileOpen = 5,
    Flat = 6,
    Concerned = 7,
    ConcernedOpen = 8,
    SmileOpen2 = 9,
    FrownOpen = 10,
    NeutralOpen2 = 11,
    ConcernedOpen2 = 12,
    Kiss = 13,
    SmileOpen3 = 14,
    NeutralOpen3 = 15,
    ConcernedOpen3 = 16,
    Kiss2 = 17,
    SmileTeeth = 18,
    FrownTeeth = 19,
    NeutralTeeth = 20,
    ConcernedTeeth = 21,
    SmilePant = 22,
    NeutralPant = 23,
    Oh = 24,
    FlatBlep = 25,
    // max: 31
}

export const CLOSED_MUZZLES = [
    Muzzle.Smile, Muzzle.Frown, Muzzle.Neutral, Muzzle.Scrunch, Muzzle.Flat, Muzzle.Concerned,
    Muzzle.Kiss, Muzzle.Kiss2,
];

export const enum Eye {
    None = 0,
    Neutral = 1,
    Neutral2 = 2,
    Neutral3 = 3,
    Neutral4 = 4,
    Neutral5 = 5,
    Closed = 6,
    Frown = 7,
    Frown2 = 8,
    Frown3 = 9,
    Frown4 = 10,
    Lines = 11,
    ClosedHappy3 = 12,
    ClosedHappy2 = 13,
    ClosedHappy = 14,
    Sad = 15,
    Sad2 = 16,
    Sad3 = 17,
    Sad4 = 18,
    Angry = 19,
    Angry2 = 20,
    Peaceful = 21,
    Peaceful2 = 22,
    X = 23,
    X2 = 24,
    // max: 31
}

export function isEyeSleeping(eye: Eye) {
    return eye === Eye.Closed ||
        (eye >= Eye.Lines && eye <= Eye.ClosedHappy) ||
        (eye >= Eye.Peaceful && eye <= Eye.X2);
}

export const enum Iris {
    Forward = 0,
    Up = 1,
    Left = 2,
    Right = 3,
    UpLeft = 4,
    UpRight = 5,
    Shocked = 6,
    Down = 7,
    // max: 15
    COUNT,
}

export const enum ExpressionExtra {
    None = 0,
    Blush = 1,
    Zzz = 2,
    Cry = 4, // overrides tears
    Tears = 8,
    Hearts = 16,
    // max: 31
}

export interface Expression {
    left: Eye;
    leftIris: Iris;
    right: Eye;
    rightIris: Iris;
    muzzle: Muzzle;
    extra: ExpressionExtra;
}


export interface PonyEntityOptions {
    hold?: number;
    extra?: boolean;
}

export interface SpiderEntityOptions {
    height: number;
    time: number;
}

export interface SignEntityOptions {
    sign: {
        r?: number;
        n?: number[];
        w?: number[];
        s?: number[];
        e?: number[];
    };
}
export interface Dict<T> {
    [key: string]: T;
}

export type EntityOptions = PonyEntityOptions | SpiderEntityOptions | SignEntityOptions | {};
