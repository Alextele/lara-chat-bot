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
    async function waitForElement(iframe) {
        let count_do = 0;
        let myElem = false;
        do {
            await sleep(1000);
            myElem = markAllInteractiveElements(iframe);
            count_do++;
        } while (!myElem && count_do < 5);
        return myElem; // возвращаем найденный элемент или null/undefined после 5 попыток
    }
    const myElem = await waitForElement(iframe);

    if (myElem) {
        const bounds = myElem.getBounds();
        const centerX = bounds.left + bounds.width/2;
        const centerY = bounds.top + bounds.height/2;

        //переносим курсор
        await move_mouse(startX, startY, centerX, centerY, canvas);
        //делаем задержку
        const delay = getRandom(700, 1000);
        await sleep(delay);
        simulateDoubleClick(canvas, centerX, centerY);

        async function waitForFighting() {
            let count_do = 0;
            let myElem = document.querySelector('iframe#main').contentDocument.getElementById('fightCanvas');
            do {
                simulateKeyPress();
                await sleep(1000);
                myElem = document.querySelector('iframe#main').contentDocument.getElementById('fightCanvas');
                count_do++;
            } while (!myElem && count_do < 5);
            return myElem; // возвращаем найденный элемент или null/undefined после 5 попыток
        }
        const fightElem = await waitForFighting();
        // console.log(fightElem);
        if(fightElem) {
            //тут вся логика боя
            // console.log('я тут бой начался');
            await startPressing(centerX, centerY);
        } else {
            console.log('бой пока не обнаружен');
            //если бой не начался, то переводим курсор на охоту
            const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
            const newcenterX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
            const newcenterY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
            await move_mouse(centerX, centerY, newcenterX, newcenterY, document.getElementById('top_mnu'));
            //клацаем и запускаем новый процесс
            top_click();
        }
    } else {
        // console.error('не найдена жертва');
        //если бой не начался, то переводим курсор на охоту
        const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
        const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
        const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
        await move_mouse(startX, startY, centerX, centerY, document.getElementById('top_mnu'));
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
        const centerX = rect.left + rect.width / 6;
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
    // console.log('я тут');
    if (keypressTimeout) return;
    // console.log(('я прошел дальше'));
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
                const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
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
            const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
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
        const interactiveElements = [];
        function traverse(container) {
            for (const child of container.children) {
                if (child.interactive && child._frameEvent === "Hunt.ENTER_FRAME" && child.getBounds().top > rect_iframe_hunt.height*0.1 && child.getBounds().top < rect_iframe_hunt.height*0.8) {
                    interactiveElements.push(child);
                }
                if (child.children) {
                    traverse(child);
                }
            }
        }
        traverse(huntMap.stage);

        if (interactiveElements.length === 0) {
            // console.error('Интерактивные элементы не найдены');
            return false;
        }

        // Проверяем, что массив не пустой
        if (interactiveElements.length > 0) {
            // Генерируем случайный индекс от 0 до длины массива - 1
            const randomIndex = Math.floor(Math.random() * interactiveElements.length);
            return interactiveElements[randomIndex];

        } else {
            // console.log('Массив интерактивных элементов пуст.');
            return false
        }
    } catch (e) {
        // console.error('Ошибка:', e);
        return false;
    }
}
