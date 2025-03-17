// export type Command = [
//   ['M', [x: number, y: number]],
//   ['L', [x: number, y: number]],
//   ['Q', [x0: number, y0: number, x: number, y: number]],
//   ['C', [x0: number, y0: number, x1: number, y1: number, x: number, y: number]],
//   ['Z', []],
// ][number];

// export type Commands = Command[];

// export function * parse(data: string): Generator<Command> {
//   const components = data.split(' ');
//   for (let i = 0; i < components.length; ++i) {
//     const c = components[i];
//     if (c === 'M' || c === 'L') {
//       yield [c, [
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       ]];
//     } else if (c === 'Q') {
//       yield [c, [
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       ]];
//     } else if (c === 'C') {
//       yield [c, [
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       ]];
//     } else if (c === 'Z') {
//       yield [c, []];
//     } else {
//       throw new Error(`Unknown command: ${c}`);
//     }
//   }
// }

// export function translate(commands: Commands, x: number, y: number): Commands {
//   return commands.map(([type, args]) => {
//     switch (type) {
//       case 'M':
//       case 'L':
//         return [type, [args[0] + x, args[1] + y]];
//       case 'Q':
//         return [type, [args[0] + x, args[1] + y, args[2] + x, args[3] + y]];
//       case 'C':
//         return [type, [args[0] + x, args[1] + y, args[2] + x, args[3] + y, args[4] + x, args[5] + y]];
//       default:
//         return [type, []];
//     }
//   });
// }

// export function stringify(commands: Commands): string {
//   return commands.flat(2).join(' ');
// }

// export function nonezero(commands: Commands): Commands {
//   return commands;
// }

// function print(commands: Commands): void {
//   console.log(...commands.flat(2));
// }

// function split(commands: Commands): Commands[] {
//   const subs: Commands[] = [];
//   let j = commands.length;
//   for (let i = commands.length - 1; i >= 0; i--) {
//     if (commands[i][0] === 'M') {
//       subs.unshift(commands.slice(i, j));
//       j = i;
//     }
//   }
//   return subs;
// }

// interface IFigmaCommand {
//   normalize(): Command;
// }

// interface Point {
//   x: number;
//   y: number;
// }

// class MoveTo implements IFigmaCommand {
//   constructor(
//     public x: number,
//     public y: number,
//   ) {

//   }

//   normalize(): Command {
//     return ['M', [this.x, this.y]];
//   }

//   round() {
//     return new MoveTo(Math.round(this.x), Math.round(this.y));
//   }
// }

// class LineTo implements IFigmaCommand {
//   constructor(
//     public x: number,
//     public y: number,
//   ) {

//   }

//   normalize(): Command {
//     return ['L', [this.x, this.y]];
//   }

//   reverse(prev: MoveTo | LineTo | CubicBézierCurve | QuadraticBézierCurve) {
//     return new LineTo(prev.x, prev.y);
//   }

//   round() {
//     return new LineTo(Math.round(this.x), Math.round(this.y));
//   }
// }

// /**
//  * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#cubic_b%C3%A9zier_curve
//  */
// class CubicBézierCurve implements IFigmaCommand {
//   constructor(
//     public x1: number,
//     public y1: number,
//     public x2: number,
//     public y2: number,
//     public x: number,
//     public y: number,
//   ) {

//   }

//   normalize(): Command {
//     return ['C', [this.x1, this.y1, this.x2, this.y2, this.x, this.y]];
//   }

//   get endPoint(): Point {
//     return {
//       x: this.x,
//       y: this.y,
//     };
//   }

//   get startControlPoint(): Point {
//     return {
//       x: this.x1,
//       y: this.y1,
//     };
//   }

//   get endControlPoint(): Point {
//     return {
//       x: this.x2,
//       y: this.y2,
//     };
//   }

//   reverse(prev: MoveTo | LineTo | CubicBézierCurve | QuadraticBézierCurve) {
//     return new CubicBézierCurve(this.x2, this.y2, this.x1, this.y1, prev.x, prev.y);
//   }

