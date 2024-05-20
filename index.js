const RESOLUTION = 800;

let canvas;
let ctxt;
let polygon;
let sortedVertices;
let stack;
let edges;
let frame;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");

    polygon = generateYMonotonePolygon(10);
    sortedVertices = sortVertices(polygon);
    stack = [
        sortedVertices.shift(),
        sortedVertices.shift()
    ];
    edges = [];

    frame = 0;

    loop();
}

function randomCoordinate(margin) {
    return Math.random() * (1 - 2 * margin) + margin;
}

function generateYMonotonePolygon(size) {
    let margin = 0.1;
    let top = [randomCoordinate(margin), margin];
    let bottom = [randomCoordinate(margin), 1 - margin];
    let chain1 = [];
    let chain2 = [];
    
    for(let i=1;i<size-1;i++) {
        let y1 = ((i + Math.random() / 2) / size) * (1 - 2 * margin) + margin;
        let y2 = ((i + Math.random() / 2) / size) * (1 - 2 * margin) + margin;

        // two coordinates which are not too close to each other
        let a;
        let b;
        do {
            a = randomCoordinate(margin);
            b = randomCoordinate(margin);
        }while(Math.abs(a - b) < 0.2);

        let left;
        let right;
        if(a < b) {
            left = a;
            right = b;
        } else {
            left = b;
            right = a;
        }

        chain1.unshift([left, y1])
        chain2.push([right, y2])
    }

    // vertices which are on almost straight edges
    removeRedundantEdges(chain1, Math.PI / 3);
    removeRedundantEdges(chain2, Math.PI / 3);

    return [...chain1, top, ...chain2, bottom];
}

function sortVertices(polygon) {
    let index = polygon.reduce((result, value, index) => {
        if(value[1] < polygon[result][1]) {
            return index;
        } else {
            return result;
        }
    }, 0);

    let chain1 = polygon.slice(0, index).reverse();
    let chain2 = polygon.slice(index + 1, polygon.length - 1);

    let result = [[index, false]];
    let index1 = index - 1;
    let index2 = index + 1;
    while(chain1.length > 0 || chain2.length > 0) {
        let y1 = (chain1[0]?.[1]) ?? Infinity;
        let y2 = (chain2[0]?.[1]) ?? Infinity;
        if(y1 < y2) {
            chain1.shift();
            result.push([index1, false]);
            index1--;
        } else {
            chain2.shift();
            result.push([index2, true]);
            index2++;
        }
    }
    result.push([polygon.length - 1, result[result.length - 1][1]]);

    return result;
}

function removeRedundantEdges(chain, threshold) {
    for(let i=chain.length-2;i>=1;i--) {
        let x1 = chain[i + 1][0];
        let y1 = chain[i + 1][1];
        let x2 = chain[i][0];
        let y2 = chain[i][1];
        let x3 = chain[i - 1][0];
        let y3 = chain[i - 1][1];
        let angle1 = Math.atan2(y2 - y1, x2 - x1);
        let angle2 = Math.atan2(y3 - y2, x3 - x2);

        if(Math.abs(angle1 - angle2) < threshold) {
            chain.splice(i, 1);
        }
    }
}

function loop() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    ctxt.save();
    ctxt.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);

    ctxt.fillStyle = "#000";
    ctxt.strokeStyle = "#000";
    ctxt.lineWidth = 0.004;
    ctxt.beginPath();
    ctxt.moveTo(polygon[0][0], polygon[0][1]);
    for(let i=1;i<polygon.length;i++) {
        ctxt.lineTo(polygon[i][0], polygon[i][1]);
    }
    ctxt.closePath();
    ctxt.stroke();

    for(let point of polygon) {
        ctxt.beginPath();
        ctxt.arc(point[0], point[1], 0.01, 0, 2 * Math.PI);
        ctxt.fill();
    }

    ctxt.fillStyle = "#AAAA";
    for(let [index, _] of stack) {
        ctxt.beginPath();
        ctxt.arc(polygon[index][0], polygon[index][1], 0.01, 0, 2 * Math.PI);
        ctxt.fill();
    }
    
    ctxt.strokeStyle = "#AAAA";
    for(let [point0, point1] of edges) {
        ctxt.beginPath();
        ctxt.moveTo(polygon[point0][0], polygon[point0][1]);
        ctxt.lineTo(polygon[point1][0], polygon[point1][1]);
        ctxt.stroke();
    }

    ctxt.restore();

    frame++;
    if(frame % 60 === 0) {
        stepAlgorithm();
    }

    requestAnimationFrame(loop);
}

function stepAlgorithm() {
    // stack.push(sortedVertices.shift());

    if(sortedVertices.length === 1) {
        return;
    }
    
    let [stackIndex, stackChain] = stack[stack.length - 1];
    let [pointIndex, pointChain] = sortedVertices[0];
    if(stackChain === pointChain) {
        console.log("case 2")
        while(stack.length > 1) {
            stack.pop();
        }

    } else {
        console.log("case 1")
        edges.push([stackIndex, pointIndex]);
        while(stack.length > 1) {
            let [index, _] = stack.pop();
            edges.push([index, pointIndex]);
        }
        stack = [
            [stackIndex, stackChain],
            [pointIndex, pointChain]
        ];
        sortedVertices.shift();
    }
}
