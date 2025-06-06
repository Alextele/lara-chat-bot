function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//функция переноса курсора мыши canvas тут конечный элемент
async function move_mouse (startX, startY, current_totalX, current_totalY, canvas) {
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

        await sleep(50); // небольшая задержка для плавности
    }
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

    //переносим курсор
    await move_mouse(startX, startY, startAreaX, startAreaY, canvas);

    // Теперь переходим к проверке в центральной области
    const stepsX = 30; // можно увеличить для большей точности
    const stepsY = 30;

    // Шаги по координатам
    const deltaX = areaWidth / stepsX;
    const deltaY = areaHeight / stepsY;

    let finalX = null, finalY = null;

    outerLoop: for (let yStep = 0; yStep <= stepsY; yStep++) {
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
                break outerLoop; // прерываем цикл, координаты уже сохранены
            }
            await sleep(10);
        }
    }

    //тут делаем задержку в пару секунд и далее анализируем начался ли бой (попробуем пару раз нажать)
    simulateKeyPress()
    const delay = getRandom(1800, 2200);
    await sleep(delay);
    simulateKeyPress()
    if(document.querySelector('iframe#main').contentDocument.getElementById('fightCanvas')) {
        //тут вся логика боя
        console.log('я тут бой начался');
        await startPressing(finalX, finalY);

    } else {
        console.log('бой пока не обнаружен');
        //если бой не начался, то переводим курсор на охоту
        const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
        const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
        const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
        await move_mouse(finalX, finalY, centerX, centerY, document.getElementById('top_mnu'));
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

async function startPressing(x, y) {

    if (keypressTimeout) return;
    let click_hp_counter = 0;
    let lastPressTimes = [0, 0, 0, 0, 0]; // Массив для хранения времени последнего нажатия для каждого case
    let first_check = true; // инициализация первого запуска

    async function loop() {
        if (first_check) {
            await sleep(3000);
            simulateKeyPress();
            await sleep(2000);
            first_check = false;
        }
        if(document.lvl.topWindow[1].obj) {
            const fight_log = document.lvl.topWindow[1].obj.innerText ?? '';
            const regex_fight = /проиграл бой/;
            if (regex_fight.test(fight_log)) {
                const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
                const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
                const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
                await move_mouse(x, y, centerX, centerY, document.getElementById('top_mnu'));
                //клацаем
                simulate_click(document.getElementById('top_mnu'), centerX, centerY);
                await sleep(1000);
                simulateKeyPress();
                await loop();
                return true;
            }
        } else {
            clearTimeout(keypressTimeout);
            keypressTimeout = null;
            console.log('бой окончен');
            //кушаем и планируем новый цикл
            const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
            const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
            const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
            setTimeout(() => eat(centerX, centerY), getRandom(900, 1300));
            return;
        }

        let curr_hp = document.lvl.model.hpCur;
        const currentTime = Date.now(); // Получаем текущее время

        if (curr_hp * 1 < 500) {
            switch (true) {
                case (click_hp_counter < 5 && (currentTime - lastPressTimes[0] >= 22000)):
                    simulateKeyPress(51, '3', 'Digit3');
                    lastPressTimes[0] = currentTime; // Обновляем время последнего нажатия
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 10 && (currentTime - lastPressTimes[1] >= 22000)):
                    simulateKeyPress(52, '4', 'Digit4');
                    lastPressTimes[1] = currentTime; // Обновляем время последнего нажатия
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 15 && (currentTime - lastPressTimes[2] >= 22000)):
                    simulateKeyPress(53, '5', 'Digit5');
                    lastPressTimes[2] = currentTime; // Обновляем время последнего нажатия
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 20 && (currentTime - lastPressTimes[3] >= 22000)):
                    simulateKeyPress(54, '6', 'Digit6');
                    lastPressTimes[3] = currentTime; // Обновляем время последнего нажатия
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 25 && (currentTime - lastPressTimes[4] >= 22000)):
                    simulateKeyPress(55, '7', 'Digit7');
                    lastPressTimes[4] = currentTime; // Обновляем время последнего нажатия
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
            }
        }
        if (curr_hp * 1 < 200) {
            const delay = getRandom(900, 1300);
            clearTimeout(keypressTimeout);
            keypressTimeout = setTimeout(loop, delay);
            return;
        }
        simulateKeyPress();
        const delay = getRandom(900, 1300);
        clearTimeout(keypressTimeout);
        keypressTimeout = setTimeout(loop, delay);
    }
    await loop();
}

function stopPressing() {
    clearTimeout(keypressTimeout);
    keypressTimeout = null;
}

async function eat(x,y) {
    clearTimeout(keypressTimeout);
    const curr_hp = document.lvl.model.hpCur;
    if (curr_hp*1 < 500) {
        const element = document.getElementById('items_right_cont');
        const rect = element.getBoundingClientRect();
        const currX = rect.left + rect.width / 4.1;
        const currY = rect.top + rect.height / 4.4;
        //перенесем курсор
        await move_mouse(x, y, currX, currY, element);
        simulate_click(element.querySelector('canvas'), currX, currY);
        await sleep(1000);
        top_click();
    } else {
        await sleep(1000);
        top_click();
    }
}
