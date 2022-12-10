console.log("js is connected");

var canvas = document.getElementById("drawing");

// Set up the canvas context
var context = canvas.getContext("2d");

// Set the initial stroke style
context.strokeStyle = "#000000";

// Set the initial line width
context.lineWidth = 5;

// Set the initial line join style
context.lineJoin = "round";

// Set the initial line cap style
context.lineCap = "round";

// Variables to track the current drawing state
var isDrawing = false;
var lastX = 0;
var lastY = 0;

// Handle mousedown events
canvas.addEventListener("mousedown", function (e) {
    // Set the isDrawing flag to true
    isDrawing = true;

    // Set the initial position
    lastX = e.offsetX;
    lastY = e.offsetY;
});

// Handle mousemove events
canvas.addEventListener("mousemove", function (e) {
    if (!isDrawing) return;

    // Draw a line from the last position to the current position
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();

    // Update the last position
    lastX = e.offsetX;
    lastY = e.offsetY;
});

// Handle mouseup events
canvas.addEventListener("mouseup", function () {
    // Set the isDrawing flag to false
    isDrawing = false;
});

// Handle mouseleave events
canvas.addEventListener("mouseleave", function () {
    // Set the isDrawing flag to false
    isDrawing = false;
});
