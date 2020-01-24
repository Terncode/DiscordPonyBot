import { DrawPixels } from './DrawPixels';
import { Muzzle } from './interfaces';

export class Mouth extends DrawPixels {

    private mouthColor = '#65420d';
    private tongueColor = '#e16200';
    private mouthInsideColor = '#721946';
    private toothColor0 = '#dddddd';
    private toothColor1 = '#ffffff';

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    public draw(muzzle: number) {

        switch (muzzle) {
            case Muzzle.Smile:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                break;
            case Muzzle.Frown:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawSad();
                break;
            case Muzzle.Neutral:
                this.drawMuzzle();
                this.drawNeutral();
                break;
            case Muzzle.Scrunch:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawT();
                break;
            case Muzzle.Blep:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                this.drawTongue();
                break;
            case Muzzle.SmileOpen:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                this.drawHappyPlus();
                break;
            case Muzzle.Flat:
                this.drawMuzzle();
                this.drawNeutralPlus();
                break;
            case Muzzle.Concerned:
                this.drawMuzzle();
                this.drawMad();
                break;
            case Muzzle.ConcernedOpen:
                this.drawMuzzle();
                this.drawMad();
                this.drawMadPlus();
                break;
            case Muzzle.SmileOpen2:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                this.drawP();
                break;
            case Muzzle.FrownOpen:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawA();
                this.drawAp();
                break;
            case Muzzle.NeutralOpen2:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawA();
                break;
            case Muzzle.ConcernedOpen2:
                this.drawMuzzle();
                this.drawMad();
                this.drawApp();
                break;
            case Muzzle.Kiss:
                this.drawMuzzle();
                this.drawDot();
                break;
            case Muzzle.SmileOpen3:
                this.drawMuzzle();
                this.drawNeutral();
                this.smilePlus();
                break;
            case Muzzle.NeutralOpen3:
                this.drawMuzzle();
                this.smilePlusPlus();
                break;
            case Muzzle.ConcernedOpen3:
                this.drawMuzzle();
                this.drawMad();
                this.drawAA();
                break;
            case Muzzle.Kiss2:
                this.drawMuzzle();
                this.drawNeutralMinus();
                break;
            case Muzzle.SmileTeeth:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                this.drawTooth();
                break;
            case Muzzle.FrownTeeth:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawMadTooth();
                break;
            case Muzzle.NeutralTeeth:
                this.drawMuzzle();
                this.drawMadToothp();
                break;
            case Muzzle.ConcernedTeeth:
                this.drawMuzzle();
                this.drawMadToothpp();
                break;
            case Muzzle.SmilePant:
                this.drawMuzzle();
                this.drawNeutralPlus();
                this.drawPP();
                break;
            case Muzzle.NeutralPant:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawHappy();
                this.drawPP();
                this.drawPPP();
                break;
            case Muzzle.Oh:
                this.drawMuzzle();
                this.drawNeutral();
                this.drawAm();
                break;
            case Muzzle.FlatBlep:
                this.drawMuzzle();
                this.drawNeutralPlus();
                this.drawTongue();
                break;
            default:
                throw new Error(`Unable to draw muzzle ${muzzle}`);
        }
    }

    private drawMuzzle() {
        this.drawPixels(8, 3, 1, 4, this.mouthColor);
        this.drawPixels(8, 3, 3, 1, this.mouthColor);
    }

    private drawNeutral() {
        this.drawPixels(11, 4, 1, 3, this.mouthColor);
    }

    private drawNeutralPlus() {
        this.drawPixels(11, 4, 1, 4, this.mouthColor);
    }

    private drawT() {
        this.drawPixels(10, 7, 3, 1, this.mouthColor);
    }

    private drawHappy() {
        this.drawPixels(10, 7, 1, 1, this.mouthColor);
    }

    private drawSad() {
        this.drawPixels(12, 7, 1, 1, this.mouthColor);
    }

    private drawTongue() {
        this.drawPixels(12, 5, 1, 2, this.tongueColor);
    }

    private drawMad() {
        this.drawPixels(11, 4, 1, 2, this.mouthColor);
        this.drawPixels(10, 6, 1, 2, this.mouthColor);
    }


    private drawHappyPlus() {
        this.drawPixels(12, 5, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 7, 1, 1, this.tongueColor);
        this.drawPixels(11, 7, 1, 1, this.mouthInsideColor);
    }

    private drawMadPlus() {
        this.drawPixels(12, 5, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 7, 1, 1, this.tongueColor);
        this.drawPixels(11, 6, 1, 2, this.mouthInsideColor);
        this.drawPixels(11, 8, 1, 1, this.mouthColor);

    }

    private drawP() {
        this.drawPixels(11, 7, 1, 1, this.mouthInsideColor);
        this.drawPixels(12, 5, 1, 3, this.mouthInsideColor);
        this.drawPixels(13, 5, 1, 1, this.mouthInsideColor);
        this.drawPixels(13, 6, 1, 2, this.tongueColor);
    }

