(function () {
    const CLICKER_CODE = `
        (function () {
            let keypressTimeout = null;

            function getRandom(min, max) {
                return min + Math.random() * (max - min);
            }

            function simulateKeyPress() {
                const key = 'у';
                const keyCode = 69; // физическая клавиша E

                const eventOptions = {
                    key: key,
                    code: 'KeyE',
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

            function startPressing() {
                if (keypressTimeout) return;

                function loop() {
                    simulateKeyPress();
                    const delay = getRandom(900, 1300);
                    keypressTimeout = setTimeout(loop, delay);
                }

                loop();
            }

            function stopPressing() {
                clearTimeout(keypressTimeout);
                keypressTimeout = null;
            }

            function waitLoop() {
                const fightCanvas = document.getElementById('fightCanvas');
                if (fightCanvas) {
                    startPressing();
                    return;
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

            const isFight = iframe.src.includes('fight.php') || iframeWindow.location.href.includes('fight.php');
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
