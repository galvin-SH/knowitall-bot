export function getContext() {
    try {
        return new Array();
    } catch (error) {
        console.error(error);
    }
}
export function addContext(context, data) {
    try {
        context.push(data);
        return context;
    } catch (error) {
        console.error(error);
    }
}
