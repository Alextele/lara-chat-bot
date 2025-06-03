function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothMoveAndClick(canvas, startX, startY) {
    const rect = canvas.getBoundingClientRect();

    // Конечная точка — середина снизу canvas
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height;

    // Количество шагов и задержка между ними (чем больше — тем плавнее)
    const steps = 50;
    const delay = 20; // мс

    // Расчёт приращения координат на шаг
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;

    let currentX = startX;
    let currentY = startY;

    for (let i = 0; i <= steps; i++) {
        // Имитация движения мыши
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

        // Проверяем стиль cursor
        const cursorStyle = window.getComputedStyle(canvas).cursor;

        if (cursorStyle === 'pointer') {
            // Остановить движение, сделать двойной клик по текущим координатам
            console.log('Cursor pointer detected at', currentX, currentY);
            simulateDoubleClick(canvas, currentX, currentY);
            return;
        }

        // Переход к следующей точке
        currentX += deltaX;
        currentY += deltaY;

        await sleep(delay);
    }

    console.log('Cursor pointer не был обнаружен во время движения');
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

    const td = document.getElementById('huntCanvas');
    if (!td) {
        console.error('huntCanvas not found');
        return;
    }

    const canvas = td.querySelector('canvas');
    if (!canvas) {
        console.error('Canvas not found inside huntCanvas');
        return;
    }

    // Запускаем плавное движение и отслеживание cursor
    await smoothMoveAndClick(canvas, startX, startY);
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
