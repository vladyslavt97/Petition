console.log("js is connected");

let canvas = document.getElementById("drawing");
let context = canvas.getContext("2d");
context.strokeStyle = "#000000";
context.lineWidth = 5;
context.lineJoin = "round";
context.lineCap = "round";
let isDrawing = false;
let lastX = 0;
let lastY = 0;
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


//my setup for encoding

const getBase64StringFromDataURL = (dataURL) =>
    dataURL.replace('data:', '').replace(/^.+,/, '');
const btn = document.querySelector('button');
btn.addEventListener("click", function () {
    let dataURL = canvas.toDataURL();
    const base64 = getBase64StringFromDataURL(dataURL);
    const hiddenValue = document.getElementById("hidden").value = base64;
    console.log(hiddenValue);
});