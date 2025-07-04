function markAllInteractiveElements(iframe_hunt) {
    const rect_iframe_hunt = iframe_hunt.getBoundingClientRect();
    try {
        const iframeDoc = iframe_hunt.contentWindow.document;
        const huntCanvas = iframeDoc.getElementById('huntCanvas');
        if (!huntCanvas) {
            // console.error('huntCanvas не найден');
            return false;
        }

        const huntMap = iframeDoc.hunt_map;
        if (!huntMap || !huntMap.stage) {
            // console.error('hunt_map или stage не найдены');
            return false;
        }

        // Собираем все интерактивные элементы
        let interactiveElements = [];

        function traverse(container) {
            for (const child of container.children) {
                if (child.interactive && child._frameEvent === "Hunt.ENTER_FRAME" && Object.keys(child._trackedPointers).length === 0 && child.getBounds().top > rect_iframe_hunt.height * 0.1 && child.getBounds().top < rect_iframe_hunt.height * 0.8) {
                    interactiveElements.push(child);
                }
                if (child.children) {
                    traverse(child);
                }
            }
        }

        traverse(huntMap.stage);
        return interactiveElements;
    } catch (e) {
        // console.error('Ошибка:', e);
        return false;
    }
}

function find_text(container, arr = []) {
    for (const child of container.children) {
        if (child._text === 'закрыть') {
            arr.push(child);
        }
        if (child.children) {
            find_text(child, arr)
        }
    }
    return arr;
}

console.log(find_text(document.getElementById('main').contentWindow.document.hunt_map.stage));

console.log(markAllInteractiveElements(document.getElementById('main')));
console.log(document.getElementById('main').contentWindow.document.hunt_map.stage);
document.lvl.topWindow.temp_effects;

// Функция draw_dot
const draw_dot = (x, y, parentDoc) => {
    const dot = parentDoc.createElement('div');
    dot.style.position = 'absolute';
    dot.style.left = `${x - 4}px`;
    dot.style.top = `${y - 4}px`;
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = 'red';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = '9999';
    parentDoc.body.appendChild(dot);
};

let my_elem = find_text(document.getElementById('main').contentWindow.document.hunt_map.stage)[0];
let bounds = my_elem.getBounds();
let centerX = bounds.left + bounds.width/2;
let centerY = bounds.top + bounds.height/2;
console.log(centerX);
console.log(centerY);
draw_dot(centerX, centerY, document.getElementById('main').contentWindow.document);

function simulate_click(target, x, y) {
    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true,
    };
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
    }));
}
simulate_click(document.getElementById('main').contentWindow.document.querySelector('canvas'), centerX, centerY);


async function move_mouse (startX, startY, current_totalX, current_totalY, canvas) {
    const initialSteps = 50;
    const initialDeltaX = (current_totalX - startX) / initialSteps;
    const initialDeltaY = (current_totalY - startY) / initialSteps;
    let currentX = startX;
    let currentY = startY;
    for (let i = 0; i <= initialSteps; i++) {
        const options = {
            bubbles: true,
            cancelable: true,
            clientX: currentX,
            clientY: currentY,
            pointerType: 'mouse',
            isPrimary: true,
        };
        canvas.dispatchEvent(new PointerEvent('pointermove', options));
        canvas.dispatchEvent(new MouseEvent('mousemove', options));
        currentX += initialDeltaX;
        currentY += initialDeltaY;
        await sleep(50); // небольшая задержка для плавности
    }
}

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

function simulateDoubleClick(target, x, y) {
    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true,
    };
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));
    target.dispatchEvent(new MouseEvent('dblclick', options));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sobiraemCveti(startX = 750, startY = 200) {
    //сперва найдем все не занятые цветы
    let elements = markAllInteractiveElements(document.getElementById('main'));
    //если не нашли, то клацаем на охоту и хреначим рекурсию
    if (!elements) {
        //сперва переведем курсор
        const canvas_top = document.getElementById('top_mnu');
        const rect = canvas_top.getBoundingClientRect();
        const centerX = rect.left + rect.width / 6;
        const centerY = rect.top + rect.height / 2;
        await move_mouse(startX, startY, centerX, centerY, canvas_top);
        simulate_click(canvas_top, centerX, centerY);
        const delay = getRandom(400, 800);
        setTimeout(() => sobiraemCveti(centerX, centerY), delay);
        return;
    }
    //если элементы есть - берем рандомный
    let myElement = elements[Math.floor(Math.random() * elements.length)];
    let bounds = myElement.getBounds();
    let centerX = bounds.left + bounds.width/2 + getRandom(-20, 20)*bounds.width/100;
    let centerY = bounds.top + bounds.height/2 + getRandom(-20, 20)*bounds.height/100;
    //смещаем курсор
    await move_mouse(startX, startY, centerX, centerY, document.getElementById('main').contentWindow.document.querySelector('canvas'));
    //двойной клик
    simulateDoubleClick(document.getElementById('main').contentWindow.document.querySelector('canvas'), centerX, centerY);
    //ждем 20 сек
    await sleep(20000);
    //проверка, что не всплыло окно о неудачной охоте
    let close_elem = find_text(document.getElementById('main').contentWindow.document.hunt_map.stage)[0];
    if (close_elem){

    }
}
