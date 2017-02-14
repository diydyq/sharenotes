import { add } from './demo-webpack/math';
import * as library from "./demo-webpack/library";

console.info('example: ', library);
add(1, 2);
library.reexportedMultiply(1, 2);
