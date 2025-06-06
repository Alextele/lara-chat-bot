function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulateKeyPress(keyCode = 69, key = 'у', code = 'KeyE') {
    const eventOptions = {
        key,
        code,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
    };
    try {
        document.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        document.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    } catch (e) {
        console.warn('KeyboardEvent not supported:', e);
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
        button: 0
    };
    try {
        target.dispatchEvent(new PointerEvent('pointerdown', options));
        target.dispatchEvent(new PointerEvent('pointerup', options));
        target.dispatchEvent(new MouseEvent('click', options));
    } catch (e) {
        console.warn('Click events not supported:', e);
    }
}

function simulateDoubleClick(target, x, y) {
    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true
    };
    try {
        target.dispatchEvent(new PointerEvent('pointerdown', options));
        target.dispatchEvent(new PointerEvent('pointerup', options));
        target.dispatchEvent(new MouseEvent('click', options));
        target.dispatchEvent(new PointerEvent('pointerdown', options));
        target.dispatchEvent(new PointerEvent('pointerup', options));
        target.dispatchEvent(new MouseEvent('click', options));
        target.dispatchEvent(new MouseEvent('dblclick', options));
        console.log('Double click simulated at', x, y);
    } catch (e) {
        console.warn('Double click events not supported:', e);
    }
}

async function move_mouse(startX, startY, endX, endY, canvas) {
    const initialSteps = 50;
    const initialDeltaX = (endX - startX) / initialSteps;
    const initialDeltaY = (endY - startY) / initialSteps;
    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i <= initialSteps; i++) {
        const options = {
            bubbles: true,
            cancelable: true,
            clientX: currentX,
            clientY: currentY,
            pointerType: 'mouse',
            isPrimary: true
        };
        try {
            canvas.dispatchEvent(new PointerEvent('pointermove', options));
            canvas.dispatchEvent(new MouseEvent('mousemove', options));
        } catch (e) {
            console.warn('Mouse move events not supported:', e);
        }
        currentX += initialDeltaX;
        currentY += initialDeltaY;
        await sleep(50);
    }
}

async function eat(x, y) {
    const curr_hp = document.lvl?.model?.hpCur;
    if (curr_hp === undefined) {
        console.error('hpCur не доступен');
        return false;
    }

    if (curr_hp * 1 < 500) {
        const element = document.getElementById('items_right_cont');
        if (!element) {
            console.error('Элемент items_right_cont не найден');
            return false;
        }

        const rect = element.getBoundingClientRect();
        const currX = rect.left + rect.width / 4.1;
        const currY = rect.top + rect.height / 4.4;

        try {
            await move_mouse(x, y, currX, currY, element);
            simulate_click(element.querySelector('canvas') || element, currX, currY);
            await sleep(1000);
            top_click();
            return true;
        } catch (e) {
            console.error('Ошибка в eat:', e);
            return false;
        }
    } else {
        await sleep(1000);
        top_click();
        return true;
    }
}

async function smoothMoveAndClick(iframe, startX, startY) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
        console.error('Невозможно получить document внутри iframe');
        return false;
    }

    const canvas = iframeDoc.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas не найден внутри iframe');
        return false;
    }

    const rect = iframe.getBoundingClientRect();
    const areaWidth = rect.width * 0.6;
    const areaHeight = rect.height * 0.6;
    const startAreaX = rect.left + (rect.width - areaWidth) / 2;
    const startAreaY = rect.top + (rect.height - areaHeight) / 2;

    await move_mouse(startX, startY, startAreaX, startAreaY, canvas);

    const stepsX = 30;
    const stepsY = 30;
    const deltaX = areaWidth / stepsX;
    const deltaY = areaHeight / stepsY;
    let finalX = null, finalY = null;

    outerLoop: for (let yStep = 0; yStep <= stepsY; yStep++) {
        let currentY = startAreaY + yStep * deltaY;
        for (let xStep = 0; xStep <= stepsX; xStep++) {
            let currentX = startAreaX + xStep * deltaX;
            finalX = currentX;
            finalY = currentY;

            const options = {
                bubbles: true,
                cancelable: true,
                clientX: currentX,
                clientY: currentY,
                pointerType: 'mouse',
                isPrimary: true
            };

            try {
                canvas.dispatchEvent(new PointerEvent('pointermove', options));
                canvas.dispatchEvent(new MouseEvent('mousemove', options));
                let cursorStyle = window.getComputedStyle(canvas).cursor;
                console.log('Cursor style:', cursorStyle);

                if (cursorStyle === 'pointer') {
                    console.log('Cursor pointer detected at', currentX, currentY);
                    simulateDoubleClick(canvas, currentX, currentY);
                    break outerLoop;
                }
            } catch (e) {
                console.warn('Mouse events not supported:', e);
            }
            await sleep(10);
        }
    }

    await sleep(getRandom(1800, 2200));
    simulateKeyPress();
    await sleep(getRandom(1800, 2200));
    simulateKeyPress();

    const mainIframe = document.querySelector('iframe#main');
    const fightCanvas = mainIframe?.contentDocument?.getElementById('fightCanvas');
    if (fightCanvas) {
        console.log('Бой начался');
        await startPressing(finalX, finalY);
        return true;
    } else {
        console.log('Бой не обнаружен');
        const top_menu = document.getElementById('top_mnu');
        if (top_menu) {
            const top_menu_canvas_rect = top_menu.getBoundingClientRect();
            const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
            const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
            await move_mouse(finalX, finalY, centerX, centerY, top_menu);
            top_click();
        }
        return false;
    }
}

