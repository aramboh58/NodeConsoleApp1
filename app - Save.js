
// strict mode is invoked to avoid the inadvertant use of undeclared variables.
//
'use strict';

// ePipeSymbolUTF16 enumeration is for the non-alphabet characters in the first column of the input file.
//
const ePipeSymbolUTF16 = Object.freeze({
    RightT: 9568,
    LeftT: 9571,
    BottomT: 9574,
    TopT: 9577,
    BottomRightVertex: 9565,
    TopRightVertex: 9559,
    BottomLeftVertex: 9562,
    TopLeftVertex: 9556,
    Horizontal: 9552,
    Vertical: 9553,
    Asterisk: 42,
});

// eRouteDirections enumeration is for all the possible connector adjacencies of the pipe connectors,
// source(*) or sinks(alpha letters)
//
const eRouteDirections = Object.freeze({
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
});

// Will contain all of the sinks that are routed-to from the source.  Sinks will
// be stored as letter-letter key-value pairs in dictionary form.
//
var routedSinks = new Object();

// We set this up publicly for downstream tests for alpha characters
let regex = /^[a-zA-Z]+$/;

// This function will take the read-in input buffer and convert it into a 1-D
// array of strings.
//
function splitLines(str) {
    str = str.toString();
    str = str.split(/\r?\n/);
    return str;
}

var XCoordMax, XCoordMin, YCoordMax, YCoordMin;
var routeMatrix;

let filePath = "c:\\";

function FindAllSinksFromSource(filePath) {

    var resultString = "";

    try {
        // include the 'fs' file system module from Node JS.
        //
        const fs = require('fs');

        fs.readFile((filePath +'coding_qual_input.txt'), (err, inputD) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error('File not found:', err.path);
                } else {
                    console.error('Error reading file:', err);
                }
                throw err;
            }
            console.log(inputD.toString());

            // Test the 'splitLines' function with a multiline string.
            console.log('Original string:');
            console.log(inputD);
            console.log(splitLines(inputD));

            const inputArray = splitLines(inputD);

            var routeObjectsArray = [];

            for (let i = 0; i < inputArray.length; i++) {
                let inputRouteMapElementArray = inputArray[i].split(' ');
                if (inputRouteMapElementArray.length == 3) {
                    routeObjectsArray[i] = {
                        InputChar: inputRouteMapElementArray[0],
                        Utf16Code: inputRouteMapElementArray[0].charCodeAt(0),
                        XCoord: parseInt(inputRouteMapElementArray[1]),
                        YCoord: parseInt(inputRouteMapElementArray[2]),
                        Connectors: [...new Array(eRouteDirections.Left + 1)].map(() => ({ Connector: false, Connected: false, Visited: false })),
                    }
                }
                else {
                    routeObjectsArray[i] = nothing;
                }
            }

            //for (let i = 0; i < routeObjectsArray.length; i++) {
            //    let myJSON = JSON.stringify(routeObjectsArray[i]);

            //    // Display output
            //    console.log(myJSON);
            //}

            XCoordMax = Math.max(...routeObjectsArray.map(o => o.XCoord));
            console.log('XCoordMax=' + XCoordMax.toString());

            XCoordMin = Math.min(...routeObjectsArray.map(o => o.XCoord));
            console.log('XCoordMin=' + XCoordMin.toString());

            YCoordMax = Math.max(...routeObjectsArray.map(o => o.YCoord));
            console.log('YCoordMax=' + YCoordMax.toString());

            YCoordMin = Math.min(...routeObjectsArray.map(o => o.YCoord));
            console.log('YCoordMin=' + YCoordMin.toString());

            let rows = XCoordMax + 1;
            let cols = YCoordMax + 1;
            let initialValue = undefined;

            routeMatrix = Array.from({ length: rows }, () => Array(cols).fill(initialValue));

            for (let i = 0; i < routeObjectsArray.length; i++) {
                InitializeCellConnectors(routeObjectsArray[i]);
                routeMatrix[routeObjectsArray[i].XCoord][routeObjectsArray[i].YCoord] = routeObjectsArray[i];
            }

            for (let i = 0; i < routeMatrix.length; i++) {
                for (let j = 0; j < routeMatrix[i].length; j++) {
                    let myJSON = JSON.stringify(routeMatrix[i][j]);

                    // Display output
                    console.log(myJSON);
                }
            }

            var sourceObj = undefined;

            for (let i = 0; i < routeMatrix.length; i++) {
                sourceObj = routeMatrix[i].find(x => x != undefined && x.InputChar == '*');
                if (sourceObj != undefined) break;
            }

            FindSink(sourceObj);

            for (const [key, value] of Object.entries(routedSinks)) {
                console.log(key, value);
            }

            Object.keys(routedSinks)
                .sort()
                .forEach(function (v, i) {
                    resultString += v;
                });
        });
    }
    catch (e) {
        console.log(e.message);
    }

    return resultString;
}
//fs.readFile('c:\\coding_qual_input.txt', (err, inputD) => {
//    if (err) {
//        if (err.code === 'ENOENT') {
//            console.error('File not found:', err.path);
//        } else {
//            console.error('Error reading file:', err);
//        }
//        throw err;
//    }
//    console.log(inputD.toString());

