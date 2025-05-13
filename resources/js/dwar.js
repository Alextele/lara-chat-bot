(function () {
    const CLICKER_CODE = `
        (function () {
            let canvas = null;
            let clickTimeout = null;
            let lastX = 0;
            let lastY = 0;

            function getRandom(min, max) {
                return min + Math.random() * (max - min);
            }

            function moveMouseSmoothly(targetX, targetY, steps = 8, delay = 5, callback) {
                const dx = (targetX - lastX) / steps;
                const dy = (targetY - lastY) / steps;
                let currentStep = 0;

                function step() {
                    currentStep++;
                    const x = lastX + dx * currentStep;
                    const y = lastY + dy * currentStep;

                    const moveEvent = new PointerEvent('pointermove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                        pointerType: 'mouse',
                        isPrimary: true,
                    });
                    document.dispatchEvent(moveEvent);

                    if (currentStep < steps) {
                        setTimeout(step, delay + getRandom(1, 3));
                    } else {
                        lastX = targetX;
                        lastY = targetY;
                        callback();
                    }
                }

                step();
            }

            function simulateClick(target) {
                const rect = target.getBoundingClientRect();
                const x = rect.left + target.width * 0.5 + target.width * getRandom(0.07, 0.11);
                const y = rect.top + target.height * getRandom(0.54, 0.58);

                moveMouseSmoothly(x, y, getRandom(6, 12), getRandom(5, 10), () => {
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
                });
            }

            function startClicking(targetCanvas) {
                if (clickTimeout) return;

                canvas = targetCanvas;
                canvas.style.touchAction = 'none';
                canvas.style.cursor = 'pointer';

                function clickLoop() {
                    if (!document.body.contains(canvas)) {
                        stopClicking();
                        return;
                    }
                    simulateClick(canvas);
                    const delay = getRandom(900, 1300);
                    clickTimeout = setTimeout(clickLoop, delay);
                }

                clickLoop();
            }

            function stopClicking() {
                clearTimeout(clickTimeout);
                clickTimeout = null;
                canvas = null;
            }

            function waitLoop() {
                const fightCanvas = document.getElementById('fightCanvas');
                if (fightCanvas) {
                    const targetCanvas = fightCanvas.querySelector('canvas');
                    if (targetCanvas) {
                        startClicking(targetCanvas);
                        return;
                    }
                }
                requestAnimationFrame(waitLoop);
            }

            waitLoop();
        })();
    `;

    function injectClicker(iframe) {
        try {
            const iframeWindow = iframe.contentWindow;
            const iframeDoc = iframe.contentDocument || iframeWindow.document;

            const isFight = iframe.src.includes('fight.php') || iframe.contentWindow.location.href.includes('fight.php');
            if (!isFight) return;

            const script = iframeDoc.createElement('script');
            script.textContent = CLICKER_CODE;
            iframeDoc.documentElement.appendChild(script);
        } catch (err) {
            // Молча игнорировать ошибки
        }
    }

    function waitForIframe() {
        const iframe = document.querySelector('iframe#main');
        if (iframe && iframe.contentWindow && iframe.contentDocument) {
            iframe.addEventListener('load', () => {
                setTimeout(() => injectClicker(iframe), 200);
            });
        } else {
            setTimeout(waitForIframe, 500);
        }
    }

    waitForIframe();
})();
