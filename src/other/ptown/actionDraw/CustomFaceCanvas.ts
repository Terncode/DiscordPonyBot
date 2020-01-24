import { RightEye } from './RightEye';
import { LeftEye } from './LeftEye';
import { Mouth } from './Mouth';
import { OtherOptions } from './OtherOptions';
import { Iris, Eye, Muzzle, isEyeSleeping } from './interfaces';
const { createCanvas } = require('canvas');

export interface CustomAction {
    blush: boolean;
    sleeping: boolean;
    hearts: boolean;
    crying: number;
    muzzle: number;
    rightIris: number;
    right: number;
    left: number;
    leftIris: number;
}

export interface Action {
    blush: boolean;
    sleeping: boolean;
    crying: number;
    hearts: boolean;
    mouthType: string;
    rightEyeType: string;
    leftEyeType: string;
    leftEyeLook: string;
    rightEyeLook: string;
}

export class CustomFaceCanvas {

    private canvas: HTMLCanvasElement;

    private action: CustomAction = {
        blush: false,
        sleeping: false,
        crying: 0,
        hearts: false,
        muzzle: Muzzle.Smile,
        left: Eye.None,
        leftIris: Iris.Right,
        right: Eye.None,
        rightIris: Iris.Left,
    };

    constructor(action?: CustomAction) {
        this.canvas = createCanvas(60, 60);
        this.renderDefault();
        if (action) this.setAndRender(action);
    }

    public setAndRender(action: CustomAction) {
        Object.assign(this.action, action);
        this.render();
    }

    public renderDefault() {
        const mouth = new Mouth(this.canvas);
        mouth.drawBackground();
        mouth.draw(0);
    }

    public getData() {
        return this.canvas.toDataURL();
    }

    public render(actionOptions?: CustomAction) {
        const leftEye = new LeftEye(this.canvas);
        const rightEye = new RightEye(this.canvas);
        const mouth = new Mouth(this.canvas);
        const expressions = new OtherOptions(this.canvas);

        let action = this.action;
        if (actionOptions) action = actionOptions;

        if (actionOptions) mouth.drawBackground('#edd3ab');
        else mouth.drawBackground();

        if (this.action.blush) expressions.drawBlush();

        if (this.action.sleeping) {
            expressions.drawSleeping();
            const le: Eye = action.left;
            const re: Eye = action.right;

            if (!isEyeSleeping(le))
                action.left = Eye.Closed;

            if (!isEyeSleeping(re))
                action.right = Eye.Closed;
        }

        leftEye.draw(action.left, action.leftIris);
        rightEye.draw(action.right, action.rightIris);
        mouth.draw(action.muzzle);

        if (action.hearts) expressions.drawHearts();
        if (action.crying === 1) expressions.drawTears();
        else if (action.crying === 2) expressions.drawCrying();
    }

    public renderTemporary(action: CustomAction) {
        this.render(action);
    }

    set right(num: number) {
        this.action.right = num;
    }
    set left(num: number) {
        this.action.left = num;
    }
    set rightIris(num: number) {
        this.action.rightIris = num;
    }
    set leftIris(num: number) {
        this.action.leftIris = num;
    }
    set muzzle(num: number) {
        this.action.muzzle = num;
    }
    set blush(bool: boolean) {
        this.action.blush = bool;
    }
    set hearts(bool: boolean) {
        this.action.hearts = bool;
    }
    set sleeping(bool: boolean) {
        this.action.sleeping = bool;
    }
    set crying(num: number) {
        this.action.crying = num;
    }
}
