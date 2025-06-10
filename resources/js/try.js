function checkCanvasFunctionality(canvas, x, y) {
    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true
    };

    try {
        // Отправляем событие pointermove
        canvas.dispatchEvent(new PointerEvent('pointermove', options));
        canvas.dispatchEvent(new MouseEvent('mousemove', options));

        // Проверяем стиль курсора
        const cursorStyle = window.getComputedStyle(canvas).cursor;
        console.log(document.elementFromPoint(x, y));
        console.log(`Cursor at (${x}, ${y}): ${cursorStyle}`);

        // Дополнительно: можно попробовать отправить событие click и наблюдать за реакцией
        return { x, y, cursor: cursorStyle };
    } catch (e) {
        console.warn('Mouse events not supported:', e);
        return { x, y, cursor: 'error' };
    }
}

const canvas_top = document.getElementById('top_mnu');
if (canvas_top) {
    const rect = canvas_top.getBoundingClientRect();
    const centerX = rect.left + rect.width / 3.55;
    const centerY = rect.top + rect.height / 2;
    const result = checkCanvasFunctionality(canvas_top, centerX, centerY);
    console.log('Functionality at point:', result);
}


console.log(document.elementFromPoint(centerX, centerY));


function checkCursorAtPoint(canvas, x, y) {
    if (!canvas) {
        console.error('Canvas не передан');
        return { x, y, cursor: 'error' };
    }

    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true
    };

    try {
        // Отправляем события на canvas и document
        canvas.dispatchEvent(new PointerEvent('pointermove', options));
        canvas.dispatchEvent(new MouseEvent('mousemove', options));
        document.dispatchEvent(new PointerEvent('pointermove', options));
        document.dispatchEvent(new MouseEvent('mousemove', options));

        // Проверяем стиль курсора
        const cursorStyle = window.getComputedStyle(canvas).cursor;
        console.log(document.elementFromPoint(x,y));
        return { x, y, cursor: cursorStyle };
    } catch (e) {
        console.warn('Mouse events not supported:', e);
        return { x, y, cursor: 'error' };
    }
}
const canvas_top = document.getElementById('top_mnu');
const rect = canvas_top.getBoundingClientRect();
const centerX = rect.left + rect.width / 3.55;
const centerY = rect.top + rect.height / 2;
checkCursorAtPoint(canvas_top, centerX, centerY);


const iframe_hunt = document.getElementById('main');
const iframeDoc = iframe_hunt.contentWindow.document;
console.log(iframeDoc.hunt_map.stage.children);
