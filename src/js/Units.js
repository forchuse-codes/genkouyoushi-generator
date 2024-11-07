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
        return this.round(parseFloat(inches) * this.inToMmMultiplier, 1);
    }

    inToPx(inches, ceiling = false) {
        if (ceiling) return Math.ceil(parseFloat(inches) * this.inToPxMultiplier);
        return Math.floor(parseFloat(inches) * this.inToPxMultiplier);
    }

    mmToIn(mm) {
        return this.round(mm / this.inToMmMultiplier);
    }

    mmToPx(mm, ceiling = false) {
        if (ceiling) return Math.ceil(parseFloat(mm) * this.mmToPxMultiplier);
        return Math.floor(parseFloat(mm) * this.mmToPxMultiplier);
    }

    isInches() {
        return this.current === this.INCHES;
    }

    toPx(value, ceiling = false) {
        return (this.isInches() ? this.inToPx(value, ceiling) : this.mmToPx(value, ceiling));
    }

    round(value, precision = 2, round = true) {
        const multiplier = 10 * precision;
        if (round) return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
        return Math.floor((value + Number.EPSILON) * multiplier) / multiplier;
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