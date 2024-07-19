
// strict mode is invoked to avoid the inadvertant use of undeclared variables.
//
'use strict';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// First, here, we declare all variables and enums which require globle scope since they'll be referenced in
// subsequent caller and callee functions.
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

var XCoordMax, XCoordMin, YCoordMax, YCoordMin;
var routeMatrix;

// This is the file path we will pass to FindAllSinksFromSource.
//
let filePath = "c:\\";

function FindAllSinksFromSource(filePath) {

    var resultString = "";

    try {
        // include the 'fs' file system module from Node JS.
        //
        const fs = require('fs');

        // Since we are writing a function, FindAllSinksFromSource, which is meant to be called and to return
        // string with the concatenated sink letters, this is a synchronous operation, which means we need to
        // use readFileSync for our text file read rather than readFile which runs asynchronously.
        //
        const inputD = fs.readFileSync((filePath + 'coding_qual_input.txt'), { encoding: 'utf8', flag: 'r' });
        //console.log(inputD.toString());

        // Test the 'splitLines' function with a multiline string.
        //console.log('Original string:');
        //console.log(inputD);
        //console.log(splitLines(inputD));

        // Split the input file data into a 1-D array of text lines, one array element for for each text line in the input file.
        //
        const inputArray = splitLines(inputD);

        // Populate the 1-D routeObjectsArray array with objects, each object corresponding to a source/connector/sink element as
        // described in the input file along with its X,Y coordinates.
        // NOTE: Description of object properties:
        //  InputChar - left-most character in each line of the input file (source/connector/sink).
        //  Utf16Code - Utf16 code corresponding to the InputChar character.  Utf16 code was chosen since this includes pipe connector symbols
        //      which are lacking in other code sets like ASCII.
        //  XCoord, YCoord - X,Y coordinates for this source/connector/sink object.
        //  Connectors - 1-D array of "connector" objects.  This array is sized to 4 (for the max. number of connections of a given element -
        //      Up / Down / Left / Right, but initislized to Connector = false, meaning "not a connector for this shape".  Farther on in
        //      InitializeCellConnectors() this array's entries will be updated per the specific connector type.  Farther on in the program
        //      Connected is set to true when a connection is made between two adjacent array elements.
        //      
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
                // This is for blank row gaps in the input data.
                //
                routeObjectsArray[i] = nothing;
            }
        }

        // Get the upper and lower X & Y bounds so we can create a rectangular route matrix (2-D array)
        //
        XCoordMax = Math.max(...routeObjectsArray.map(o => o.XCoord));
        //console.log('XCoordMax=' + XCoordMax.toString());

        XCoordMin = Math.min(...routeObjectsArray.map(o => o.XCoord));
        //console.log('XCoordMin=' + XCoordMin.toString());

        YCoordMax = Math.max(...routeObjectsArray.map(o => o.YCoord));
        //console.log('YCoordMax=' + YCoordMax.toString());

        YCoordMin = Math.min(...routeObjectsArray.map(o => o.YCoord));
        //console.log('YCoordMin=' + YCoordMin.toString());

        // Dimensions for the 2-D route matrix
        //
        let rows = XCoordMax + 1;
        let cols = YCoordMax + 1;
        let initialValue = undefined;

        // Create the 2-D route matrix and initialize all cells with undefined.
        //
        routeMatrix = Array.from({ length: rows }, () => Array(cols).fill(initialValue));

        // Populate the 2-D route matrix from the routeObjectsArray array after having updated each cell's connectors per its
        // source/connector/sink character shape.
        //
        for (let i = 0; i < routeObjectsArray.length; i++) {
            InitializeCellConnectors(routeObjectsArray[i]);
            routeMatrix[routeObjectsArray[i].XCoord][routeObjectsArray[i].YCoord] = routeObjectsArray[i];
        }

        //for (let i = 0; i < routeMatrix.length; i++) {
        //    for (let j = 0; j < routeMatrix[i].length; j++) {
        //        let myJSON = JSON.stringify(routeMatrix[i][j]);

        //        // Display output
        //        console.log(myJSON);
        //    }
        //}

        // Find the source object in the newly populated routeMatrix.
        //
        var sourceObj = undefined;

        for (let i = 0; i < routeMatrix.length; i++) {
            sourceObj = routeMatrix[i].find(x => x != undefined && x.InputChar == '*');
            if (sourceObj != undefined) break;
        }

        // Perform the recursive connections, spanning out in all 4 directions (Up/Down/Left/Right)
        //.
        FindSink(sourceObj);

        //for (const [key, value] of Object.entries(routedSinks)) {
        //    console.log(key, value);
        //}

        // Sort alphabetically the connected-to sinks as contained in the routedSinks dictionary and concatenate them
        // into a single string, resultString, to be returned to the calling program.
        //
        Object.keys(routedSinks)
            .sort()
            .forEach(function (v, i) {
                resultString += v;
            });
    }
    catch (e) {
        console.log(e.message);
    }

    return resultString;
}

