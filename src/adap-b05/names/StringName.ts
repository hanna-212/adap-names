import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { InvalidStateException } from "../common/InvalidStateException";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;
    private empty: boolean = true;

    constructor(other: string, delimiter?: string) {
        super(delimiter);
        IllegalArgumentException.assertIsNotNullOrUndefined(other, "Arguments must not be null or undefined");

        this.name = other;
        this.empty = false;
        this.noComponents = this.splitComponents(other).length;
   
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        IllegalArgumentException.assertCondition(i >= 0 && i < this.getNoComponents(), "Index out of bounds");

        let components = this.splitComponents(this.name);
        let component = components[i];
        

        return this.notEscaped(component, this.delimiter);
    }

    public setComponent(i: number, c: string) {
        IllegalArgumentException.assertCondition(i >= 0 && i < this.getNoComponents(), "Index out of bounds");
        IllegalArgumentException.assertIsNotNullOrUndefined(c, "String c must not be null or undefined");

        this.checkMask(c);

        let components = this.splitComponents(this.name);
        components[i] = c;

        this.name = components.join(this.delimiter);

        MethodFailedException.assertCondition(this.getComponent(i) == undefined || this.getComponent(i) == null || this.getComponent(i) !== c, "SetComponent failed");
    }

    public insert(i: number, c: string) {
        IllegalArgumentException.assertCondition(i >= 0 && i < this.getNoComponents(), "Index out of bounds");
        IllegalArgumentException.assertIsNotNullOrUndefined(c, "String c must not be null or undefined");

        this.checkMask(c);

        let components = this.splitComponents(this.name);
        components.splice(i, 0, c);
        this.name = components.join(this.delimiter);

        if (this.getComponent(i) !== c) {
            throw new MethodFailedException("Insert failed");
        }

        this.noComponents += 1;

        MethodFailedException.assertCondition(this.getNoComponents() === components.length, "InsertComponent failed");

        this.empty = false;

    }

    public append(c: string) {
        IllegalArgumentException.assertIsNotNullOrUndefined(c, "Argument must not be null or undefined");

        this.checkMask(c);
        
        let components = this.splitComponents(this.name);
        components.push(c);
        this.name = components.join(this.delimiter);
        this.noComponents += 1;
        this.empty = false;
        let lastComponent = this.getComponent(this.getNoComponents() - 1);
        
        MethodFailedException.assertCondition(this.getComponent(this.getNoComponents() - 1) != undefined && this.getComponent(this.getNoComponents() - 1) != null && 
        this.getComponent(this.getNoComponents() - 1) === c, "Appending component failed");
        MethodFailedException.assertCondition(this.getNoComponents() === components.length, "Append failed");
    }

    public remove(i: number) {
        IllegalArgumentException.assertCondition(i >= 0 && i < this.getNoComponents(), "Index out of bounds");

        let components = this.splitComponents(this.name);
        components.splice(i, 1);
        this.name = components.join(this.delimiter);
        this.noComponents -= 1;
        
        MethodFailedException.assertCondition(this.getNoComponents() === components.length, "Remove failed");

        if (this.getNoComponents() === 0) {
            this.empty = true;
        }
    }

    public concat(other: Name): void {
        super.concat(other);
        this.empty = false;
    }

    /** @methodtype helper-method */
    private splitComponents(s: string): string[] {
        let components: string[] = [];
        let current = "";
        let isEscaped = false;

        for (const char of s) {
            if (char === ESCAPE_CHARACTER) {
                if (isEscaped) {
                    // Double escape: add one escape character
                    current += ESCAPE_CHARACTER;
                    isEscaped = false;
                } else {
                    // Start escaping
                    isEscaped = true;
                }
            } else if (char === this.delimiter && !isEscaped) {
                // Add the current component and reset for the next one
                components.push(current);
                current = "";
            } else {
                // Regular character or escaped character
                current += char;
                isEscaped = false;
            }
        }

        // Add the final component
        components.push(current);
        return components;
    }

}