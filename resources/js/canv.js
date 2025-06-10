function triggerDoubleClickOn10thInteractive() {
    const iframe_hunt = document.getElementById('main');
    if (!iframe_hunt) {
        console.error('iframe с id="main" не найден');
        return;
    }

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
                if (child.interactive) {
                    interactiveElements.push(child);
                }
                if (child.children) {
                    traverse(child);
                }
            }
        }
        traverse(huntMap.stage);

        if (interactiveElements.length < 10) {
            console.error(`Найдено только ${interactiveElements.length} интерактивных элементов, требуется 10`);
            return;
        }

        // Выбираем 10-й интерактивный элемент (индекс 9)
        const targetElement = interactiveElements[9];
        console.log('10-й интерактивный элемент:', {
            name: targetElement.name || 'unknown',
            bounds: targetElement.getBounds()
        });

        // Получаем координаты для визуализации
        const bounds = targetElement.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        // Преобразуем в координаты canvas
        const canvasRect = huntCanvas.getBoundingClientRect();
        const canvasStyle = iframeDoc.defaultView.getComputedStyle(huntCanvas);
        const cssWidth = parseFloat(canvasStyle.width) || canvasRect.width;
        const cssHeight = parseFloat(canvasStyle.height) || canvasRect.height;
        const canvasX = (centerX / 1500) * cssWidth;
        const canvasY = (centerY / 1500) * cssHeight;

        // Рисуем точку внутри iframe
        const draw_dot = (x, y, parentDoc) => {
            const dot = parentDoc.createElement('div');
            dot.style.position = 'absolute';
            dot.style.left = `${x - 4}px`;
            dot.style.top = `${y - 4}px`;
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.backgroundColor = 'red';
            dot.style.borderRadius = '50%';
            dot.style.zIndex = '9999';
            parentDoc.body.appendChild(dot);
        };
        draw_dot(canvasX, canvasY, iframeDoc);

        // Эмулируем двойной клик через Pixi.js
        const emitDoubleClick = () => {
            // Имитируем два последовательных pointerdown/pointerup
            targetElement.emit('pointerdown', { data: { global: { x: centerX, y: centerY } } });
            targetElement.emit('pointerup', { data: { global: { x: centerX, y: centerY } } });
            setTimeout(() => {
                targetElement.emit('pointerdown', { data: { global: { x: centerX, y: centerY } } });
                targetElement.emit('pointerup', { data: { global: { x: centerX, y: centerY } } });
                targetElement.emit('click', { data: { global: { x: centerX, y: centerY } } }); // Для совместимости
            }, 50); // Задержка между кликами
        };

        // Альтернатива: синтетическое событие на canvas
        const dispatchCanvasDoubleClick = () => {
            const event = new PointerEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                clientX: canvasRect.left + canvasX,
                clientY: canvasRect.top + canvasY,
                isTrusted: false // Не можем сделать trusted
            });
            huntCanvas.dispatchEvent(event);
        };

        // Выполняем Pixi.js эмуляцию (менее вероятно вызовет серверный запрос)
        emitDoubleClick();

        // Интеграция с move_mouse
        const iframeRect = iframe_hunt.getBoundingClientRect();
        const screenX = iframeRect.left + canvasRect.left + canvasX;
        const screenY = iframeRect.top + canvasRect.top + canvasY;
        // move_mouse(screenX, screenY, screenX, screenY, huntCanvas);

        return { canvasX, canvasY, screenX, screenY };
    } catch (e) {
        console.error('Ошибка:', e);
        return null;
    }
}

triggerDoubleClickOn10thInteractive();