//   round() {
//     return new CubicBézierCurve(
//       Math.round(this.x1), Math.round(this.y1),
//       Math.round(this.x2), Math.round(this.y2),
//       Math.round(this.x), Math.round(this.y),
//     );
//   }
// }

// /**
//  * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#quadratic_b%C3%A9zier_curve
//  */
// class QuadraticBézierCurve implements IFigmaCommand {
//   constructor(
//     public x1: number,
//     public y1: number,
//     public x: number,
//     public y: number,
//   ) {

//   }

//   normalize(): Command {
//     return ['Q', [this.x1, this.y1, this.x, this.y]];
//   }

//   get endPoint(): Point {
//     return {
//       x: this.x,
//       y: this.y,
//     };
//   }

//   get controlPoint(): Point {
//     return {
//       x: this.x1,
//       y: this.y1,
//     };
//   }

//   reverse(prev: MoveTo | LineTo | CubicBézierCurve | QuadraticBézierCurve) {
//     return new QuadraticBézierCurve(this.x1, this.y1, prev.x, prev.y);
//   }

//   round() {
//     return new QuadraticBézierCurve(
//       Math.round(this.x1), Math.round(this.y1),
//       Math.round(this.x), Math.round(this.y),
//     );
//   }
// }

// /**
//  * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#closepath
//  */
// class ClosePath implements IFigmaCommand {
//   constructor() {

//   }

//   normalize(): Command {
//     return ['Z', []];
//   }

//   round(): ClosePath {
//     return this;
//   }
// }

// type FigmaCommand = MoveTo | LineTo | QuadraticBézierCurve | CubicBézierCurve | ClosePath;

// export function * parseFigmaVectorPathData(data: string): Generator<FigmaCommand> {
//   const components = data.split(/\s+/);
//   for (let i = 0; i < components.length; ++i) {
//     const c = components[i];
//     if (c === 'M') {
//       yield new MoveTo(
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       );
//     } else if (c === 'L') {
//       yield new LineTo(
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       );
//     } else if (c === 'Q') {
//       yield new QuadraticBézierCurve(
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       );
//     } else if (c === 'C') {
//       yield new CubicBézierCurve(
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//         parseFloat(components[++i]),
//       );
//     } else if (c === 'Z') {
//       yield new ClosePath();
//     } else {
//       throw new Error(`Unknown command: ${c}`);
//     }
//   }
// }

// type NonEdgeCommand = LineTo | QuadraticBézierCurve | CubicBézierCurve;

// class ChildCommandSequence {
//   #startCommand: MoveTo;
//   #innerCommands: NonEdgeCommand[] = [];
//   #closeCommand: ClosePath[] = [];

//   constructor(moveTo: MoveTo) {
//     this.#startCommand = moveTo;
//   }

//   push(command: NonEdgeCommand): void {
//     this.#innerCommands.push(command);
//   }

//   close(): void {
//     if (this.#closeCommand.length === 0) {
//       this.#closeCommand.push(new ClosePath());
//     } else {
//       throw 'Already closed!';
//     }
//   }

//   get isClosed() {
//     return this.#closeCommand.length === 1;
//   }

//   print() {
//     const components = [this.#startCommand, ...this.#innerCommands, ...this.#closeCommand].map((it) => {
//       return it.normalize();
//     }).flat(Infinity);
//     console.log(...components);
//   }

//   round(): ChildCommandSequence {
//     const out = new ChildCommandSequence(this.#startCommand.round());
//     this.#innerCommands.forEach((it) => out.push(it.round()));
//     if (this.isClosed) {
//       out.close();
//     }
//     return out;
//   }

//   reverse(): ChildCommandSequence {
//     const end = this.#innerCommands[this.#innerCommands.length - 1];
//     const out = new ChildCommandSequence(new MoveTo(end.x, end.y));
//     const inner: NonEdgeCommand[] = [];
//     let prev = this.#startCommand;
//     for (const next of this.#innerCommands) {
//       inner.push(next.reverse(prev));
//       prev = next;
//     }
//     inner.toReversed().forEach((it) => {
//       out.push(it);
//     });
//     if (this.isClosed) {
//       out.close();
//     }
//     return out;
//   }
// }

