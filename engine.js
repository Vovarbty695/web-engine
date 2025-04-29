let ctx;

function print(text){
    console.log(text);
}
function println(text){
    console.log(text + "\n");
}
function printd(text){
    document.write(text);
}
function printlnd(text){
    document.writeln(text);
}
function error(text){
    console.error(text);
}
function initC(){
    const canvas = document.getElementById("GameWindow");
    ctx = canvas.getContext('2d');
}
function rect(x, y, width, height, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
function text(text, x, y, font, color){
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function image(path, x, y){
    let img = new Image();
    img.src = path;

    img.onload = function(){
        ctx.drawImage(img, x, y);
    }
}

function image(path, x, y, width, height){
    let img = new Image();
    img.src = path;

    img.onload = function(){
        ctx.drawImage(img, x, y, width, height);
    }
}

initC();
image("boombox.jpg", 1, 1, 600, 600);