    private drawA() {
        this.drawPixels(12, 4, 1, 3, this.mouthInsideColor);
        this.drawPixels(13, 4, 1, 1, this.mouthInsideColor);
        this.drawPixels(13, 5, 1, 2, this.tongueColor);
    }

    private drawAp() {
        this.drawPixels(12, 7, 2, 1, this.mouthColor);
    }
    private drawApp() {
        this.drawPixels(11, 8, 1, 1, this.mouthColor);
        this.drawPixels(12, 9, 1, 1, this.mouthColor);
        this.drawPixels(11, 6, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 5, 1, 4, this.mouthInsideColor);
        this.drawPixels(13, 5, 1, 2, this.mouthInsideColor);
        this.drawPixels(13, 7, 1, 2, this.tongueColor);
    }

    private drawDot() {
        this.drawPixels(11, 4, 1, 1, this.mouthColor);
    }

    private smilePlus() {
        this.drawPixels(10, 7, 1, 1, this.mouthColor);
        this.drawPixels(9, 8, 1, 1, this.mouthColor);
        this.drawPixels(10, 9, 3, 1, this.mouthColor);
        this.drawPixels(10, 8, 1, 1, this.mouthInsideColor);
        this.drawPixels(11, 7, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 5, 1, 4, this.mouthInsideColor);
        this.drawPixels(13, 7, 1, 2, this.tongueColor);
        this.drawPixels(13, 5, 1, 2, this.mouthInsideColor);
    }

    private smilePlusPlus() {
        this.drawPixels(11, 4, 1, 3, this.mouthColor);
        this.drawPixels(10, 7, 1, 2, this.mouthColor);
        this.drawPixels(10, 7, 1, 1, this.mouthColor);
        this.drawPixels(11, 9, 2, 1, this.mouthColor);
        this.drawPixels(11, 7, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 6, 1, 3, this.mouthInsideColor);
        this.drawPixels(13, 7, 1, 2, this.tongueColor);
        this.drawPixels(13, 6, 1, 1, this.mouthInsideColor);
    }

    private drawAA() {
        this.drawPixels(11, 8, 1, 1, this.mouthColor);
        this.drawPixels(12, 9, 2, 1, this.mouthColor);
        this.drawPixels(12, 9, 2, 1, this.mouthColor);

        this.drawPixels(11, 6, 1, 2, this.mouthInsideColor);
        this.drawPixels(12, 5, 2, 4, this.mouthInsideColor);
        this.drawPixels(14, 5, 1, 2, this.mouthInsideColor);
        this.drawPixels(14, 7, 1, 2, this.tongueColor);
    }

    private drawNeutralMinus() {
        this.drawPixels(11, 4, 1, 2, this.mouthColor);
    }

    private drawTooth() {
        this.drawPixels(10, 8, 1, 1, this.toothColor0);
        this.drawPixels(11, 7, 1, 1, this.toothColor0);
        this.drawPixels(11, 8, 1, 1, this.toothColor1);
        this.drawPixels(12, 5, 1, 3, this.toothColor1);
    }

    private drawMadTooth() {
        this.drawPixels(10, 7, 1, 2, this.mouthColor);
        this.drawPixels(11, 9, 1, 1, this.mouthColor);
        this.drawPixels(11, 7, 1, 2, this.toothColor0);
        this.drawPixels(12, 5, 1, 4, this.toothColor1);
    }

    private drawMadToothp() {
        this.drawPixels(11, 4, 1, 4, this.mouthColor);
        this.drawPixels(10, 8, 1, 1, this.mouthColor);
        this.drawPixels(11, 9, 1, 1, this.mouthColor);

        this.drawPixels(11, 8, 1, 1, this.toothColor0);
        this.drawPixels(12, 4, 1, 5, this.toothColor1);
    }

    private drawMadToothpp() {
        this.drawPixels(11, 4, 1, 3, this.mouthColor);
        this.drawPixels(10, 7, 1, 2, this.mouthColor);
        this.drawPixels(11, 9, 1, 1, this.mouthColor);

        this.drawPixels(11, 7, 1, 2, this.toothColor0);
        this.drawPixels(12, 4, 1, 5, this.toothColor1);
    }


    private drawPP() {
        this.drawPixels(12, 5, 1, 3, this.mouthInsideColor);
        this.drawPixels(13, 5, 1, 1, this.mouthInsideColor);
        this.drawPixels(13, 6, 2, 2, this.tongueColor);
    }

    private drawPPP() {
        this.drawPixels(11, 7, 1, 1, this.mouthInsideColor);

    }

    private drawAm() {
        this.drawPixels(12, 7, 1, 1, this.mouthColor);
        this.drawPixels(12, 5, 1, 2, this.mouthInsideColor);
    }
}
