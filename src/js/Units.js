export class Units { 
    constructor() {
        this.current = this.INCHES;
    }

    get INCHES() { return 1; }
    get MM() { return 2; }
    get inStep() { return 0.05; }
    get mmStep() { return 1; }
    get inToPxMultiplier() { return 96; }
    get inToMmMultiplier() { return 25.4; }
    get mmToPxMultiplier() { return this.round((this.inToPxMultiplier / this.inToMmMultiplier), 10, true); }
    get mmToPxFloor() { return this.round((this.inToPxMultiplier / this.inToMmMultiplier), 1, false); }

    get currentAbbrv() {
        switch (this.current) {
            case this.INCHES: return "in";
            case this.MM:     return "mm";
        }
    }

    inToMm(inches) {
        return Math.round(parseFloat(inches) * this.inToMmMultiplier);
    }

    inToPx(inches) {
        return Math.floor(parseFloat(inches) * this.inToPxMultiplier);
    }

    mmToIn(mm) {
        return this.round(mm / this.inToMmMultiplier);
    }

    mmToPx(mm) {
        return Math.floor(parseInt(mm) * this.mmToPxMultiplier);
    }

    isInches() {
        return this.current === this.INCHES;
    }

    toPx(value) {
        return (this.isInches() ? this.inToPx(value) : this.mmToPx(value));
    }

    round(value, precision = 2, round = true) {
        const multiplier = 10 * precision;
        // console.log(value, multiplier, Math.floor((value + Number.EPSILON) * multiplier) / multiplier);
        return (round ? Math.round((value + Number.EPSILON) * multiplier) / multiplier : Math.floor((value + Number.EPSILON) * multiplier) / multiplier);
    }

    setCurrent(abbrv) {
        this.current = (() => {
            switch (abbrv) {
                case "in": return this.INCHES;
                case "mm": return this.MM;
            }
        })();
    }
}