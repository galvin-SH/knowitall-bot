/**
 * Centralized logger configuration using winston.
 * Format matches uvicorn/FastAPI style: "LEVEL:     message"
 */

import winston from 'winston';

const { createLogger, format, transports } = winston;

/**
 * Custom format to match Python/uvicorn log style.
 * Output: "INFO:     message" or "ERROR:    message"
 */
const uvicornStyle = format.printf(({ level, message }) => {
    // Pad level to align messages (ERROR is 5 chars, INFO is 4)
    const paddedLevel = level.toUpperCase().padEnd(5);
    return `${paddedLevel}:    ${message}`;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.errors({ stack: true }), // Capture stack traces
        uvicornStyle
    ),
    transports: [new transports.Console()],
});

export default logger;
