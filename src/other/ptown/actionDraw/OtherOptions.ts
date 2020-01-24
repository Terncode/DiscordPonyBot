import { DrawPixels } from './DrawPixels';


export class OtherOptions extends DrawPixels {

    private heart = '#f15f9d';
    private blush = '#c90040';
    private sleep = '#232728';
    private cry = '#c1eef0';

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    public drawBlush() {
        this.drawPixels(9, 1, 1, 2, this.blush);
        this.drawPixels(9, 8, 1, 5, this.blush);
    }

    public drawSleeping() {
        this.drawPixels(1, 1, 1, 4, this.sleep);
        this.drawPixels(2, 3, 1, 1, this.sleep);
        this.drawPixels(3, 2, 1, 1, this.sleep);
        this.drawPixels(4, 1, 1, 4, this.sleep);
    }

    public drawTears() {
        this.drawPixels(8, 1, 1, 2, this.cry);
        this.drawPixels(8, 11, 1, 2, this.cry);
    }

    public drawCrying() {
        this.drawPixels(8, 1, 1, 1, this.cry);
        this.drawPixels(8, 11, 1, 2, this.cry);
        this.drawPixels(9, 0, 2, 1, this.cry);
        this.drawPixels(14, 9, 1, 1, this.cry);
        this.drawPixels(13, 10, 1, 1, this.cry);
    }

    public drawHearts() {
        this.drawPixels(0, 11, 1, 1, this.heart);
        this.drawPixels(0, 13, 1, 1, this.heart);
        this.drawPixels(1, 10, 2, 5, this.heart);
        this.drawPixels(3, 11, 1, 3, this.heart);
        this.drawPixels(4, 12, 1, 1, this.heart);
    }

}
