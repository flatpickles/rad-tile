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

// Generated code from here on down...

export function polygonArea(polygon: number[][]): number {
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i][0] * polygon[j][1];
        area -= polygon[j][0] * polygon[i][1];
    }
    return area / 2;
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

export function isLineIntersectingShape(
    lineStart: Point,
    lineEnd: Point,
    shape: Point[],
): boolean {
    const startInside = isPointInShape(lineStart, shape);
    const endInside = isPointInShape(lineEnd, shape);

    // Check if the line starts or ends at a vertex of the shape
    const startAtVertex = shape.some((vertex) =>
        pointsEqual(lineStart, vertex),
    );
    const endAtVertex = shape.some((vertex) => pointsEqual(lineEnd, vertex));

    // If both points are at vertices, it's not intersecting
    if (startAtVertex && endAtVertex) {
        return false;
    }

    // If both points are inside, it's intersecting
    if (startInside && endInside) {
        return true;
    }

    // If it starts at a vertex and ends inside (or vice versa), it's intersecting
    if ((startAtVertex && endInside) || (endAtVertex && startInside)) {
        return true;
    }

    // Check if the line intersects any edge of the shape
    for (let i = 0; i < shape.length; i++) {
        const shapeStart = shape[i];
        const shapeEnd = shape[(i + 1) % shape.length];

        const intersection = lineIntersection(
            lineStart,
            lineEnd,
            shapeStart,
            shapeEnd,
        );
        if (
            intersection &&
            isPointOnLineSegment(intersection, lineStart, lineEnd) &&
            isPointOnLineSegment(intersection, shapeStart, shapeEnd)
        ) {
            // Exclude cases where the line only touches a vertex at the start or end
            if (
                !pointsEqual(intersection, lineStart) &&
                !pointsEqual(intersection, lineEnd)
            ) {
                return true;
            }
        }
    }

    return false;
}

function lineIntersection(
    a1: Point,
    a2: Point,
    b1: Point,
    b2: Point,
): Point | null {
    const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
    if (det === 0) return null; // parallel lines

    const t =
        ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / det;
    const u =
        -((a1.x - a2.x) * (a1.y - b1.y) - (a1.y - a2.y) * (a1.x - b1.x)) / det;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: a1.x + t * (a2.x - a1.x),
            y: a1.y + t * (a2.y - a1.y),
        };
    }

    return null;
}

function isPointOnLineSegment(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
): boolean {
    const d1 = distance(point, lineStart);
    const d2 = distance(point, lineEnd);
    const lineLength = distance(lineStart, lineEnd);
    const buffer = 0.000001; // To account for floating-point precision issues
    return Math.abs(d1 + d2 - lineLength) < buffer;
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function pointsEqual(p1: Point, p2: Point): boolean {
    const epsilon = 0.000001; // Small value to account for floating-point imprecision
    return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
}
