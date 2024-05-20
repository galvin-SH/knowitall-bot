const { Ollama } = require('ollama');

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
    async sendRequest(ollama, text) {
        try {
            const MENTION_REGEX = /(<+@)+[0-9]+>/g;
            const userMessage = text.replaceAll(MENTION_REGEX, '');
            // Check if the message is empty
            if (userMessage === '')
                return { message: { content: 'Please provide a message.' } };
            // Send a request to the Ollama server
            return await ollama.chat({
                // Set the model
                model: 'gemma:latest',
                // Set the context
                messages: [
                    {
                        // Set the user role and message content
                        role: 'user',
                        content: userMessage,
                    },
                ],
                // Disable streaming
                stream: false,
            });
        } catch (error) {
            console.error(error);
        }
    },
};
