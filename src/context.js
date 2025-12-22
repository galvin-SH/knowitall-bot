/**
 * @fileoverview Conversation context management for the Ollama chat history.
 * @module context
 */

/**
 * @typedef {Object} ContextMessage
 * @property {'user' | 'assistant' | 'system'} role - The role of the message sender
 * @property {string} content - The message content
 */

/**
 * Creates and returns a new empty context array.
 *
 * @returns {ContextMessage[]} Empty array to store conversation history
 */
export function getContext() {
    return [];
}

/**
 * Adds a message to the conversation context.
 *
 * @param {ContextMessage[]} context - The existing context array
 * @param {ContextMessage} data - The message to add to the context
 * @returns {ContextMessage[]} The updated context array
 */
export function addContext(context, data) {
    context.push(data);
    return context;
}
