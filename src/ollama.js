const { Ollama } = require('ollama');
const { getContext, addContext } = require('./context');

module.exports = {
    // Create a new Ollama instance
    getOllama() {
        try {
            // Connect to the Ollama server running on localhost:11434
            return new Ollama({ host: 'localhost', port: 11434 });
        } catch (error) {
            console.error(error);
        }
    },
    // Send a request to the Ollama server
    async sendRequest(ollama, context) {
        try {
            // Get the context if it's not provided
            if (!context) context = await getContext();
            // Send a request to the Ollama server
            return await ollama.chat({
                // Set the model
                model: process.env.OLLAMA_MODEL,
                // Set the context
                messages: context,
                // Model waits to respond until its whole message has been created
                stream: false,
            });
        } catch (error) {
            console.error(error);
        }
    },
};
