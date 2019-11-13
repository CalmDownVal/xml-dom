import { Document, Node } from '@calmdownval/mini-dom';

export declare function parse(str: string): Document;
export declare function parseStream(readable: ReadableStream): Promise<Document>;
export declare function stringify(node: Node): string;
