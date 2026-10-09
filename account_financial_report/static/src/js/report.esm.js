// Odoo 20 / Owl 3: the report action no longer exposes an iframe reference;
// the links are added when the iframe is loaded (see report_action.esm.js).

function toTitleCase(str) {
    return str
        .replaceAll(".", " ")
        .replace(
            /\w\S*/g,
            (txt) => `${txt.charAt(0).toUpperCase()}${txt.substr(1).toLowerCase()}`
        );
}

/**
 * Wrap each [res-model][domain] element of the rendered document in a link
 * opening the matching list view in Odoo.
 * @param {Object} component component providing env.services.action
 * @param {Document} doc document (the iframe one)
 */
export function enrichWithActionLinks(component, doc) {
    const elementsToWrap = doc.querySelectorAll("[res-model][domain]");
    for (const element of elementsToWrap.values()) {
        if (element.parentNode && element.parentNode.dataset.afrEnriched) {
            continue;
        }
        const wrapper = doc.createElement("a");
        wrapper.setAttribute("href", "#");
        wrapper.dataset.afrEnriched = "1";
        wrapper.addEventListener("click", (ev) => {
            ev.preventDefault();
            component.env.services.action.doAction({
                type: "ir.actions.act_window",
                res_model: element.getAttribute("res-model"),
                domain: element.getAttribute("domain"),
                name: toTitleCase(element.getAttribute("res-model")),
                views: [
                    [false, "list"],
                    [false, "form"],
                ],
            });
        });
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    }
}
