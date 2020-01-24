import { DrawPixels } from './DrawPixels';
import { Iris, Eye } from './interfaces';

export class RightEye extends DrawPixels {

    private eyeOutLine = '#000000';
    private eyeColorInside = '#ffffff';
    private eyeColor = '#b17a00';

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }
    draw(eye: number, iris: number) {

        if (iris === Iris.Forward) iris = Iris.Left;
        if (iris === Iris.Up) iris = Iris.UpLeft;
        if (eye === Eye.None) eye = Eye.Neutral;

        switch (eye) {
            case Eye.Neutral:
                this.eye0(iris);
                break;
            case Eye.Neutral2:
                this.eye1(iris);
                break;
            case Eye.Neutral3:
                this.eye2(iris);
                break;
            case Eye.Neutral4:
                this.eye3(iris);
                break;
            case Eye.Neutral5:
                this.eye4();
                break;
            case Eye.Closed:
                this.eye5();
                break;
            case Eye.Frown:
                this.eye6(iris);
                break;
            case Eye.Frown2:
                this.eye7(iris);
                break;
            case Eye.Frown3:
                this.eye8(iris);
                break;
            case Eye.Frown4:
                this.eye9();
                break;
            case Eye.Lines:
                this.eye10();
                break;
            case Eye.ClosedHappy3:
                this.eye11();
                break;
            case Eye.ClosedHappy2:
                this.eye12();
                break;
            case Eye.ClosedHappy:
                this.eye13();
                break;
            case Eye.Sad:
                this.eye14(iris);
                break;
            case Eye.Sad2:
                this.eye15(iris);
                break;
            case Eye.Sad3:
                this.eye16(iris);
                break;
            case Eye.Sad4:
                this.eye17(iris);
                break;
            case Eye.Angry:
                this.eye18(iris);
                break;
            case Eye.Angry2:
                this.eye19(iris);
                break;
            case Eye.Peaceful:
                this.eye20();
                break;
            case Eye.Peaceful2:
                this.eye21();
                break;
            case Eye.X:
                this.eye22();
                break;
            case Eye.X2:
                this.eye23();
                break;
            default:
                throw new Error(`Unable to draw eye ${eye}`);
        }
    }

    private eye0(l: number) {
        this.drawPixels(3, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 1, 4, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(3, 4, 6, 1, this.eyeOutLine);
        this.drawPixels(4, 2, 4, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(5, 3, 3, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(5, 2, 3, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(4, 3, 3, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(4, 2, 3, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye1(l: number) {
        this.drawPixels(4, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 1, 4, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 4, 5, 1, this.eyeOutLine);
        this.drawPixels(5, 2, 3, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(5, 3, 3, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(5, 2, 3, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(5, 2, 2, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye2(l: number) {
        this.drawPixels(5, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 1, 3, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 4, 4, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 2, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(6, 3, 2, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(6, 2, 2, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(6, 2, 1, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye3(l: number) {
        this.drawPixels(6, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 1, 2, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 4, 3, 1, this.eyeOutLine);
        this.drawPixels(7, 2, 1, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(7, 3, 1, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(7, 2, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(7, 3, 1, 1, this.eyeColor);

    }

    private eye4() {
        this.drawPixels(7, 1, 1, 4, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 3, this.eyeOutLine);
    }

    private eye5() {
        this.drawPixels(7, 1, 1, 1, this.eyeOutLine);
        this.drawPixels(7, 4, 1, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 3, this.eyeOutLine);
    }

    private eye6(l: number) {
        this.drawPixels(4, 1, 1, 3, this.eyeOutLine);
        this.drawPixels(4, 1, 4, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 4, 5, 1, this.eyeOutLine);
        this.drawPixels(3, 5, 2, 1, this.eyeOutLine);
        this.drawPixels(5, 2, 3, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(5, 3, 3, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(5, 2, 3, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(5, 2, 2, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye7(l: number) {
        this.drawPixels(5, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 1, 3, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 4, 4, 1, this.eyeOutLine);
        this.drawPixels(4, 5, 2, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 2, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(6, 3, 2, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(6, 2, 2, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(6, 2, 1, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye8(l: number) {
        this.drawPixels(6, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 1, 2, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 4, 3, 1, this.eyeOutLine);
        this.drawPixels(5, 5, 2, 1, this.eyeOutLine);
        this.drawPixels(7, 2, 1, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(7, 3, 1, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(7, 2, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye9() {
        this.drawPixels(7, 1, 1, 4, this.eyeOutLine);
        this.drawPixels(6, 5, 2, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 1, this.eyeOutLine);

    }

    private eye10() {
        this.drawPixels(7, 1, 1, 4, this.eyeOutLine);
    }

    private eye11() {
        this.drawPixels(7, 1, 1, 1, this.eyeOutLine);
        this.drawPixels(7, 4, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 1, 2, this.eyeOutLine);
    }
    private eye12() {
        this.drawPixels(6, 1, 2, 1, this.eyeOutLine);
        this.drawPixels(6, 4, 2, 1, this.eyeOutLine);
        this.drawPixels(5, 2, 1, 2, this.eyeOutLine);
    }


    private eye13() {
        this.drawPixels(5, 1, 3, 1, this.eyeOutLine);
        this.drawPixels(5, 4, 3, 1, this.eyeOutLine);
        this.drawPixels(4, 2, 1, 2, this.eyeOutLine);
    }

    private eye14(l: number) {
        this.drawPixels(3, 3, 1, 1, this.eyeOutLine);
        this.drawPixels(5, 1, 3, 1, this.eyeOutLine);
        this.drawPixels(4, 2, 1, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(3, 4, 6, 1, this.eyeOutLine);
        this.drawPixels(4, 3, 1, 1, this.eyeColorInside);
        this.drawPixels(5, 2, 3, 2, this.eyeColorInside);


        if (l === Iris.Left) this.drawPixels(5, 3, 3, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(5, 2, 3, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(4, 3, 3, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(5, 2, 2, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye15(l: number) {
        this.drawPixels(4, 3, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 1, 2, 1, this.eyeOutLine);
        this.drawPixels(5, 2, 1, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 4, 5, 1, this.eyeOutLine);
        this.drawPixels(5, 3, 1, 1, this.eyeColorInside);
        this.drawPixels(6, 2, 2, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(5, 3, 3, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(6, 2, 2, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(6, 2, 1, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(5, 3, 2, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye16(l: number) {
        this.drawPixels(5, 3, 1, 1, this.eyeOutLine);
        this.drawPixels(7, 1, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 1, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 4, 4, 1, this.eyeOutLine);
        this.drawPixels(6, 3, 1, 1, this.eyeColorInside);
        this.drawPixels(7, 2, 1, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(6, 3, 2, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(7, 2, 1, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye17(l: number) {
        this.drawPixels(7, 1, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 4, 3, 1, this.eyeOutLine);
        this.drawPixels(7, 2, 1, 2, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(7, 3, 1, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(7, 2, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(7, 3, 1, 1, this.eyeColor);
    }

    private eye18(l: number) {
        this.drawPixels(5, 1, 3, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 3, this.eyeOutLine);
        this.drawPixels(5, 3, 1, 2, this.eyeOutLine);
        this.drawPixels(4, 1, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 4, 2, 1, this.eyeOutLine);
        this.drawPixels(5, 2, 3, 1, this.eyeColorInside);
        this.drawPixels(6, 3, 2, 1, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(6, 3, 2, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(5, 2, 3, 1, this.eyeColor);
        if (l === Iris.UpLeft) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(5, 2, 2, 1, this.eyeColor);
        if (l === Iris.Shocked) this.drawPixels(6, 3, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(6, 3, 2, 1, this.eyeColor);
    }

    private eye19(l: number) {
        this.drawPixels(6, 1, 2, 1, this.eyeOutLine);
        this.drawPixels(8, 2, 1, 3, this.eyeOutLine);
        this.drawPixels(6, 3, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 1, 1, 2, this.eyeOutLine);
        this.drawPixels(7, 4, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 2, 1, this.eyeColorInside);
        this.drawPixels(7, 3, 1, 1, this.eyeColorInside);

        if (l === Iris.Left) this.drawPixels(7, 3, 1, 1, this.eyeColor);
        if (l === Iris.Right) this.drawPixels(6, 2, 2, 1, this.eyeColor);
        if (l === Iris.UpRight) this.drawPixels(6, 2, 1, 1, this.eyeColor);
        if (l === Iris.Down) this.drawPixels(7, 3, 1, 1, this.eyeColor);
    }
    private eye20() {
        this.drawPixels(8, 1, 1, 4, this.eyeOutLine);
        this.drawPixels(7, 1, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(5, 4, 1, 1, this.eyeOutLine);
    }


    private eye21() {
        this.drawPixels(7, 1, 2, 3, this.eyeOutLine);
        this.drawPixels(6, 4, 1, 1, this.eyeOutLine);
    }
    private eye22() {
        this.drawPixels(7, 2, 1, 3, this.eyeOutLine);
        this.drawPixels(8, 1, 1, 3, this.eyeOutLine);
        this.drawPixels(6, 3, 1, 1, this.eyeOutLine);
        this.drawPixels(6, 1, 1, 1, this.eyeOutLine);
    }


    private eye23() {
        this.drawPixels(8, 1, 1, 2, this.eyeOutLine);
        this.drawPixels(7, 2, 1, 2, this.eyeOutLine);
        this.drawPixels(6, 1, 1, 1, this.eyeOutLine);
    }

}
