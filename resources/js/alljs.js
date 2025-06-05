function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothMoveAndClick(iframe, startX, startY) {
    // Получаем документ внутри iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
        console.error('Невозможно получить document внутри iframe');
        return;
    }

    // Находим canvas внутри iframe
    const canvas = iframeDoc.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas не найден внутри iframe');
        return;
    }

    const rect = iframe.getBoundingClientRect();

    // Задаём центральную область - 60% ширины и высоты канваса
    const areaWidth = rect.width * 0.6;
    const areaHeight = rect.height * 0.6;

    // Координаты левого верхнего угла центральной области
    const startAreaX = rect.left + (rect.width - areaWidth) / 2;
    const startAreaY = rect.top + (rect.height - areaHeight) / 2;

    //функция переноса курсора мыши
    async function move_mouse (startX, startY, current_totalX, current_totalY) {
        // Количество шагов для первоначального движения
        const initialSteps = 50;
        const initialDeltaX = (current_totalX - startX) / initialSteps;
        const initialDeltaY = (current_totalY - startY) / initialSteps;

        // Первоначальное движение курсора к центральной области
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

            await sleep(10); // небольшая задержка для плавности
        }
    }

    //переносим курсор
    await move_mouse(startX, startY, startAreaX, startAreaY);



    // Теперь переходим к проверке в центральной области
    const stepsX = 30; // можно увеличить для большей точности
    const stepsY = 30;

    // Шаги по координатам
    const deltaX = areaWidth / stepsX;
    const deltaY = areaHeight / stepsY;

    let finalX = null, finalY = null;

    for (let yStep = 0; yStep <= stepsY; yStep++) {
        let currentY = startAreaY + yStep * deltaY;

        for (let xStep = 0; xStep <= stepsX; xStep++) {
            let currentX = startAreaX + xStep * deltaX;

            finalX = currentX; // обновляем при каждой итерации
            finalY = currentY;

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

            let cursorStyle = canvas.style.cursor;
            console.log(cursorStyle);

            if (cursorStyle === 'pointer') {
                console.log('Cursor pointer detected at', currentX, currentY);
                simulateDoubleClick(canvas, currentX, currentY);
                break; // прерываем цикл, координаты уже сохранены
            }

            await sleep(10);
        }
    }

    //тут делаем задержку в пару секунд и далее анализируем начался ли бой (попробуем пару раз нажать)
    simulateKeyPress(69)
    const delay = getRandom(1800, 2200);
    await sleep(delay);
    simulateKeyPress(69)
    if(document.querySelector('iframe#main').contentDocument.getElementById('fightCanvas')) {
        //тут вся логика боя
        startPressing();

    } else {
        //если бой не начался, то переводим курсор на охоту
        const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
        const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
        const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
        await move_mouse(finalX, finalY, centerX, centerY);
        //клацаем и запускаем новый процесс
        top_click();
    }
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

    // Последовательность событий для двойного клика
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));

    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));

    target.dispatchEvent(new MouseEvent('dblclick', options));

    console.log('Double click simulated at', x, y);
}

async function hunt_click(startX, startY) {
    // Задержка 1 секунда
    await sleep(1000);

    const iframe_hunt = document.getElementById('main');
    if (iframe_hunt) {
        // Запускаем плавное движение и отслеживание cursor
        await smoothMoveAndClick(iframe_hunt, startX, startY);
    } else {
        const delay = getRandom(800, 1200);
        setTimeout(top_click, delay);
    }

}


function top_click() {
    const canvas_top = document.getElementById('top_mnu');
    if (canvas_top) {
        // Получить позицию canvas относительно окна (viewport)
        const rect = canvas_top.getBoundingClientRect();

        // Вычислить центр canvas в координатах окна
        const centerX = rect.left + rect.width / 3.55;
        const centerY = rect.top + rect.height / 2;

        // Нарисовать точку
        // draw_dot(centerX, centerY);
        //клацнем
        simulate_click(canvas_top, centerX, centerY);

        // Запуск
        hunt_click(centerX, centerY);
    }
}

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

top_click();

function draw_dot(x, y) {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = `${x - 4}px`; // Исправлено: убраны лишние символы
    dot.style.top = `${y - 4}px`;   // Исправлено: убраны лишние символы
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = 'red';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = 9999;
    document.body.appendChild(dot);
}

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

let keypressTimeout = null;

function simulateKeyPress(keyCode= 69, key= 'у', code = 'KeyE') {
    // const key = 'у';
    // const keyCode = 69; // физическая клавиша E

    const eventOptions = {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
    };

    const keydown = new KeyboardEvent('keydown', eventOptions);
    const keyup = new KeyboardEvent('keyup', eventOptions);

    document.dispatchEvent(keydown);
    document.dispatchEvent(keyup);
}

function startPressing() {
    if (keypressTimeout) return;
    let click_hp_counter = 0;
    function loop() {
        let curr_hp = document.lvl.model.hpCur;
        if (curr_hp*1 < 500) {
            switch (true) {
                case (click_hp_counter < 5):
                    simulateKeyPress(51, '3', 'Digit3');
                    click_hp_counter += 1;
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    return;
                case (click_hp_counter < 10):
                    simulateKeyPress(52, '4', 'Digit4');
                    click_hp_counter += 1;
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    return;
                case (click_hp_counter < 15):
                    simulateKeyPress(53, '5', 'Digit5');
                    click_hp_counter += 1;
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    return;
                case (click_hp_counter < 20):
                    simulateKeyPress(54, '6', 'Digit6');
                    click_hp_counter += 1;
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    return;
                case (click_hp_counter < 25):
                    simulateKeyPress(55, '7', 'Digit7');
                    click_hp_counter += 1;
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    return;
            }
        }
        simulateKeyPress();
        const delay = getRandom(900, 1300);
        keypressTimeout = setTimeout(loop, delay);
    }
    loop();
}

function stopPressing() {
    clearTimeout(keypressTimeout);
    keypressTimeout = null;
}

