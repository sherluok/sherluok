// /**
//    * split compound paths into sub path data array
//    */
// function splitSubpaths(pathData) {

//   let subPathArr = [];

//   //split segments after M command
//   let subPathIndices = pathData.map((com, i) => (com.type === 'M' ? i : -1)).filter(i => i !== -1);

//   // no compound path
//   if (subPathIndices.length === 1) {
//     return [pathData]
//   }
//   subPathIndices.forEach((index, i) => {
//     subPathArr.push(pathData.slice(index, subPathIndices[i + 1]));
//   });

//   return subPathArr;
// }

// /**
//  * reverse pathdata
//  * make sure all command coordinates are absolute and
//  * shorthands are converted to long notation
//  */
// function reversePathData(pathDataInput, options) {

//   /**
//    * Add closing lineto:
//    * needed for path reversing or adding points
//    */
//   const addClosePathLineto = (pathData) => {
//     let closed = pathData[pathData.length - 1].type.toLowerCase() === "z";
//     let M = pathData[0];
//     let [x0, y0] = [M.values[0], M.values[1]];
//     let lastCom = closed ? pathData[pathData.length - 2] : pathData[pathData.length - 1];
//     let [xE, yE] = [lastCom.values[lastCom.values.length - 2], lastCom.values[lastCom.values.length - 1]];

//     if (closed && (x0 != xE || y0 != yE)) {

//       pathData.pop();
//       pathData.push(
//         {
//           type: "L",
//           values: [x0, y0]
//         },
//         {
//           type: "Z",
//           values: []
//         }
//       );
//     }
//     return pathData;
//   }

//   options = {
//     //defaults
//     ...{
//       arcToCubic: false,
//       quadraticToCubic: false,
//       toClockwise: false,
//       returnD: false
//     },
//     ...options
//   }

//   let pathData = Array.isArray(pathDataInput)
//     ? JSON.parse(JSON.stringify(pathDataInput))
//     : parsePathDataNormalized(pathDataInput, options);

//   //split sub paths
//   let pathDataArr = Array.isArray(pathDataInput) ? [pathData] : splitSubpaths(pathData);

//   // helper to rearrange control points for all command types
//   const reverseControlPoints = (type, values) => {
//     let controlPoints = [];
//     let endPoints = [];
//     if (type !== "A") {
//       for (let p = 0; p < values.length; p += 2) {
//         controlPoints.push([values[p], values[p + 1]]);
//       }
//       endPoints = controlPoints.pop();
//       controlPoints.reverse();
//     }
//     // is arc
//     else {
//       //reverse sweep;
//       let sweep = values[4] == 0 ? 1 : 0;
//       controlPoints = [values[0], values[1], values[2], values[3], sweep];
//       endPoints = [values[5], values[6]];
//     }
//     return { controlPoints, endPoints };
//   };


//   // start compiling new path data
//   let pathDataNew = [];

//   pathDataArr.forEach((pathData) => {

//     let closed =
//       pathData[pathData.length - 1].type.toLowerCase() === "z" ? true : false;
//     if (closed) {
//       // add lineto closing space between Z and M
//       pathData = addClosePathLineto(pathData);
//       // remove Z closepath
//       pathData.pop();
//     }

//     // define last point as new M if path isn't closed
//     let valuesLast = pathData[pathData.length - 1].values;
//     let valuesLastL = valuesLast.length;
//     let M = closed
//       ? pathData[0]
//       : {
//         type: "M",
//         values: [valuesLast[valuesLastL - 2], valuesLast[valuesLastL - 1]]
//       };
//     // starting M stays the same – unless the path is not closed
//     pathDataNew.push(M);

//     // reverse path data command order for processing
//     pathData.reverse();
//     for (let i = 1; i < pathData.length; i++) {
//       let com = pathData[i];
//       let type = com.type;
//       let values = com.values;
//       let comPrev = pathData[i - 1];
//       let typePrev = comPrev.type;
//       let valuesPrev = comPrev.values;

//       // get reversed control points and new end coordinates
//       let controlPointsPrev = reverseControlPoints(typePrev, valuesPrev).controlPoints;
//       let endPoints = reverseControlPoints(type, values).endPoints;

//       // create new path data
//       let newValues = [];
//       newValues = [controlPointsPrev, endPoints].flat();
//       pathDataNew.push({
//         type: typePrev,
//         values: newValues.flat()
//       });
//     }

//     // add previously removed Z close path
//     if (closed) {
//       pathDataNew.push({
//         type: "z",
//         values: []
//       });
//     }
//   })

//   return options.returnD ? pathDataToD(pathDataNew) : pathDataNew;
// }

// /**
//    * fix sub path directions
//    * pathdata must be be normalized to
//    * absolute and longhand commands
//    * toClockwise = force default direction
//    */
// export function fixPathDataDirections(pathData, toClockwise = false, sort = true) {

//   /** Get relationship between a point and a polygon using ray-casting algorithm
//   * based on timepp's answer
//   * https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon#63436180
//   */
//   const isPointInPolygon = (pt, polygon, bb, skipBB = false) => {
//     const between = (p, a, b) => (p >= a && p <= b) || (p <= a && p >= b);
//     let inside = false;

//     // not in bbox - quit || no bbox defined
//     if (!skipBB || !bb.bottom) {
//       if (bb.left > pt.x || bb.top > pt.y || bb.bottom < pt.y || bb.right < pt.x) {
//         return false;
//       }
//     }

