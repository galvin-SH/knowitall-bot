const { Ollama } = require('ollama');

module.exports = {
    // Create a new Ollama instance
    getOllama() {
        // Connect to the Ollama server running on localhost:11434
        return new Ollama({ host: 'localhost', port: 11434 });
    },
    // Send a request to the Ollama server
    async sendRequest(ollama, text) {
        // Send a request to the Ollama server
        return await ollama.chat({
            // Set the model
            model: 'llama3',
            // Set the context
            messages: [
                {
                    // Set the user role
                    role: 'user',
                    // Remove mentions from the message
                    content: text.replaceAll(/(<+@)+[0-9]+>/g, ''),
                },
            ],
            // Disable streaming
            stream: false,
        });
    },
};
