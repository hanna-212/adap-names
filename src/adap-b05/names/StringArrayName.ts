import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { InvalidStateException } from "../common/InvalidStateException";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;


    constructor(delimiter: string = DEFAULT_DELIMITER) {
        //IllegalArgumentException.assertCondition(delimiter != null && delimiter.length == 1, "Delimiter must be a single character");

        this.delimiter = delimiter;
    }

    public clone(): Name {
        return Object.create(this);
    }

    public asString(delimiter: string = this.delimiter): string {
        //IllegalArgumentException.assertCondition(delimiter != null && delimiter.length == 1, "Delimiter must be a single character");

        let s: string = "";
        for (let i = 0; i < this.getNoComponents(); i++) {
            s += this.getComponent(i);
            if (i < this.getNoComponents() - 1) {
                s += delimiter;
            }
        }
        return s;
    }

    public toString(): string {
        return this.asDataString()
    }

    public asDataString(): string {
        let s: string = "";
        for (let i = 0; i < this.getNoComponents(); i++) {
            s += this.escaped(this.getComponent(i), this.delimiter);
            if (i < this.getNoComponents() - 1) {
                s += this.delimiter;
            }
        }
        return s;
    }

    public isEqual(other: Name): boolean {
        //IllegalArgumentException.assertIsNotNullOrUndefined(other, "Name must not be null or undefined");

        if (this.getNoComponents() !== other.getNoComponents() || this.delimiter !== other.getDelimiterCharacter()) {
            return false;
        }
        for (let i = 0; i < this.getNoComponents(); i++) {
            if (this.getComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }
        return true;
    }

    public getHashCode(): number {
        let hashCode: number = 0;
        const s: string = this.asDataString();
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;   
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        if (other.getDelimiterCharacter() != this.delimiter) {
            throw new Error("Delimiters do not match");
        }
        //IllegalArgumentException.assertIsNotNullOrUndefined(other, "Name must not be null or undefined");

        let newLength = this.getNoComponents() + other.getNoComponents();
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }

        //MethodFailedException.assertCondition(newLength === this.getNoComponents() , "Concat failed");
    }


    /** @methodtype helper-method */
    protected escaped(s: string, d: string): string {
        const regex = new RegExp(d, 'g');
        return s.replace(regex, ESCAPE_CHARACTER + d);
    }

    /** @methodtype helper-method */
    protected notEscaped(s: string, d: string): string {
        const regex = new RegExp(ESCAPE_CHARACTER + d, 'g');
        return s.replace(regex, d);
    }

    /** @methotype helper-method */
    protected checkMask(component: string): void {
        let isEscaped = false;

        for (const char of component) {
            if (isEscaped) {
                // After an escape character, only an escape character or delimiter is valid.
                //IllegalArgumentException.assertCondition(char == ESCAPE_CHARACTER || char == this.delimiter, "Worngly masked component");

                isEscaped = false;
            } else {
                // If not escaped, encountering an escape character toggles escape state.
                if (char == ESCAPE_CHARACTER) {
                    isEscaped = true;
                } else if (char == this.delimiter) {
                    throw new IllegalArgumentException("Wrongly masked component.");
                }
            }
        }

        // If still in an escaped state, the component is improperly masked.
        //IllegalArgumentException.assertCondition(!isEscaped, "Wrongly masked component");
    }

}