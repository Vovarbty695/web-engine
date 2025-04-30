const codeEditor = document.getElementById('codeEditor');
const runButton = document.getElementById('runButton');
const saveButton = document.getElementById('saveButton');
const outputDiv = document.getElementById('output');
const gameCanvas = document.getElementById('GameWindow');
const gameContext = gameCanvas.getContext('2d');

let ctx;
let physicsObjects = [];

const CollisionType = {
    NONE: 0,
    CIRCLE: 1,
    RECTANGLE: 2
};

function createPhysicsObject(x, y, width, height, color, speedX, speedY, gravity, bounce, collisionType) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color,
        speedX: speedX,
        speedY: speedY,
        gravity: gravity,
        bounce: bounce,
        collisionType: collisionType
    };
}

function addPhysicsObject(x, y, width, height, color, speedX, speedY, gravity, bounce, collisionType) {
    let newObject = createPhysicsObject(x, y, width, height, color, speedX, speedY, gravity, bounce, collisionType);
    physicsObjects.push(newObject);
}

function drawPhysicsObjects() {
    physicsObjects.forEach(obj => {
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        if (obj.collisionType === CollisionType.CIRCLE) {
            ctx.arc(obj.x, obj.y, obj.width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.collisionType === CollisionType.RECTANGLE) {
            ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
        }
        ctx.closePath();
    });
}

function updatePhysicsObjects() {
    physicsObjects.forEach(obj => {
        obj.speedY += obj.gravity;
        obj.y += obj.speedY;
        obj.x += obj.speedX;

        if (obj.y + (obj.collisionType === CollisionType.CIRCLE ? obj.width / 2 : obj.height / 2) > gameCanvas.height) {
            obj.y = gameCanvas.height - (obj.collisionType === CollisionType.CIRCLE ? obj.width / 2 : obj.height / 2);
            obj.speedY = -obj.speedY * obj.bounce;
            if (Math.abs(obj.speedY) < 0.5) obj.speedY = 0;
        }

        if (obj.x + (obj.collisionType === CollisionType.CIRCLE ? obj.width / 2 : obj.width / 2) > gameCanvas.width ||
            obj.x - (obj.collisionType === CollisionType.CIRCLE ? obj.width / 2 : obj.width / 2) < 0) {
            obj.speedX = -obj.speedX;
        }
    });
}

function gameLoop() {
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawPhysicsObjects();
    updatePhysicsObjects();
    requestAnimationFrame(gameLoop);
}

function print(text) {
    console.log(text);
    outputDiv.textContent += text + "\n";
}
function println(text) {
    console.log(text + "\n");
    outputDiv.textContent += text + "\n";
}
function printd(text) {
    document.write(text);
}
function printlnd(text) {
    document.writeln(text);
}
function error(text) {
    console.error(text);
    outputDiv.textContent += "ПОМИЛКА: " + text + "\n";
}
function initC() {
    const canvas = document.getElementById("GameWindow");
    ctx = canvas.getContext('2d');
}
function rect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
function circle(x, y, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}
function text(text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}
function image(path, x, y) {
    let img = new Image();
    img.src = path;
    img.onload = function () {
        ctx.drawImage(img, x, y);
    }
}
function imageWH(path, x, y, width, height) {
    let img = new Image();
    img.src = path;
    img.onload = function () {
        ctx.drawImage(img, x, y, width, height);
    }
}

initC();

const createRectButton = document.getElementById('createRect');
const createCircleButton = document.getElementById('createCircle');
const createTextButton = document.getElementById('createText');
const propertyEditorDiv = document.getElementById('propertyEditor');

let selectedObject = null;
let objectsOnCanvas = [];

function addObjectToCanvas(type, properties = {}) {
    const newObject = {
        type: type,
        ...properties
    };
    objectsOnCanvas.push(newObject);
    redrawCanvas();
    selectObject(newObject);
}

createRectButton.addEventListener('click', () => {
    addObjectToCanvas('rect', { x: 100, y: 100, width: 50, height: 50, color: 'blue' });
});

createCircleButton.addEventListener('click', () => {
    addObjectToCanvas('circle', { x: 200, y: 150, r: 30, color: 'green' });
});

createTextButton.addEventListener('click', () => {
    addObjectToCanvas('text', { text: 'Привіт', x: 300, y: 200, font: '16px Arial', color: 'black' });
});

function redrawCanvas() {
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    objectsOnCanvas.forEach(obj => {
        if (obj.type === 'rect') {
            rect(obj.x, obj.y, obj.width, obj.height, obj.color);
        } else if (obj.type === 'circle') {
            circle(obj.x, obj.y, obj.r, obj.color);
        } else if (obj.type === 'text') {
            text(obj.text, obj.x, obj.y, obj.font, obj.color);
        }
    });
}

function selectObject(object) {
    selectedObject = object;
    populatePropertyEditor(object);
}

function populatePropertyEditor(object) {
    propertyEditorDiv.innerHTML = '<h3>Інспектор</h3>';
    if (object) {
        for (const key in object) {
            if (key !== 'type') {
                const propertyRow = document.createElement('div');
                propertyRow.classList.add('property-row');
                propertyRow.style.marginBottom = '8px'; // Додаємо нижній відступ

                const label = document.createElement('label');
                label.textContent = `${key}:`;
                propertyRow.appendChild(label);

                let inputElement;
                if (typeof object[key] === 'number') {
                    inputElement = document.createElement('input');
                    inputElement.type = 'number';
                    inputElement.value = object[key];
                    inputElement.addEventListener('change', (e) => {
                        object[key] = parseFloat(e.target.value);
                        redrawCanvas();
                    });
                } else if (typeof object[key] === 'string' && key === 'color') {
                    inputElement = document.createElement('input');
                    inputElement.type = 'color';
                    inputElement.value = object[key];
                    inputElement.addEventListener('change', (e) => {
                        object[key] = e.target.value;
                        redrawCanvas();
                    });
                } else if (typeof object[key] === 'string' && key === 'text') {
                    inputElement = document.createElement('input');
                    inputElement.value = object[key];
                    inputElement.addEventListener('change', (e) => {
                        object[key] = e.target.value;
                        redrawCanvas();
                    });
                    inputElement.style.width = '100%';
                    inputElement.style.height = '50px';
                } else {
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.value = object[key];
                    inputElement.addEventListener('change', (e) => {
                        object[key] = e.target.value;
                        redrawCanvas();
                    });
                }
                propertyRow.appendChild(inputElement);
                propertyEditorDiv.appendChild(propertyRow);
            }
        }
    } else {
        const message = document.createElement('p');
        message.textContent = 'Виберіть об\'єкт на канвасі для редагування.';
        propertyEditorDiv.appendChild(message);
    }
}

gameCanvas.addEventListener('click', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = objectsOnCanvas.length - 1; i >= 0; i--) {
        const obj = objectsOnCanvas[i];
        if (obj.type === 'rect' && x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
            selectObject(obj);
            return;
        } else if (obj.type === 'circle' && Math.sqrt((x - obj.x)**2 + (y - obj.y)**2) <= obj.r) {
            selectObject(obj);
            return;
        } else if (obj.type === 'text' && x >= obj.x && x <= obj.x + obj.text.length * 8 && y >= obj.y - 16 && y <= obj.y) {
            selectObject(obj);
            return;
        }
    }
    selectObject(null);
});