//    // Test the 'splitLines' function with a multiline string.
//    console.log('Original string:');
//    console.log(inputD);
//    console.log(splitLines(inputD));

//    const inputArray = splitLines(inputD);

//    var routeObjectsArray = [];

//    for (let i = 0; i < inputArray.length; i++) {
//        let inputRouteMapElementArray = inputArray[i].split(' ');
//        if (inputRouteMapElementArray.length == 3) {
//            routeObjectsArray[i] = {
//                InputChar: inputRouteMapElementArray[0],
//                Utf16Code: inputRouteMapElementArray[0].charCodeAt(0),
//                XCoord: parseInt(inputRouteMapElementArray[1]),
//                YCoord: parseInt(inputRouteMapElementArray[2]),
//                Connectors: [...new Array(eRouteDirections.Left + 1)].map(() => ({ Connector: false, Connected: false, Visited: false })),
//            }
//        }
//        else {
//            routeObjectsArray[i] = nothing;
//        }
//    }

//    //for (let i = 0; i < routeObjectsArray.length; i++) {
//    //    let myJSON = JSON.stringify(routeObjectsArray[i]);

//    //    // Display output
//    //    console.log(myJSON);
//    //}

//    XCoordMax = Math.max(...routeObjectsArray.map(o => o.XCoord));
//    console.log('XCoordMax=' + XCoordMax.toString());

//    XCoordMin = Math.min(...routeObjectsArray.map(o => o.XCoord));
//    console.log('XCoordMin=' + XCoordMin.toString());

//    YCoordMax = Math.max(...routeObjectsArray.map(o => o.YCoord));
//    console.log('YCoordMax=' + YCoordMax.toString());

//    YCoordMin = Math.min(...routeObjectsArray.map(o => o.YCoord));
//    console.log('YCoordMin=' + YCoordMin.toString());

//    let rows = XCoordMax + 1;
//    let cols = YCoordMax + 1;
//    let initialValue = undefined;

//    routeMatrix = Array.from({ length: rows }, () => Array(cols).fill(initialValue));

//    for (let i = 0; i < routeObjectsArray.length; i++) {
//        InitializeCellConnectors(routeObjectsArray[i]);
//        routeMatrix[routeObjectsArray[i].XCoord][routeObjectsArray[i].YCoord] = routeObjectsArray[i];
//    }

//    for (let i = 0; i < routeMatrix.length; i++) {
//        for (let j = 0; j < routeMatrix[i].length; j++) {
//            let myJSON = JSON.stringify(routeMatrix[i][j]);

//            // Display output
//            console.log(myJSON);
//        }
//    }

//    var sourceObj = undefined;

//    for (let i = 0; i < routeMatrix.length; i++) {
//        sourceObj = routeMatrix[i].find(x => x != undefined && x.InputChar == '*');
//        if (sourceObj != undefined) break;
//    }

//    FindSink(sourceObj);

//    for (const [key, value] of Object.entries(routedSinks)) {
//        console.log(key, value);
//    }

//    var resultString = "";

//    Object.keys(routedSinks)
//        .sort()
//        .forEach(function (v, i) {
//            resultString += v;
//        });
//    console.log(resultString);

//});