// function * splitFigmaCommands(commands: FigmaCommand[]): Generator<ChildCommandSequence> {
//   let i = 0;
//   while (i < commands.length) {
//     const command = commands[i];
//     if (command instanceof MoveTo) {
//       const child = new ChildCommandSequence(command);
//       while (++i < commands.length) {
//         const command = commands[i];
//         if (command instanceof MoveTo) {
//           yield child;
//           break;
//         }
//         if (command instanceof ClosePath) {
//           child.close();
//           yield child;
//           i += 1;
//           break;
//         }
//         child.push(command);
//       }
//     } else {
//       throw command;
//     }
//   }
// }

// function reverse(commands: Commands): Commands {
//   // M a b L c d Q e f g h Z
//   // M g h Q e f c d L a b Z

//   // M 0 0 L 5 5 C 10 5 10 0 20 0 Z
//   // M 20 0 C 10 0 10 5 5 5 L 0 0 Z

//   const Ps = [];

//   const isClosed = commands[commands.length - 1][0] === 'Z';
//   const clone = isClosed ? commands.slice(0, -1) : commands.slice();

//   const startXY = [];
//   const endXY = [];

//   for (let i = commands.length - 1; i >= 0; i--) {
//     const [type, args] = commands[i];
//     if (type === 'Z') {
//       continue;
//     } else if (type === 'L') {

//     }
//   }

//   return [];
// }

// // let commands = [...parseFigmaVectorPathData('M 0 0 L 500 0 L 500 500 L 0 500 L 0 0 Z M 100 100 L 400 250 L 100 400 L 100 100 Z')];
// // let commands = [...parseFigmaVectorPathData('M 0 0 L 5 5 C 10 5 10 0 20 0 Z')];
// let commands = [...parseFigmaVectorPathData('M 0 45.511112213134766 C 0 20.376020431518555 19.10251808166504 0 42.66666793823242 0 L 469.3333435058594 0 C 492.8975124359131 0 512 20.37602424621582 512 45.51111602783203 L 512 364.08892822265625 C 512 389.22404289245605 492.8974723815918 409.6000061035156 469.3333435058594 409.6000061035156 L 42.666656494140625 409.6000061035156 C 19.102506637573242 409.6000061035156 0 389.22404289245605 0 364.08892822265625 L 0 45.511112213134766 Z M 42.66666793823242 341.3333435058594 L 42.66666793823242 68.26667785644531 C 42.66666793823242 55.69913196563721 52.21792507171631 45.51111602783203 64 45.51111602783203 L 128 45.51111602783203 C 139.7820749282837 45.51111602783203 149.3333282470703 55.69913196563721 149.3333282470703 68.26667785644531 L 149.3333282470703 341.3333435058594 C 149.3333282470703 353.9008779525757 139.7820749282837 364.08892822265625 128 364.08892822265625 L 64 364.08892822265625 C 52.21792507171631 364.08892822265625 42.66666793823242 353.9009008407593 42.66666793823242 341.3333435058594 Z M 192.00001525878906 68.26667785644531 L 192.00001525878906 341.3333435058594 C 192.00001525878906 353.9009008407593 201.55127906799316 364.08892822265625 213.33334350585938 364.08892822265625 L 448.0000305175781 364.08892822265625 C 459.78209495544434 364.08892822265625 469.3333435058594 353.9009008407593 469.3333435058594 341.3333435058594 L 469.3333435058594 68.26667785644531 C 469.3333435058594 55.69913196563721 459.78209495544434 45.51111602783203 448.0000305175781 45.51111602783203 L 213.33334350585938 45.51111602783203 C 201.55125904083252 45.51111602783203 192.00001525878906 55.69913196563721 192.00001525878906 68.26667785644531 Z')];
// // commands = nonezero(commands);
// // console.log(...splitFigmaCommands(commands));
// splitFigmaCommands(commands).map((it) => it.round()).forEach((child) => {
//   child.print();
//   child.reverse().print();
// });
// // splitFigmaCommands(commands).map(reverse).forEach(print);

