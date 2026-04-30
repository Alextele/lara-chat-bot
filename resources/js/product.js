// ── Constants ──────────────────────────────────────────────────────────────
const MOVE_STEPS     = 50;
const MOVE_STEP_MS   = 50;
const HUNT_WAIT_MS   = 700;
const FIGHT_WAIT_MS  = 1000;
const WAIT_ATTEMPTS  = 5;
const LOOP_MIN_MS    = 900;
const LOOP_MAX_MS    = 1300;
const HP_LOW         = 500;
const HP_CRITICAL    = 200;
const POTION_CD_MS   = 22000;
const HUNT_TOP_RATIO = 0.1;
const HUNT_BOT_RATIO = 0.8;
const ITEM_X_RATIO   = 4.1;
const ITEM_Y_RATIO   = 4.4;

const POTION_SLOTS = [
    { keyCode: 51, key: '3', code: 'Digit3', maxUses: 5  },
    { keyCode: 52, key: '4', code: 'Digit4', maxUses: 10 },
    { keyCode: 53, key: '5', code: 'Digit5', maxUses: 15 },
    { keyCode: 54, key: '6', code: 'Digit6', maxUses: 20 },
    { keyCode: 55, key: '7', code: 'Digit7', maxUses: 25 },
];

let keypressTimeout = null;

// ── Helpers ────────────────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

function makePointerOptions(x, y) {
    return { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerType: 'mouse', isPrimary: true };
}

async function waitForCondition(checkFn, intervalMs, maxAttempts, sideEffect = null) {
    let attempts = 0;
    let result = false;
    do {
        if (sideEffect) sideEffect();
        await sleep(intervalMs);
        result = checkFn();
        attempts++;
    } while (!result && attempts < maxAttempts);
    return result;
}

function getTopMenuCenter() {
    const rect = document.getElementById('top_mnu').getBoundingClientRect();
    return { x: rect.left + rect.width / 6, y: rect.top + rect.height / 2 };
}

// ── Input simulation ───────────────────────────────────────────────────────
async function move_mouse(startX, startY, endX, endY, canvas) {
    const deltaX = (endX - startX) / MOVE_STEPS;
    const deltaY = (endY - startY) / MOVE_STEPS;
    let currentX = startX;
    let currentY = startY;
    for (let i = 0; i <= MOVE_STEPS; i++) {
        const opts = makePointerOptions(currentX, currentY);
        canvas.dispatchEvent(new PointerEvent('pointermove', opts));
        canvas.dispatchEvent(new MouseEvent('mousemove', opts));
        currentX += deltaX;
        currentY += deltaY;
        await sleep(MOVE_STEP_MS);
    }
}

function simulate_click(target, x, y) {
    const opts = makePointerOptions(x, y);
    target.dispatchEvent(new PointerEvent('pointerdown', opts));
    target.dispatchEvent(new PointerEvent('pointerup', opts));
    target.dispatchEvent(new MouseEvent('click', opts));
}

function simulateDoubleClick(target, x, y) {
    const opts = makePointerOptions(x, y);
    target.dispatchEvent(new PointerEvent('pointerdown', opts));
    target.dispatchEvent(new PointerEvent('pointerup', opts));
    target.dispatchEvent(new MouseEvent('click', opts));
    target.dispatchEvent(new PointerEvent('pointerdown', opts));
    target.dispatchEvent(new PointerEvent('pointerup', opts));
    target.dispatchEvent(new MouseEvent('click', opts));
    target.dispatchEvent(new MouseEvent('dblclick', opts));
}

function simulateKeyPress(keyCode = 69, key = 'у', code = 'KeyE') {
    const opts = { key, code, keyCode, which: keyCode, bubbles: true, cancelable: true };
    document.dispatchEvent(new KeyboardEvent('keydown', opts));
    document.dispatchEvent(new KeyboardEvent('keyup', opts));
}

// ── Top menu ───────────────────────────────────────────────────────────────
function top_click() {
    const canvas_top = document.getElementById('top_mnu');
    if (!canvas_top) return;
    const { x, y } = getTopMenuCenter();
    simulate_click(canvas_top, x, y);
    setTimeout(() => hunt_click(x, y), 300);
}

// ── Hunt ───────────────────────────────────────────────────────────────────
function markAllInteractiveElements(iframe_hunt) {
    const iframeHeight = iframe_hunt.getBoundingClientRect().height;
    try {
        const iframeDoc = iframe_hunt.contentWindow.document;
        if (!iframeDoc.getElementById('huntCanvas')) return false;
        const huntMap = iframeDoc.hunt_map;
        if (!huntMap?.stage) return false;

        const interactiveElements = [];
        function traverse(container) {
            for (const child of container.children) {
                const bounds = child.getBounds();
                if (
                    child.interactive &&
                    child._frameEvent === 'Hunt.ENTER_FRAME' &&
                    bounds.top > iframeHeight * HUNT_TOP_RATIO &&
                    bounds.top < iframeHeight * HUNT_BOT_RATIO
                ) {
                    interactiveElements.push(child);
                }
                if (child.children) traverse(child);
            }
        }
        traverse(huntMap.stage);

        if (interactiveElements.length === 0) return false;
        return interactiveElements[Math.floor(Math.random() * interactiveElements.length)];
    } catch (e) {
        return false;
    }
}

