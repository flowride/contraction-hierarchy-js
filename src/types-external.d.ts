declare module 'nanoclone' {
  function clone<T>(obj: T): T;
  export default clone;
}

declare module 'pbf' {
  class Pbf {
    constructor(buffer?: ArrayBuffer);
    readVarint(): number;
    readBoolean(): boolean;
    readString(): string;
    readDouble(): number;
    readPackedDouble(arr: number[]): void;
    readFields<T>(readField: (tag: number, obj: T, pbf: Pbf) => void, obj: T, end: number): T;
    writeVarintField(tag: number, value: number): void;
    writeBooleanField(tag: number, value: boolean): void;
    writeStringField(tag: number, value: string): void;
    writeDoubleField(tag: number, value: number): void;
    writePackedDouble(tag: number, arr: number[]): void;
    writeMessage<T>(tag: number, write: (obj: T, pbf: Pbf) => void, obj: T): void;
    finish(): ArrayBuffer;
  }
  export default Pbf;
}

declare module 'geokdbush' {
  export function around(index: any, lng: number, lat: number, maxResults: number): number[];
}

declare module 'kdbush' {
  class KDBush {
    constructor(numPoints: number);
    add(x: number, y: number): void;
    finish(): void;
  }
  export default KDBush;
}