// // function reversePathData(pathData: Command[], options): Command[] {

// //   /**
// //    * Add closing lineto:
// //    * needed for path reversing or adding points
// //    */
// //   const addClosePathLineto = (pathData) => {
// //     let closed = pathData[pathData.length - 1].type.toLowerCase() === "z";
// //     let M = pathData[0];
// //     let [x0, y0] = [M.values[0], M.values[1]];
// //     let lastCom = closed ? pathData[pathData.length - 2] : pathData[pathData.length - 1];
// //     let [xE, yE] = [lastCom.values[lastCom.values.length - 2], lastCom.values[lastCom.values.length - 1]];

// //     if (closed && (x0 != xE || y0 != yE)) {

// //       pathData.pop();
// //       pathData.push(
// //         {
// //           type: "L",
// //           values: [x0, y0]
// //         },
// //         {
// //           type: "Z",
// //           values: []
// //         }
// //       );
// //     }
// //     return pathData;
// //   }

// //   options = {
// //     //defaults
// //     ...{
// //       arcToCubic: false,
// //       quadraticToCubic: false,
// //       toClockwise: false,
// //       returnD: false
// //     },
// //     ...options
// //   }

// //   //split sub paths
// //   let pathDataArr = splitSubpaths(pathData);

// //   // helper to rearrange control points for all command types
// //   const reverseControlPoints = (type, values) => {
// //     let controlPoints = [];
// //     let endPoints = [];
// //     if (type !== "A") {
// //       for (let p = 0; p < values.length; p += 2) {
// //         controlPoints.push([values[p], values[p + 1]]);
// //       }
// //       endPoints = controlPoints.pop();
// //       controlPoints.reverse();
// //     }
// //     // is arc
// //     else {
// //       //reverse sweep;
// //       let sweep = values[4] == 0 ? 1 : 0;
// //       controlPoints = [values[0], values[1], values[2], values[3], sweep];
// //       endPoints = [values[5], values[6]];
// //     }
// //     return { controlPoints, endPoints };
// //   };


// //   // start compiling new path data
// //   let pathDataNew: Command[] = [];

// //   pathDataArr.forEach((pathData) => {

// //     let closed =
// //       pathData[pathData.length - 1].type.toLowerCase() === "z" ? true : false;
// //     if (closed) {
// //       // add lineto closing space between Z and M
// //       pathData = addClosePathLineto(pathData);
// //       // remove Z closepath
// //       pathData.pop();
// //     }

// //     // define last point as new M if path isn't closed
// //     let valuesLast = pathData[pathData.length - 1].values;
// //     let valuesLastL = valuesLast.length;
// //     let M = closed
// //       ? pathData[0]
// //       : {
// //         type: "M",
// //         values: [valuesLast[valuesLastL - 2], valuesLast[valuesLastL - 1]]
// //       };
// //     // starting M stays the same – unless the path is not closed
// //     pathDataNew.push(M);

// //     // reverse path data command order for processing
// //     pathData.reverse();
// //     for (let i = 1; i < pathData.length; i++) {
// //       let com = pathData[i];
// //       let type = com.type;
// //       let values = com.values;
// //       let comPrev = pathData[i - 1];
// //       let typePrev = comPrev.type;
// //       let valuesPrev = comPrev.values;

// //       // get reversed control points and new end coordinates
// //       let controlPointsPrev = reverseControlPoints(typePrev, valuesPrev).controlPoints;
// //       let endPoints = reverseControlPoints(type, values).endPoints;

// //       // create new path data
// //       let newValues = [];
// //       newValues = [controlPointsPrev, endPoints].flat();
// //       pathDataNew.push({
// //         type: typePrev,
// //         values: newValues.flat()
// //       });
// //     }

// //     // add previously removed Z close path
// //     if (closed) {
// //       pathDataNew.push({
// //         type: "z",
// //         values: []
// //       });
// //     }
// //   })

// //   return pathDataNew;
// // }
