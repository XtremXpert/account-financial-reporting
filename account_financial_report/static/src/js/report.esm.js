/** @odoo-module **/
// Odoo 20 / Owl 3 : l'action de rapport n'expose plus de référence d'iframe ;
// l'enrichissement se fait au chargement de l'iframe (voir report_action.esm.js).

function toTitleCase(str) {
    return str
        .replaceAll(".", " ")
        .replace(
            /\w\S*/g,
            (txt) => `${txt.charAt(0).toUpperCase()}${txt.substr(1).toLowerCase()}`
        );
}

/**
 * Entoure d'un lien chaque élément [res-model][domain] du document rendu,
 * pour ouvrir la liste correspondante dans Odoo.
 * @param {Object} component composant disposant de env.services.action
 * @param {Document} doc document (celui de l'iframe)
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
