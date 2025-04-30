const codeEditor = document.getElementById('codeEditor');
    const runButton = document.getElementById('runButton');
    const saveButton = document.getElementById('saveButton');
    const outputDiv = document.getElementById('output');
    const gameCanvas = document.getElementById('GameWindow');
    const gameContext = gameCanvas.getContext('2d');
    const createRectButton = document.getElementById('createRect');
    const createCircleButton = document.getElementById('createCircle');
    const createTextButton = document.getElementById('createText');
    const createPlayerButton = document.getElementById('createPlayer');
    const propertyEditorDiv = document.getElementById('propertyEditor');

    let selectedObject = null;
    let objectsOnCanvas = [];

    function initC() {
      ctx = gameCanvas.getContext('2d');
    }

    function rect(x, y, width, height, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    }

    function circle(x, y, r, color) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    }

    function text(t, x, y, font, color) {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(t, x, y);
    }

    function image(path, x, y) {
      const img = new Image();
      img.src = path;
      img.onload = function () {
        ctx.drawImage(img, x, y);
      }
    }

    function redrawCanvas() {
      gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      objectsOnCanvas.forEach(obj => {
        if (obj.type === 'rect') {
          rect(obj.x, obj.y, obj.width, obj.height, obj.color);
        } else if (obj.type === 'circle') {
          circle(obj.x, obj.y, obj.r, obj.color);
        } else if (obj.type === 'text') {
          text(obj.text, obj.x, obj.y, obj.font, obj.color);
        } else if (obj.type === 'image') {
          image(obj.path, obj.x, obj.y);
        }
      });
    }

    function addObjectToCanvas(type, properties = {}) {
      const newObject = { type, ...properties };
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

    createPlayerButton.addEventListener('click', function () {
      const type = document.getElementById('playerType').value;
      const color = document.getElementById('playerColor').value;
      const path = document.getElementById('playerImage').value;
      player(type, color, 100, 100, 50, 50, path);
    });

    document.getElementById('playerType').addEventListener('change', function () {
      const pathInput = document.getElementById('playerImage');
      pathInput.style.display = this.value === 'image' ? 'block' : 'none';
    });

    function player(type = 'rect', color = 'black', x = 0, y = 0, width = 20, height = 20, path = '') {
      if (type === 'rect') {
        addObjectToCanvas('rect', { x, y, width, height, color });
      } else if (type === 'circle') {
        addObjectToCanvas('circle', { x, y, r: width / 2, color });
      } else if (type === 'image' && path) {
        addObjectToCanvas('image', { x, y, path });
      }
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
            const label = document.createElement('label');
            label.textContent = `${key}:`;
            propertyRow.appendChild(label);

            const input = document.createElement('input');
            input.value = object[key];

            if (typeof object[key] === 'number') {
              input.type = 'number';
              input.addEventListener('change', (e) => {
                object[key] = parseFloat(e.target.value);
                redrawCanvas();
              });
            } else if (key === 'color') {
              input.type = 'color';
              input.addEventListener('change', (e) => {
                object[key] = e.target.value;
                redrawCanvas();
              });
            } else {
              input.addEventListener('change', (e) => {
                object[key] = e.target.value;
                redrawCanvas();
              });
            }

            propertyRow.appendChild(input);
            propertyEditorDiv.appendChild(propertyRow);
          }
        }
      } else {
        const msg = document.createElement('p');
        msg.textContent = 'Виберіть об\'єкт на канвасі для редагування.';
        propertyEditorDiv.appendChild(msg);
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
        } else if (obj.type === 'circle' && Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2) <= obj.r) {
          selectObject(obj);
          return;
        } else if (obj.type === 'text') {
          selectObject(obj);
          return;
        } else if (obj.type === 'image') {
          selectObject(obj);
          return;
        }
      }
      selectObject(null);
    });

    runButton.addEventListener('click', function () {
      const codeToRun = codeEditor.value;
      outputDiv.textContent = "Виконується код...\n";
      try {
        gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        objectsOnCanvas = [];
        const userFunction = new Function('rect', 'circle', 'text', 'image', 'player', codeToRun);
        userFunction(rect, circle, text, image, player);
        redrawCanvas();
      } catch (error) {
        outputDiv.textContent += "\nПомилка виконання: " + error;
      }
    });

    saveButton.addEventListener('click', function () {
      localStorage.setItem('savedCode', codeEditor.value);
      outputDiv.textContent += "Проєкт збережено!\n";
    });

    window.onload = function () {
      const savedCode = localStorage.getItem('savedCode');
      if (savedCode) codeEditor.value = savedCode;
      initC();
      redrawCanvas();
      populatePropertyEditor(null);
};