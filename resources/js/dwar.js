(function () {
    const CLICKER_CODE = `
        (function () {
            let canvas = null;
            let clickInterval = null;

            function markClick(x, y) {
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = \`\${x - 4}px\`;
                dot.style.top = \`\${y - 4}px\`;
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.backgroundColor = 'red';
                dot.style.borderRadius = '50%';
                dot.style.zIndex = 9999;
                document.body.appendChild(dot);
                setTimeout(() => dot.remove(), 1000);
            }

            function getRandom(min, max) {
                return min + Math.random() * (max - min);
            }

            function simulateClick(target) {
                const rect = target.getBoundingClientRect();
                const x = rect.left + target.width * 0.5 + target.width * getRandom(0.07, 0.11); // +7%...+11%
                const y = rect.top + target.height * getRandom(0.54, 0.58); // 54%...58%

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

                console.log(\`🖱 Click at (\${Math.round(x)}, \${Math.round(y)})\`);
                markClick(x, y);
            }

            function startClicking(targetCanvas) {
                if (clickInterval) return;

                canvas = targetCanvas;
                console.log('🎯 Canvas найден, начинаю кликать');

                canvas.style.touchAction = 'none';
                canvas.style.cursor = 'pointer';

                function clickLoop() {
                    if (!document.body.contains(canvas)) {
                        console.log('❌ Canvas исчез, прекращаю кликать');
                        stopClicking();
                        return;
                    }
                    simulateClick(canvas);
                    const delay = getRandom(900, 1300); // случайная пауза
                    clickInterval = setTimeout(clickLoop, delay);
                }

                clickLoop();
            }

            function stopClicking() {
                clearTimeout(clickInterval);
                clickInterval = null;
                canvas = null;
            }

            function waitLoop() {
                const fightCanvas = document.getElementById('fightCanvas');
                if (fightCanvas) {
                    const targetCanvas = fightCanvas.querySelector('canvas');
                    if (targetCanvas) {
                        console.log('✅ Canvas найден внутри #fightCanvas');
                        startClicking(targetCanvas);
                        return;
                    }
                }
                requestAnimationFrame(waitLoop);
            }

            console.log('🚀 Скрипт запущен внутри iframe. Жду #fightCanvas...');
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
            console.log('✅ Скрипт автоматически внедрён в iframe#main');
        } catch (err) {
            console.warn('⚠️ Не удалось внедрить скрипт в iframe:', err);
        }
    }

    function waitForIframe() {
        const iframe = document.querySelector('iframe#main');
        if (iframe && iframe.contentWindow && iframe.contentDocument) {
            iframe.addEventListener('load', () => {
                console.log('🔄 iframe#main загрузился:', iframe.src);
                setTimeout(() => injectClicker(iframe), 200);
            });
            console.log('🧭 Найден iframe#main. Жду загрузки...');
        } else {
            console.log('⏳ Ожидаю появления iframe#main...');
            setTimeout(waitForIframe, 500);
        }
    }

    console.log('🚀 Автоинъектор скрипта в iframe#main запущен');
    waitForIframe();
})();
