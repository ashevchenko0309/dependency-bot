import * as Transport from "winston-transport";

const winston = require("winston");

const transports: Transport[] = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.cli(),
            winston.format.splat()
        ),
    })
];

const LoggerInstance = winston.createLogger({
    level: 'debug',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json(),
        winston.format.prettyPrint(),
    ),
    transports,
});

export default LoggerInstance;