function InitializeCellConnectors(cellObject) {
    try {
        if (cellObject != undefined) {
            switch (cellObject.Utf16Code) {
                case ePipeSymbolUTF16.Asterisk:
                    cellObject.Connectors.forEach((element, index) => {
                        element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.Horizontal:
                    cellObject.Connectors.forEach((element, index) => { if ((index % 2) == 1) element.Connector = true; });
                    break;
                case ePipeSymbolUTF16.Vertical:
                    cellObject.Connectors.forEach((element, index) => { if ((index % 2) == 0) element.Connector = true; });
                    break;
                case ePipeSymbolUTF16.BottomT:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Right ||
                            index == eRouteDirections.Down ||
                            index == eRouteDirections.Left) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.TopT:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Right ||
                            index == eRouteDirections.Up ||
                            index == eRouteDirections.Left) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.LeftT:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Up ||
                            index == eRouteDirections.Down ||
                            index == eRouteDirections.Left) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.RightT:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Up ||
                            index == eRouteDirections.Down ||
                            index == eRouteDirections.Right) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.TopLeftVertex:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Down ||
                            index == eRouteDirections.Right) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.BottomLeftVertex:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Up ||
                            index == eRouteDirections.Right) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.TopRightVertex:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Down ||
                            index == eRouteDirections.Left) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.BottomRightVertex:
                    cellObject.Connectors.forEach((element, index) => {
                        if (index == eRouteDirections.Up ||
                            index == eRouteDirections.Left) element.Connector = true;
                    });
                    break;
                default:
                    // This covers the letters and the asterisk all of which have 4 connectors
                    cellObject.Connectors.forEach((element, index) => {
                        element.Connector = true;
                    });
                    break;
            }
        }
    }
    catch (e) {
        console.log(e.message);
        console.trace("");
    }
}

function ComponentsMate(refCell, testCell) {
    var returnStatus = false;

    try {
        // NOTE: If testCell[].Connected == true this means that means that recursive tunneling along that path has already occured or is in progress,
        // so don't go down that path again and just return false.
        //
        if (!testCell.Connectors[eRouteDirections.Down].Connected &&
            refCell.Connectors[eRouteDirections.Up].Connector && testCell.Connectors[eRouteDirections.Down].Connector) {

            refCell.Connectors[eRouteDirections.Up].Connected = true;
            testCell.Connectors[eRouteDirections.Down].Connected = true;

            refCell.Connectors[eRouteDirections.Up].Visited = true;
            testCell.Connectors[eRouteDirections.Down].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Up].Connected &&
                 refCell.Connectors[eRouteDirections.Down].Connector && testCell.Connectors[eRouteDirections.Up].Connector) {

            refCell.Connectors[eRouteDirections.Down].Connected = true;
            testCell.Connectors[eRouteDirections.Up].Connected = true;

            refCell.Connectors[eRouteDirections.Down].Visited = true;
            testCell.Connectors[eRouteDirections.Up].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Right].Connected &&
                 refCell.Connectors[eRouteDirections.Left].Connector && testCell.Connectors[eRouteDirections.Right].Connector) {

            refCell.Connectors[eRouteDirections.Left].Connected = true;
            testCell.Connectors[eRouteDirections.Right].Connected = true;

            refCell.Connectors[eRouteDirections.Left].Visited = true;
            testCell.Connectors[eRouteDirections.Right].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Left].Connected &&
                 refCell.Connectors[eRouteDirections.Right].Connector && testCell.Connectors[eRouteDirections.Left].Connector) {

            refCell.Connectors[eRouteDirections.Right].Connected = true;
            testCell.Connectors[eRouteDirections.Left].Connected = true;

            refCell.Connectors[eRouteDirections.Right].Visited = true;
            testCell.Connectors[eRouteDirections.Left].Visited = true;

            returnStatus = true;
        }

        if (returnStatus) {
            // If connection was made but testCell is a LETTER we've reached a destination tunneling along this path so tell the calling
            // level to stop tunneling along this path.
            //
            if (regex.test(testCell.InputChar)) {
                routedSinks[testCell.InputChar] = testCell.InputChar;
                console.log("Sink: " + testCell.InputChar + " was routed to.");
                returnStatus = false;
            }
            // If testCell is the asterisk ORIGIN, tell the calling level to stop tunneling along this path.
            //
            else if (testCell.InputChar == "*") {
                console.log("Source: " + testCell.InputChar + " was encountered.");
                returnStatus = false;
            }
        }
    }
    catch (e) {
        console.log(e.message);
        console.trace("");
    }

    return returnStatus;
}

