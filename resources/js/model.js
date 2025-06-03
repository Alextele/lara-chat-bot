function fight_monitoring() {
    const delay = getRandom(2800, 3200);
    if(this.document.lvl.topWindow[1].obj) {
        const fight_log = this.document.lvl.topWindow[1].obj.innerText ?? '';
        const regex_fight = /проиграл бой/;
        console.log('бой закончен: ' + regex_fight.test(fight_log));
        console.log('текущее хп: ' + this.document.lvl.model.hpCur);
        setTimeout(fight_monitoring, delay);
    } else {
        console.log('Бой не найден');
        setTimeout(fight_monitoring, delay);
    }
}

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

function hunt_click() {
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
hunt_click();








function draw_dot(x, y) {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = `${x - 4}px`; // Исправлено: убраны лишние символы
    dot.style.top = `${y - 4}px`;   // Исправлено: убраны лишние символы
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = 'red';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = 9999;
    document.body.appendChild(dot);
}

fight_monitoring();
