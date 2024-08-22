export type Point = {
    x: number;
    y: number;
};

export function rotatePoint(point: Point, angle: number): Point {
    return {
        x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
        y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    };
}

export function rotatePoints(points: Point[], angle: number): Point[] {
    return points.map((point) => rotatePoint(point, angle));
}

export function isPointInShape(point: Point, shape: Point[]): boolean {
    let wn = 0; // Winding number

    for (let i = 0; i < shape.length; i++) {
        const current = shape[i];
        const next = shape[(i + 1) % shape.length];

        if (current.y <= point.y) {
            if (next.y > point.y && isLeft(current, next, point) > 0) {
                wn++;
            }
        } else {
            if (next.y <= point.y && isLeft(current, next, point) < 0) {
                wn--;
            }
        }
    }

    return wn !== 0;
}

function isLeft(p0: Point, p1: Point, point: Point): number {
    return (p1.x - p0.x) * (point.y - p0.y) - (point.x - p0.x) * (p1.y - p0.y);
}
