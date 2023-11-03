import { CONST } from './types';

const GeomUtils = {
    IsZero: (a: number) => {
        return Math.abs (a) < CONST.Eps;
    },
    IsLower: (a: number, b: number) => {
        return b - a > CONST.Eps;
    },
    IsGreater: (a: number, b: number) => {
        return a - b > CONST.Eps;
    },
    IsLowerOrEqual: (a: number, b: number) => {
        return b - a > -CONST.Eps;
    },
    IsGreaterOrEqual: (a: number, b: number) => {
        return a - b > -CONST.Eps;
    },
    IsEqual: (a: number, b: number) => {
        return Math.abs (b - a) < CONST.Eps;
    },
    IsEqualEps: (a: number, b: number, eps: number) => {
        return Math.abs (b - a) < eps;
    },
    IsPositive: (a: number) => {
        return a > CONST.Eps;
    },
    IsNegative: (a: number) => {
        return a < -CONST.Eps;
    }
};

export default GeomUtils;