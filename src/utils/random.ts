import { Random } from "roughjs/bin/math";

let random = new Random(Date.now());

export const randomInteger = () => Math.floor(random.next() * 2 ** 31);
