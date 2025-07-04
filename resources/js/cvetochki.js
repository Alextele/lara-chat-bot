const objectHunt = document.getElementById('main').contentWindow.document.hunt_map.stage;
const rect_iframe_hunt = document.getElementById('main').getBoundingClientRect();
function traverse(container, interactiveElements = []) {
    for (const child of container.children) {
        if (child.interactive && child._frameEvent === "Hunt.ENTER_FRAME" && child.getBounds().top > rect_iframe_hunt.height*0.1 && child.getBounds().top < rect_iframe_hunt.height*0.8) {
            interactiveElements.push(child);
        }
        if (child.children) {
            traverse(child, interactiveElements);
        }
    }
    return interactiveElements;
}
console.log(traverse(objectHunt));