async function smoothMoveAndClick(iframe, startX, startY) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) return;
    const canvas = iframeDoc.querySelector('canvas');
    if (!canvas) return;

    const myElem = await waitForCondition(
        () => markAllInteractiveElements(iframe),
        HUNT_WAIT_MS,
        WAIT_ATTEMPTS
    );

    if (myElem) {
        const bounds = myElem.getBounds();
        const centerX = bounds.left + bounds.width / 2 + getRandom(-20, 20) * bounds.width / 100;
        const centerY = bounds.top + bounds.height / 2 + getRandom(-20, 20) * bounds.height / 100;
        await move_mouse(startX, startY, centerX, centerY, canvas);
        simulateDoubleClick(canvas, centerX, centerY);

        const fightElem = await waitForCondition(
            () => iframeDoc.getElementById('fightCanvas'),
            FIGHT_WAIT_MS,
            WAIT_ATTEMPTS,
            simulateKeyPress
        );

        if (fightElem) {
            await startPressing(centerX, centerY);
        } else {
            top_click();
        }
    } else {
        const { x, y } = getTopMenuCenter();
        await move_mouse(startX, startY, x, y, document.getElementById('top_mnu'));
        top_click();
    }
}

async function hunt_click(startX, startY) {
    await sleep(HUNT_WAIT_MS);
    const iframe_hunt = document.getElementById('main');
    const delay = getRandom(400, 800);
    if (!iframe_hunt) {
        setTimeout(top_click, delay);
        return;
    }
    const doc = iframe_hunt.contentDocument;
    if (doc && doc.readyState === 'complete') {
        setTimeout(() => smoothMoveAndClick(iframe_hunt, startX, startY), delay);
    } else {
        setTimeout(() => startPressing(startX, startY), delay);
    }
}

// ── Combat ─────────────────────────────────────────────────────────────────
async function startPressing(x, y) {
    if (keypressTimeout) return;
    let click_hp_counter = 0;
    const lastPressTimes = new Array(POTION_SLOTS.length).fill(0);

    async function loop() {
        const topWindowElement = await waitForCondition(
            () => document.lvl.topWindow[1].obj ?? false,
            FIGHT_WAIT_MS,
            WAIT_ATTEMPTS,
            simulateKeyPress
        );

        if (!topWindowElement) {
            clearTimeout(keypressTimeout);
            keypressTimeout = null;
            const { x: cx, y: cy } = getTopMenuCenter();
            setTimeout(() => eat(cx, cy), getRandom(LOOP_MIN_MS, LOOP_MAX_MS));
            return;
        }

        if (/проиграл бой/.test(topWindowElement.innerText ?? '')) {
            const top_mnu = document.getElementById('top_mnu');
            const { x: cx, y: cy } = getTopMenuCenter();
            await move_mouse(x, y, cx, cy, top_mnu);
            simulate_click(top_mnu, cx, cy);
            keypressTimeout = setTimeout(loop, getRandom(600, 1000));
            return;
        }

        const curr_hp = document.lvl.model.hpCur * 1;
        const now = Date.now();

        if (curr_hp < HP_LOW) {
            for (let i = 0; i < POTION_SLOTS.length; i++) {
                const slot = POTION_SLOTS[i];
                if (click_hp_counter < slot.maxUses && now - lastPressTimes[i] >= POTION_CD_MS) {
                    simulateKeyPress(slot.keyCode, slot.key, slot.code);
                    lastPressTimes[i] = now;
                    click_hp_counter++;
                    break;
                }
            }
        }

        if (curr_hp < HP_CRITICAL) {
            clearTimeout(keypressTimeout);
            keypressTimeout = setTimeout(loop, getRandom(LOOP_MIN_MS, LOOP_MAX_MS));
            return;
        }

        simulateKeyPress();
        clearTimeout(keypressTimeout);
        keypressTimeout = setTimeout(loop, getRandom(LOOP_MIN_MS, LOOP_MAX_MS));
    }

    await loop();
}

// ── Eat ────────────────────────────────────────────────────────────────────
async function eat(x, y) {
    clearTimeout(keypressTimeout);
    const curr_hp = document.lvl.model.hpCur * 1;
    if (curr_hp < HP_LOW) {
        const element = document.getElementById('items_right_cont');
        const rect = element.getBoundingClientRect();
        const currX = rect.left + rect.width / ITEM_X_RATIO;
        const currY = rect.top + rect.height / ITEM_Y_RATIO;
        await move_mouse(x, y, currX, currY, element);
        simulate_click(element.querySelector('canvas'), currX, currY);
        await sleep(500);
        top_click();
    } else {
        setTimeout(() => hunt_click(x, y), getRandom(LOOP_MIN_MS, LOOP_MAX_MS));
    }
}

// ── Entry point ────────────────────────────────────────────────────────────
top_click();