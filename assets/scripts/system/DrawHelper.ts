import { Graphics, Color } from "cc";

export class DrawHelper {
    /**
     * Draw a solid circle
     */
    static circle(g: Graphics, radius: number, fillColor: string, strokeColor?: string): void {
        g.clear();
        g.fillColor = new Color(fillColor);
        g.circle(0, 0, radius);
        g.fill();
        if (strokeColor) {
            g.strokeColor = new Color(strokeColor);
            g.lineWidth = 2;
            g.stroke();
        }
    }

    /**
     * Draw an upward-pointing equilateral triangle (for the enemy)
     */
    static triangle(g: Graphics, size: number, fillColor: string, strokeColor?: string): void {
        g.clear();
        g.fillColor = new Color(fillColor);
        const h = size * 0.866; // sqrt(3)/2
        g.moveTo(0, h * 0.667);
        g.lineTo(-size * 0.5, -h * 0.333);
        g.lineTo(size * 0.5, -h * 0.333);
        g.close();
        g.fill();
        if (strokeColor) {
            g.strokeColor = new Color(strokeColor);
            g.lineWidth = 2;
            g.stroke();
        }
    }
}
