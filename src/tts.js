/**
 * @fileoverview TTS Client module for communicating with the local TTS+RVC server.
 * @module tts
 */

/** @constant {string} TTS_SERVER_URL - Base URL for the TTS+RVC server */
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'http://127.0.0.1:5050';

/**
 * Generates TTS audio with RVC voice conversion.
 *
 * @async
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice model to use
 * @returns {Promise<string>} Path to the generated audio file
 * @throws {Error} If the TTS server returns an error response
 */

export async function generateTTS(text, voice) {
    const response = await fetch(`${TTS_SERVER_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            `TTS generation failed: ${error.detail || response.statusText}`
        );
    }

    const result = await response.json();
    return result.audio_path;
}
