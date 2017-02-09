import { add } from './webpack/math';
import * as library from "./webpack/library";

console.info('example: ', library);
add(1, 2);
library.reexportedMultiply(1, 2);
