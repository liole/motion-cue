export default function dom(query) {
    return document.querySelector(query);
}

dom.new = function newElement(tag, options = {}, children = []) {
    let element = document.createElement(tag);
    Object.assign(element, options);    
    for (let child of children) {
        element.append(child);
    }
    return element;
}

dom.all = function findAll(query) {
    return document.querySelectorAll(query);
}
