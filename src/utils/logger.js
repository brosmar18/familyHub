'use strict';
const winston = require('winston');
require('winston-daily-rotate-file'); 


const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
);

// Use json formatting for files. 
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// logger instance with separate transports for console and files
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', 
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
            level: 'debug' 
        }),
        // Daily Rotate File transport for production
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true, 
            maxSize: '20m', 
            maxFiles: '14d', 
            level: 'info' 
        }),
        // Error log file transport
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error', 
            format: fileFormat
        }),
        // Combined log file transport
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat
        })
    ],
    exceptionHandlers: [
        // Handle uncaught exceptions
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: fileFormat
        })
    ],
    rejectionHandlers: [
        // Handle unhandled promise rejections
        new winston.transports.File({
            filename: 'logs/rejections.log',
            format: fileFormat
        })
    ]
});

module.exports = logger;
