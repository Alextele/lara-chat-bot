function markAllInteractiveElements(iframe_hunt) {
    const rect_iframe_hunt = iframe_hunt.getBoundingClientRect();
    try {
        const iframeDoc = iframe_hunt.contentWindow.document;
        const huntCanvas = iframeDoc.getElementById('huntCanvas');
        if (!huntCanvas) {
            return [];
        }
        const huntMap = iframeDoc.hunt_map;
        if (!huntMap || !huntMap.stage) {
            return [];
        }
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
        console.log(e);
        return [];
    }
}
function getRandom(min, max) {
    return min + Math.random() * (max - min);
}
async function move_mouse (startX, startY, current_totalX, current_totalY, canvas) {
    const initialSteps = 10;
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
async function sobiraemCveti(delay_sbor = 21, startX = 750, startY = 200) {
    await sleep(1000);
    let effects = document.lvl.topWindow.temp_effects;
    if (Object.keys(effects).length !== 0) {
        for (const effect of Object.values(effects)) {
            if (effect.title === 'Заноза') {
                return;
            }
        }
    }
    let real_delay = delay_sbor * 1000;
    await move_mouse(startX, startY, startX + getRandom(-10, 10), startY + getRandom(-10, 10), document.getElementById('main').contentWindow.document.querySelector('canvas'));
    let elements = markAllInteractiveElements(document.getElementById('main'));
    const delay = getRandom(300, 600);
    if (!elements.length) {
        const canvas_top = document.getElementById('top_mnu');
        const rect = canvas_top.getBoundingClientRect();
        const centerX = rect.left + rect.width / 6;
        const centerY = rect.top + rect.height / 2;
        // await move_mouse(startX, startY, centerX, centerY, canvas_top);
        simulate_click(canvas_top, centerX, centerY);
        setTimeout(() => sobiraemCveti(delay_sbor, centerX, centerY), delay);
        return;
    }
    let myElement = elements[Math.floor(Math.random() * elements.length)];
    let bounds = myElement.getBounds();
    let centerX = bounds.left + bounds.width/2 + getRandom(-20, 20)*bounds.width/100;
    let centerY = bounds.top + bounds.height/2 + getRandom(-20, 20)*bounds.height/100;
    // await move_mouse(startX, startY, centerX, centerY, document.getElementById('main').contentWindow.document.querySelector('canvas'));
    simulateDoubleClick(document.getElementById('main').contentWindow.document.querySelector('canvas'), centerX, centerY);
    await sleep(real_delay);
    let close_elem = find_text(document.getElementById('main').contentWindow.document.hunt_map.stage)[0];
    if (close_elem){
        let bounds_close_elem = close_elem.getBounds();
        centerX = bounds_close_elem.left + bounds_close_elem.width/2 + getRandom(-20, 20)*bounds_close_elem.width/100;
        centerY = bounds_close_elem.top + bounds_close_elem.height/2 + getRandom(-20, 20)*bounds_close_elem.height/100;
        // await move_mouse(startX, startY, centerX, centerY, document.getElementById('main').contentWindow.document.querySelector('canvas'));
        simulate_click(document.getElementById('main').contentWindow.document.querySelector('canvas'), centerX, centerY);
    }
    setTimeout(() => sobiraemCveti(delay_sbor, centerX, centerY), delay);
}
