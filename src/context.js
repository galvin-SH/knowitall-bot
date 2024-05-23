module.exports = {
    getContext() {
        try {
            return new Array();
        } catch (error) {
            console.error(error);
        }
    },
    addContext(context, data) {
        try {
            context.push(data);
            return context;
        } catch (error) {
            console.error(error);
        }
    },
};
