function markAllInteractiveElements() {
    const iframe_hunt = document.getElementById('main');
    if (!iframe_hunt) {
        console.error('iframe с id="main" не найден');
        return;
    }
    const rect_iframe_hunt = iframe_hunt.getBoundingClientRect();
    const rect_iframe_hunt_x = rect_iframe_hunt.left;
    const rect_iframe_hunt_y = rect_iframe_hunt.top;
    console.log(rect_iframe_hunt.height, rect_iframe_hunt_x, rect_iframe_hunt_y);


    try {
        const iframeDoc = iframe_hunt.contentWindow.document;
        const huntCanvas = iframeDoc.getElementById('huntCanvas');
        if (!huntCanvas) {
            console.error('huntCanvas не найден');
            return;
        }

        const huntMap = iframeDoc.hunt_map;
        if (!huntMap || !huntMap.stage) {
            console.error('hunt_map или stage не найдены');
            return;
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
            console.error('Интерактивные элементы не найдены');
            return;
        }

        // Получаем CSS-стили canvas
        const canvasRect = huntCanvas.getBoundingClientRect();
        const canvasStyle = iframeDoc.defaultView.getComputedStyle(huntCanvas);
        const cssWidth = parseFloat(canvasStyle.width) || canvasRect.width;
        const cssHeight = parseFloat(canvasStyle.height) || canvasRect.height;

        // Функция draw_dot
        // const draw_dot = (x, y, parentDoc, num = 1) => {
        //     const dot = parentDoc.createElement('div');
        //     dot.style.position = 'absolute';
        //     dot.style.left = `${x - 4}px`;
        //     dot.style.top = `${y - 4}px`;
        //     dot.style.width = '8px';
        //     dot.style.height = '8px';
        //     dot.style.backgroundColor = 'red';
        //     dot.style.borderRadius = '50%';
        //     dot.style.zIndex = '9999';
        //     dot.textContent = num;
        //     parentDoc.body.appendChild(dot);
        // };


        let num_elem = 1;
        // Обрабатываем каждый интерактивный элемент
        // const areas = interactiveElements.map((element, index) => {
        //     const bounds = element.getBounds();
        //     const centerX = bounds.left + bounds.width/2;
        //     const centerY = bounds.top + bounds.height/2;
        //
        //     // Преобразуем координаты сцены (0–1500) в координаты canvas
        //     // const canvasX = (centerX / 1500) * cssWidth;
        //     // const canvasY = (centerY / 1500) * cssHeight;
        //
        //     // Рисуем точку
        //     draw_dot(centerX, centerY, iframeDoc, num_elem);
        //     num_elem++;
        //
        //     // Экранные координаты для move_mouse
        //     // const iframeRect = iframe_hunt.getBoundingClientRect();
        //     // const screenX = iframeRect.left + canvasRect.left + canvasX;
        //     // const screenY = iframeRect.top + canvasRect.top + canvasY;
        //
        //     console.log(`Интерактивный элемент ${index}:`, element);
        //
        //     // return { index, element, canvasX, canvasY, screenX, screenY };
        // });


        // Проверяем, что массив не пустой
        if (interactiveElements.length > 0) {
            // Генерируем случайный индекс от 0 до длины массива - 1
            const randomIndex = Math.floor(Math.random() * interactiveElements.length);
            // Получаем случайный элемент
            const randomElement = interactiveElements[randomIndex];

            const bounds = randomElement.getBounds();
            const centerX = bounds.left + bounds.width/2;
            const centerY = bounds.top + bounds.height/2;

            setTimeout(() => {
                simulateDoubleClick(huntCanvas.querySelector('canvas'), centerX, centerY);
            }, getRandom(900, 1300));
        } else {
            // console.log('Массив интерактивных элементов пуст.');
        }
        // console.log(`Найдено ${interactiveElements.length} интерактивных элементов`);
        return true;
    } catch (e) {
        // console.error('Ошибка:', e);
        return null;
    }
}

markAllInteractiveElements();

function simulateDoubleClick(target, x, y) {
    const options = {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerType: 'mouse',
        isPrimary: true,
    };

    // target.style.cursor = 'pointer';

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

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

