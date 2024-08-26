// some hacky typescript declarations for polyclip-ts
// https://github.com/luizbarboza/polyclip-ts/issues/14
declare module 'polyclip-ts' {
    export type Ring = [number, number][];
    export type Poly = Ring[];
    export type MultiPoly = Poly[];
    export type Geom = Poly | MultiPoly;
    export function intersection(a: Geom, b: Geom): Geom[];
}