saveButton.addEventListener('click', function() {
    const codeToSave = codeEditor.value;
    localStorage.setItem('savedCode', codeToSave);
    print("Проєкт збережено!");
});

runButton.addEventListener('click', function () {
    const codeToRun = codeEditor.value;
    outputDiv.textContent = "Виконується код...\n";
    try {
        gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        objectsOnCanvas = [];
        const userFunction = new Function('print', 'println', 'printd', 'printlnd', 'error', 'initC', 'rect', 'circle', 'text', 'image', 'addPhysicsObject', 'gameLoop', 'CollisionType', 'physicsObjects', 'createPhysicsObject', 'drawPhysicsObjects', 'updatePhysicsObjects', codeToRun);
        userFunction(print, println, printd, printlnd, error, initC, rect, circle, text, image, addPhysicsObject, gameLoop, CollisionType, physicsObjects, createPhysicsObject, drawPhysicsObjects, updatePhysicsObjects);
        redrawCanvas();
        selectObject(null);
    } catch (error) {
        console.error("Помилка виконання коду:", error);
        outputDiv.textContent += "\nПомилка виконання: " + error;
    }
});

window.onload = function() {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        codeEditor.value = savedCode;
    }
    initC();
    redrawCanvas();
    populatePropertyEditor(null);
};