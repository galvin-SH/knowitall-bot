const { Ollama } = require('ollama');

module.exports = {
    // Create a new Ollama instance
    getOllama() {
        // Connect to the Ollama server running on localhost:11434
        return new Ollama({ host: 'localhost', port: 11434 });
    },
};