//     for (let i = polygon.length - 1, j = 0; j < polygon.length; i = j, j++) {
//       const A = polygon[i];
//       const B = polygon[j];
//       // corner cases
//       if ((pt.x == A.x && pt.y == A.y) || (pt.x == B.x && pt.y == B.y))
//         return true;
//       if (A.y == B.y && pt.y == A.y && between(pt.x, A.x, B.x)) return true;
//       if (between(pt.y, A.y, B.y)) {
//         // if pt inside the vertical range
//         // filter out "ray pass vertex" problem by treating the line a little lower
//         if ((pt.y == A.y && B.y >= A.y) || (pt.y == B.y && A.y >= B.y)) continue;
//         // calc cross product `ptA X ptB`, pt lays on left side of AB if c > 0
//         const c = (A.x - pt.x) * (B.y - pt.y) - (B.x - pt.x) * (A.y - pt.y);
//         if (c == 0) return true;
//         if (A.y < B.y == c > 0) inside = !inside;
//       }
//     }
//     return inside ? true : false;
//   }


//   const getPathDataPoly = (pathData) => {

//     let poly = [];
//     for (let i = 0; i < pathData.length; i++) {
//       let com = pathData[i]
//       let prev = i > 0 ? pathData[i - 1] : pathData[i];
//       let { type, values } = com;
//       let p0 = { x: prev.values[prev.values.length - 2], y: prev.values[prev.values.length - 1] };
//       let p = values.length ? { x: values[values.length - 2], y: values[values.length - 1] } : ''
//       let cp1 = values.length ? { x: values[0], y: values[1] } : ''

//       switch (type) {

//         // convert to cubic to get polygon
//         case 'A':
//           if (typeof arcToBezier !== 'function') {
//             //console.log('has no arc to cubic conversion');
//             break;
//           }
//           let cubic = arcToBezier(p0, values)
//           cubic.forEach(com => {
//             let vals = com.values
//             let cp1 = { x: vals[0], y: vals[1] }
//             let cp2 = { x: vals[2], y: vals[3] }
//             let p = { x: vals[4], y: vals[5] }
//             poly.push(cp1, cp2, p)
//           })
//           break;

//         case 'C':
//           let cp2 = { x: values[2], y: values[3] }
//           poly.push(cp1, cp2)
//           break;
//         case 'Q':
//           poly.push(cp1)
//           break;
//       }

//       // M and L commands
//       if (type.toLowerCase() !== 'z') {
//         poly.push(p)
//       }
//     }

//     return poly;
//   }


//   const getPolyBBox = (vertices) => {
//     let xArr = vertices.map((pt) => {
//       return pt.x;
//     });
//     let yArr = vertices.map((pt) => {
//       return pt.y;
//     });
//     let left = Math.min(...xArr)
//     let right = Math.max(...xArr)
//     let top = Math.min(...yArr)
//     let bottom = Math.max(...yArr)
//     let bb = {
//       left: left,
//       right: right,
//       top: top,
//       bottom: bottom,
//       width: right - left,
//       height: bottom - top

//     };
//     return bb;
//   }


//   const polygonArea = (points, absolute = false) => {
//     let area = 0;
//     for (let i = 0; i < points.length; i++) {
//       const addX = points[i].x;
//       const addY = points[i === points.length - 1 ? 0 : i + 1].y;
//       const subX = points[i === points.length - 1 ? 0 : i + 1].x;
//       const subY = points[i].y;
//       area += addX * addY * 0.5 - subX * subY * 0.5;
//     }
//     if (absolute) {
//       area = Math.abs(area);
//     }
//     return area;
//   }


//   pathData = JSON.parse(JSON.stringify(pathData));

//   // split compound paths
//   let pathDataArr = splitSubpaths(pathData);
//   let polys = []

//   pathDataArr.forEach((pathData, i) => {
//     let vertices = getPathDataPoly(pathData)
//     let area = polygonArea(vertices)
//     let isClockwise = area >= 0
//     polys.push({ pts: vertices, bb: getPolyBBox(vertices), cw: isClockwise, index: i, inter: 0, includes: [], includedIn: [] })
//   })

//   // check poly intersections
//   for (let i = 0; i < polys.length; i++) {
//     let prev = polys[i]
//     let bb0 = prev.bb

//     for (let j = 0; j < polys.length; j++) {

//       let poly = polys[j]
//       let bb = poly.bb

//       // skip if the same poly or parent
//       if (i === j || poly.includes.includes(i)) continue

//       // if mid point is in previous polygon
//       let ptMid = { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 }
//       let inPoly = isPointInPolygon(ptMid, prev.pts, bb0)

//       if (inPoly) {
//         polys[j].inter += 1
//         poly.includedIn.push(i)
//         prev.includes.push(j)
//       }
//     }
//   }


//   // reverse paths
//   for (let i = 0; i < polys.length; i++) {

//     let poly = polys[i]
//     let { cw, includedIn, includes } = poly

//     // outer path direction to counter clockwise
//     if (!includedIn.length && cw && !toClockwise
//       || !includedIn.length && !cw && toClockwise
//     ) {
//       pathDataArr[i] = reversePathData(pathDataArr[i]);
//       polys[i].cw = polys[i].cw ? false : true
//       cw = polys[i].cw
//     }

//     // reverse inner sub paths
//     for (let j = 0; j < includes.length; j++) {
//       let ind = includes[j];
//       let child = polys[ind];

//       if (child.cw === cw) {
//         pathDataArr[ind] = reversePathData(pathDataArr[ind]);
//         polys[ind].cw = polys[ind].cw ? false : true
//       }

//     }
//   }

//   // sort path data array by position
//   if (sort) {
//     polys.sort((a, b) => a.bb.top - b.bb.top || a.bb.width - b.bb.width || a.bb.left - b.bb.left);
//     pathDataArr = polys.map(poly => { return pathDataArr[poly.index] })
//   }

//   return pathDataArr;
// }