// This function will take the read-in input buffer and convert it into a 1-D
// array of strings.
//
function splitLines(str) {
    str = str.toString();
    str = str.split(/\r?\n/);
    return str;
}

// For the passed-in cellObject, based on it's shape as defined by the cellObject.Utf16Code property has its associated
// Connectors(Up / Down / Left / Right) set to true.  For source (asterisk) and sinks (letters) all 4 connectors are 
// set to true.
//
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
                    cellObject.Connectors.forEach((element, index) => {
                        if ((index % 2) == 1) element.Connector = true;
                    });
                    break;
                case ePipeSymbolUTF16.Vertical:
                    cellObject.Connectors.forEach((element, index) => {
                        if ((index % 2) == 0) element.Connector = true;
                    });
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

// ComponentsMate is called from FindSinks for a referencc cell and an adjacent test cell to test for and make a connection for
// complementary adjacent cell connectors.
//      - Is uses the cell's Connector boolean property to determine if there is a possible connection with the adjacent cell.
//          - Complementary adjacencies are Up with Down/Down with Up/Right with Left/Left with Right.
//      - When a connection is made
//          - The.Connected property is set to true for BOTH cells to prevent algorithmic thrashing.
//          - A true is returned from ComponentsMate to the caller FindSinks to tell the caller to proceed with the recursive search
//              along that path.
//          - However, if the testCell for the sucessful connection was the source cell (* - asterisk), a false is returned to the caller
//              to stop the recursive search along that path.
//      - When the successful connection is made to a sink cell (a letter), this sink (letter) is stored in the routedSinks dictionary collection.
//
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

            //refCell.Connectors[eRouteDirections.Up].Visited = true;
            //testCell.Connectors[eRouteDirections.Down].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Up].Connected &&
            refCell.Connectors[eRouteDirections.Down].Connector && testCell.Connectors[eRouteDirections.Up].Connector) {

            refCell.Connectors[eRouteDirections.Down].Connected = true;
            testCell.Connectors[eRouteDirections.Up].Connected = true;

            //refCell.Connectors[eRouteDirections.Down].Visited = true;
            //testCell.Connectors[eRouteDirections.Up].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Right].Connected &&
            refCell.Connectors[eRouteDirections.Left].Connector && testCell.Connectors[eRouteDirections.Right].Connector) {

            refCell.Connectors[eRouteDirections.Left].Connected = true;
            testCell.Connectors[eRouteDirections.Right].Connected = true;

            //refCell.Connectors[eRouteDirections.Left].Visited = true;
            //testCell.Connectors[eRouteDirections.Right].Visited = true;

            returnStatus = true;
        }
        else if (!testCell.Connectors[eRouteDirections.Left].Connected &&
            refCell.Connectors[eRouteDirections.Right].Connector && testCell.Connectors[eRouteDirections.Left].Connector) {

            refCell.Connectors[eRouteDirections.Right].Connected = true;
            testCell.Connectors[eRouteDirections.Left].Connected = true;

            //refCell.Connectors[eRouteDirections.Right].Visited = true;
            //testCell.Connectors[eRouteDirections.Left].Visited = true;

            returnStatus = true;
        }

        if (returnStatus) {
            // If connection was made but testCell is a LETTER we've reached a destination tunneling along this path so tell the calling
            // level to stop tunneling along this path.
            //
            if (regex.test(testCell.InputChar)) {
                routedSinks[testCell.InputChar] = testCell.InputChar;
                //console.log("Sink: " + testCell.InputChar + " was routed to.");
                //returnStatus = false;
            }
            // If testCell is the asterisk ORIGIN, tell the calling level to stop tunneling along this path.
            //
            else if (testCell.InputChar == "*") {
                //console.log("Source: " + testCell.InputChar + " was encountered.");
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

// FindSink recursively makes connections in all 4 directions for the passed-in reference cell. FindSink finds an adjacent cell,
// routeMatrix[x][y] and calls ComponentsMate to test for and make a connection between the reference cell and routeMatrix[x][y].
//      - If a connection is made, the recursive FindSink call is made for the newly connected-to cell, routeMatrix[x][y],
//          is made.
//      - If a connection is not made, we iterate to the next direction, meaning we've stopped tunneling along that path.
//      - If a sink is encountered, ComponentsMate returns a false to stop tunneling along that path and we iterate tp the next direction.
//      - If the upper, lower, left or right boundary of the routeMatrix is encountered, we stop tunneling along that path and iterate
//          to the next direction.
//      - If we encounter a gap (undefined) in the route matrix, we stop tunneling along that path and iterate
//          to the next direction.
//  NOTE: In ComponentsMate, when a connection is made, it is marked as having been made (.Connected = true) for both the reference cell
//          routeMatrix[x][y] to prevent algorithm thrashing.
//
function FindSink(refCell) {

    var direction;
    var x, y;

    try {
        if (refCell != undefined) {
            for (direction = eRouteDirections.Up; direction <= eRouteDirections.Left; direction++) {
                x = y = -1;

                // First insure that for the reference cell there exists a connector in this direction.
                //
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
