import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";
import { Exception } from "../common/Exception";
import { Node } from "./Node";
import { RootNode } from "./RootNode";
import { AssertionDispatcher, ExceptionType } from "../common/AssertionDispatcher";

export class Directory extends Node {

    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
    }

    public hasChildNode(cn: Node): boolean {
        return this.childNodes.has(cn);
    }

    public addChildNode(cn: Node): void {
        this.childNodes.add(cn);
    }

    public removeChildNode(cn: Node): void {
        this.childNodes.delete(cn); // Yikes! Should have been called remove
    }

    public findNodes(bn: string): Set<Node> {
        const resultSet: Set<Node> = new Set(super.findNodes(bn));
        for (const child of this.childNodes) {
            const childNodes = child.findNodes(bn);
            for (const node of childNodes) {
                resultSet.add(node);
            }
        }
        return resultSet;
    }
}