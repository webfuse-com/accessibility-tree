const inputElement = document.querySelector("#input");
const outputElement = document.querySelector("#output");


function update() {
    let result;
    let error;

    try {
        const accessibilityTree = new AccessibilityTree(
            new DOMParser().parseFromString(inputElement.value, "text/html")
        );

        accessibilityTree.build();

        result = accessibilityTree.toString();

        outputElement.classList.remove("error");
    } catch(err) {
        error = err;

        outputElement.classList.add("error");
    }

    outputElement.textContent = result ?? error;
}


update();

inputElement.addEventListener("input", update);

inputElement.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;

    e.preventDefault();

    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;

    inputElement.value = [
        inputElement.value.substring(0, start),
        " ".repeat(2),
        inputElement.value.substring(end)
    ].join("");
    inputElement.selectionStart = inputElement.selectionEnd = start + 1;
});