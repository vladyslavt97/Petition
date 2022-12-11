console.log("js is connected");

var canvas = document.getElementById("drawing");
var context = canvas.getContext("2d");
context.strokeStyle = "#000000";
context.lineWidth = 5;
context.lineJoin = "round";
context.lineCap = "round";
var isDrawing = false;
var lastX = 0;
var lastY = 0;
canvas.addEventListener("mousedown", function (e) {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener("mousemove", function (e) {
    if (!isDrawing) return;
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
});
canvas.addEventListener("mouseup", function () {
    isDrawing = false;
});
canvas.addEventListener("mouseleave", function () {
    isDrawing = false;
});


//my setup

const getBase64StringFromDataURL = (dataURL) =>
    dataURL.replace('data:', '').replace(/^.+,/, '');
const btn = document.querySelector('button');
btn.addEventListener("click", function () {
    let dataURL = canvas.toDataURL();
    const base64 = getBase64StringFromDataURL(dataURL);
    const hiddenValue = document.getElementById("hidden").value = base64;
    console.log(hiddenValue);
});







// export canvasForBase64 = binaryBase64Image;
// console.log(canvasForBase64);

// module.exports.coordinates = canvas.addEventListener('mousedown', event => {
//     const x = event.clientX;
//     const y = event.clientY;
//     const rect = canvas.getBoundingClientRect();
//     console.log('getBoundingClientRect: ', rect);
//     const canvasX = x - rect.left;
//     const canvasY = y - rect.top;
//     console.log('canvasX: ', canvasX);
//     console.log('canvasY: ', canvasY);
//     // draw at the (canvasX, canvasY) point on the canvas
// });