/**
 * @fileoverview Ollama LLM client for chat completions.
 * @module ollama
 */

import { Ollama } from 'ollama';
import { getContext } from './context.js';

/**
 * @typedef {import('./context.js').ContextMessage} ContextMessage
 */

/**
 * @typedef {Object} ChatResponse
 * @property {ContextMessage} message - The assistant's response message
 */

/**
 * Creates and returns an Ollama client instance.
 *
 * @returns {Ollama} Ollama client connected to localhost:11434
 * @throws {Error} If connection to Ollama server fails
 */
export function getOllama() {
    try {
        return new Ollama({ host: 'localhost', port: 11434 });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Sends a chat request to the Ollama server.
 *
 * @async
 * @param {Ollama} ollama - The Ollama client instance
 * @param {ContextMessage[]} [context] - Conversation history (fetched if not provided)
 * @returns {Promise<ChatResponse>} The model's response
 * @throws {Error} If the request to Ollama fails
 */
export async function sendRequest(ollama, context) {
    try {
        if (!context) context = await getContext();
        return await ollama.chat({
            model: process.env.OLLAMA_MODEL,
            messages: context,
            stream: false,
        });
    } catch (error) {
        console.error(error);
    }
}
