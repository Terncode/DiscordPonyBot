export class DrawPixels {

    private ctx: CanvasRenderingContext2D;
    private height = 60;
    private width = 60;
    private backgroundColor = '#e7aa4e';

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to get CanvasRendering');
        this.ctx = ctx;
    }

    public drawBackground(background = this.backgroundColor) {
        this.ctx.fillStyle = background;
        this.ctx.fillRect(0, 0, this.height, this.width);
    }

    protected drawPixels(x: number, y: number, multiplyX: number, multiplyY: number, color: string) {
        const pixSizeY = this.height / 15;
        const pixSizeX = this.width / 15;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixSizeY * y, pixSizeY * x, pixSizeY * multiplyY, pixSizeX * multiplyX);
    }
}
