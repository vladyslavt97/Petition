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
const btn = document.querySelector('button');
btn.addEventListener("click", function () {
    let dataURL = canvas.toDataURL();
    const hiddenValue = document.getElementById("hidden").value = dataURL;
    console.log(hiddenValue);
});


const mathfloor = document.getElementById('1');


function timeout() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        mathfloor.style.color = randomColor;
        
        timeout();
    }, 100);
}
timeout();
const mathfloor2 = document.getElementById('2');


function timeout2() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        mathfloor2.style.color = randomColor;
        
        timeout2();
    }, 100);
}
timeout2();
const mathfloor3 = document.getElementById('3');


function timeout3() {
    setTimeout(function () {
        function generateRandomVal() {
            return Math.floor(Math.random() * 256);
        }
        let r = generateRandomVal();
        let g = generateRandomVal();
        let b = generateRandomVal();
        
        let randomColor = "rgb(" + r + "," + g + "," + b + ")";
        mathfloor3.style.color = randomColor;
        
        timeout3();
    }, 100);
}
timeout3();