function FindSink(refCell) {

    var direction;
    var x, y;

    try {
        if (refCell != undefined) {
            for (direction = eRouteDirections.Up; direction <= eRouteDirections.Left; direction++) {
                x = y = -1;

                if (refCell.Connectors[direction].Connector) {
                    if (direction == eRouteDirections.Up) {
                        x = refCell.XCoord;
                        y = refCell.YCoord + 1;

                        // don't exceed the upper bound
                        if (y > YCoordMax) {
                            //console.log(" YCoordMax (" + YCoordMax.toString() + ") limit reached.")
                            x = y = -1;
                        }
                    }
                    else if (direction == eRouteDirections.Right) {
                        x = refCell.XCoord + 1;
                        y = refCell.YCoord;

                        // don't exceed the right bound
                        if (x > XCoordMax) {
                            //console.log(" XCoordMax (" + XCoordMax.toString() + ") limit reached.")
                            x = y = -1;
                        }
                    }
                    else if (direction == eRouteDirections.Down) {
                        x = refCell.XCoord;
                        y = refCell.YCoord - 1;

                        // don't exceed the lower bound
                        if (y < YCoordMin) {
                            //console.log(" YCoordMin (" + YCoordMin.toString() + ") limit reached.")
                            x = y = -1;
                        }
                    }
                    else if (direction == eRouteDirections.Left) {
                        x = refCell.XCoord - 1;
                        y = refCell.YCoord;

                        // don't exceed the left bound
                        if (x < XCoordMin) {
                            //console.log(" XCoordMin (" + XCoordMin.toString() + ") limit reached.")
                            x = y = -1;
                        }
                    }
                }

                if (x == -1 || y == -1) {
                    //console.log("Encountered unset coordinates x (" + x.toString() + "), y (" + y.toString() + ").");
                    continue;
                }

                if (routeMatrix[x][y] == undefined) {
                    //console.log("Encountered undefined call at x (" + x.toString() + "), y (" + y.toString() + ").");
                    continue;
                }

                if (ComponentsMate(refCell, routeMatrix[x][y])) {
                    FindSink(routeMatrix[x][y]);
                }
                else {
                    // Components either did not mate or sink (destination dead end) was reached.
                    //
                    continue;
                }
            }
        }
    }
    catch (e) {
        console.log(e.message);
        console.trace("");
    }
}

var resultString = FindAllSinksFromSource(filePath);
console.log(resultString);

//function ComponentsMate1(objA, objB) {
//    var returnStatus = false;

//    try {
//        if (objA != undefined && objB != undefined) {
//            // B to the right of A
//            //
//            if ((objB.XCoord - objA.XCoord) == 1 &&
//                (objB.YCoord - objA.YCoord) == 0) {

//                switch (objA.Utf16Code) {

//                    case ePipeSymbolUTF16.Asterisk:
//                    case ePipeSymbolUTF16.TopT:
//                    case ePipeSymbolUTF16.BottomT:
//                    case ePipeSymbolUTF16.RightT:
//                        if (objB.Utf16Code == ePipeSymbolUTF16.TopT ||
//                            objB.Utf16Code == ePipeSymbolUTF16.BottomT ||
//                            objB.Utf16Code == ePipeSymbolUTF16.LeftT ||
//                            objB.Utf16Code == ePipeSymbolUTF16.Horizontal ||
//                            objB.Utf16Code == ePipeSymbolUTF16.TopRightVertex ||
//                            objB.Utf16Code == ePipeSymbolUTF16.BottomRightVertex) {
//                            returnStatus = true;
//                        }
//                        break;
//                    case y:
//                        // code block
//                        break;
//                    default:
//                    // code block
//                }
//            }
//            // B to the left of A
//            //
//            else if ((objB.XCoord - objA.XCoord) == -1 &&
//                (objB.YCoord - objA.YCoord) == 0) {

//                switch (objA.Utf16Code) {

//                    case ePipeSymbolUTF16.Asterisk:
//                        if (objB.YCoord == objA.YCoord)
//                            break;
//                    case y:
//                        // code block
//                        break;
//                    default:
//                    // code block
//                }
//            }
//            // B directly above A
//            //
//            else if ((objB.XCoord - objA.XCoord) == 0 &&
//                (objB.YCoord - objA.YCoord) == 1) {

//                switch (objA.Utf16Code) {

//                    case ePipeSymbolUTF16.Asterisk:
//                        if (objB.YCoord == objA.YCoord)
//                            break;
//                    case y:
//                        // code block
//                        break;
//                    default:
//                    // code block
//                }
//            }
//            // B directly below A
//            //
//            else if ((objB.XCoord - objA.XCoord) == 0 &&
//                (objB.YCoord - objA.YCoord) == -1) {

//                switch (objA.Utf16Code) {

//                    case ePipeSymbolUTF16.Asterisk:
//                        if (objB.YCoord == objA.YCoord)
//                            break;
//                    case y:
//                        // code block
//                        break;
//                    default:
//                    // code block
//                }
//            }
//        }

//    }
//    catch (e) {
//        console.log(e.message);
//    }
//}

//var name = "";
//var name2 = "";

//let name = prompt("What is your name?");

//let name2 = prompt("What is your wife's name?");

//console.log("Hello, " + name + "!");