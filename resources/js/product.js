function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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
        await sleep(50);
    }
}
async function smoothMoveAndClick(iframe, startX, startY) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
        return;
    }
    const canvas = iframeDoc.querySelector('canvas');
    if (!canvas) {
        return;
    }
    async function waitForElement(iframe) {
        let count_do = 0;
        let myElem = false;
        do {
            await sleep(700);
            myElem = markAllInteractiveElements(iframe);
            count_do++;
        } while (!myElem && count_do < 5);
        return myElem;
    }
    const myElem = await waitForElement(iframe);
    if (myElem) {
        const bounds = myElem.getBounds();
        const centerX = bounds.left + bounds.width/2 + getRandom(-20, 20)*bounds.width/100;
        const centerY = bounds.top + bounds.height/2 + getRandom(-20, 20)*bounds.height/100;
        await move_mouse(startX, startY, centerX, centerY, canvas);
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
            return myElem;
        }
        const fightElem = await waitForFighting();
        if(fightElem) {
            await startPressing(centerX, centerY);
        } else {
            top_click();
        }
    } else {
        const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
        const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
        const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
        await move_mouse(startX, startY, centerX, centerY, document.getElementById('top_mnu'));
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
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));
    target.dispatchEvent(new PointerEvent('pointerdown', options));
    target.dispatchEvent(new PointerEvent('pointerup', options));
    target.dispatchEvent(new MouseEvent('click', options));
    target.dispatchEvent(new MouseEvent('dblclick', options));
}
async function hunt_click(startX, startY) {
    await sleep(700);
    const iframe_hunt = document.getElementById('main');
    const delay = getRandom(400, 800);
    if (iframe_hunt) {
        if (iframe_hunt.contentDocument.title) {
            setTimeout(() => smoothMoveAndClick(iframe_hunt, startX, startY), delay);
        } else {
            setTimeout(() => startPressing(startX, startY), delay);
        }
    } else {
        setTimeout(top_click, delay);
    }
}
function top_click() {
    const canvas_top = document.getElementById('top_mnu');
    if (canvas_top) {
        const rect = canvas_top.getBoundingClientRect();
        const centerX = rect.left + rect.width / 6;
        const centerY = rect.top + rect.height / 2;
        simulate_click(canvas_top, centerX, centerY);
        setTimeout(() => hunt_click(centerX, centerY), 300);
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
function getRandom(min, max) {
    return min + Math.random() * (max - min);
}
function simulateKeyPress(keyCode= 69, key= 'у', code = 'KeyE') {
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
    let lastPressTimes = [0, 0, 0, 0, 0];
    async function waitForElement() {
        let count_do = 0;
        let myElem = document.lvl.topWindow[1].obj ?? false;
        do {
            simulateKeyPress();
            await sleep(1000);
            myElem = document.lvl.topWindow[1].obj ?? false;
            count_do++;
        } while (!myElem && count_do < 5);
        return myElem;
    }
    async function loop() {
        const topWindowElement = await waitForElement();
        if(topWindowElement) {
            const fight_log = topWindowElement.innerText ?? '';
            const regex_fight = /проиграл бой/;
            if (regex_fight.test(fight_log)) {
                const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
                const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
                const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
                await move_mouse(x, y, centerX, centerY, document.getElementById('top_mnu'));
                simulate_click(document.getElementById('top_mnu'), centerX, centerY);
                setTimeout(() => loop(), getRandom(600, 1000));
                return;
            }
        } else {
            clearTimeout(keypressTimeout);
            keypressTimeout = null;
            const top_menu_canvas_rect = document.getElementById('top_mnu').getBoundingClientRect();
            const centerX = top_menu_canvas_rect.left + top_menu_canvas_rect.width / 6;
            const centerY = top_menu_canvas_rect.top + top_menu_canvas_rect.height / 2;
            setTimeout(() => eat(centerX, centerY), getRandom(900, 1300));
            return;
        }
        let curr_hp = document.lvl.model.hpCur;
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
        await move_mouse(x, y, currX, currY, element);
        simulate_click(element.querySelector('canvas'), currX, currY);
        await sleep(500);
        top_click();
    } else {
        setTimeout(() => hunt_click(x,y), getRandom(900, 1300));
    }
}
function markAllInteractiveElements(iframe_hunt) {
    const rect_iframe_hunt = iframe_hunt.getBoundingClientRect();
    try {
        const iframeDoc = iframe_hunt.contentWindow.document;
        const huntCanvas = iframeDoc.getElementById('huntCanvas');
        if (!huntCanvas) {
            return false;
        }
        const huntMap = iframeDoc.hunt_map;
        if (!huntMap || !huntMap.stage) {
            return false;
        }
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
            return false;
        }
        if (interactiveElements.length > 0) {
            const randomIndex = Math.floor(Math.random() * interactiveElements.length);
            return interactiveElements[randomIndex];
        } else {
            return false
        }
    } catch (e) {
        return false;
    }
}
let keypressTimeout = null;
top_click();