async function hunt_click(startX, startY) {
    await sleep(1000);
    const iframe_hunt = document.getElementById('main');
    if (iframe_hunt) {
        await smoothMoveAndClick(iframe_hunt, startX, startY);
    } else {
        setTimeout(top_click, getRandom(800, 1200));
    }
}

function top_click() {
    const canvas_top = document.getElementById('top_mnu');
    if (canvas_top) {
        const rect = canvas_top.getBoundingClientRect();
        const centerX = rect.left + rect.width / 3.55;
        const centerY = rect.top + rect.height / 2;
        simulate_click(canvas_top, centerX, centerY);
        hunt_click(centerX, centerY);
    }
}

let keypressTimeout = null;

async function startPressing(x, y) {
    if (keypressTimeout) {
        console.log('startPressing уже запущен, пропускаем');
        return false;
    }

    let click_hp_counter = 0;
    let lastPressTimes = [0, 0, 0, 0, 0];
    let first_check = true;
    let isFightEnded = false;

    async function loop() {
        if (isFightEnded) {
            console.log('Бой окончен, цикл завершён');
            return false;
        }

        if (first_check) {
            await sleep(3000);
            simulateKeyPress();
            await sleep(2000);
            first_check = false;
        }

        const topWindowObj = document.lvl?.topWindow?.[1]?.obj;
        if (topWindowObj) {
            const fight_log = topWindowObj.innerText ?? '';
            if (/проиграл бой/.test(fight_log)) {
                const top_menu = document.getElementById('top_mnu');
                if (!top_menu) {
                    console.error('top_mnu не найден');
                    isFightEnded = true;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = null;
                    return false;
                }

                const top_menu_canvas_rect = top_menu.getBoundingClientRect();
                const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
                const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
                await move_mouse(x, y, centerX, centerY, top_menu);
                simulate_click(top_menu, centerX, centerY);
                await sleep(1000);
                simulateKeyPress();

                isFightEnded = true;
                clearTimeout(keypressTimeout);
                keypressTimeout = null;
                console.log('Бой окончен, запускаем eat');
                setTimeout(() => eat(centerX, centerY), getRandom(900, 1300));
                return true;
            }
        } else {
            isFightEnded = true;
            clearTimeout(keypressTimeout);
            keypressTimeout = null;
            console.log('Бой окончен, запускаем eat');
            const top_menu = document.getElementById('top_mnu');
            if (top_menu) {
                const top_menu_canvas_rect = top_menu.getBoundingClientRect();
                const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 3.55;
                const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
                setTimeout(() => eat(centerX, centerY), getRandom(900, 1300));
            }
            return false;
        }

        const curr_hp = document.lvl?.model?.hpCur;
        if (curr_hp === undefined) {
            console.error('hpCur не доступен');
            isFightEnded = true;
            clearTimeout(keypressTimeout);
            keypressTimeout = null;
            return false;
        }

        const currentTime = Date.now();
        if (curr_hp * 1 < 500) {
            switch (true) {
                case (click_hp_counter < 5 && (currentTime - lastPressTimes[0] >= 22000)):
                    simulateKeyPress(51, '3', 'Digit3');
                    lastPressTimes[0] = currentTime;
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 10 && (currentTime - lastPressTimes[1] >= 22000)):
                    simulateKeyPress(52, '4', 'Digit4');
                    lastPressTimes[1] = currentTime;
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 15 && (currentTime - lastPressTimes[2] >= 22000)):
                    simulateKeyPress(53, '5', 'Digit5');
                    lastPressTimes[2] = currentTime;
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 20 && (currentTime - lastPressTimes[3] >= 22000)):
                    simulateKeyPress(54, '6', 'Digit6');
                    lastPressTimes[3] = currentTime;
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                case (click_hp_counter < 25 && (currentTime - lastPressTimes[4] >= 22000)):
                    simulateKeyPress(55, '7', 'Digit7');
                    lastPressTimes[4] = currentTime;
                    click_hp_counter += 1;
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
                default:
                    clearTimeout(keypressTimeout);
                    keypressTimeout = setTimeout(loop, getRandom(900, 1300));
                    break;
            }
        } else if (curr_hp * 1 < 200) {
            clearTimeout(keypressTimeout);
            keypressTimeout = setTimeout(loop, getRandom(900, 1300));
        } else {
            simulateKeyPress();
            clearTimeout(keypressTimeout);
            keypressTimeout = setTimeout(loop, getRandom(900, 1300));
        }
        return true;
    }

    try {
        await loop();
        return true;
    } catch (e) {
        console.error('Ошибка в startPressing:', e);
        clearTimeout(keypressTimeout);
        keypressTimeout = null;
        return false;
    }
}

function stopPressing() {
    clearTimeout(keypressTimeout);
    keypressTimeout = null;
    console.log('startPressing остановлен');
}

function draw_dot(x, y) {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = `${x - 4}px`;
    dot.style.top = `${y - 4}px`;
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = 'red';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = '9999';
    document.body.appendChild(dot);
}

top_click();
