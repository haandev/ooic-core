import https from "https";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { OoicConfig } from "./types";
import { initRouter } from "./init-router";
import { initErrorHandlers } from "./init-error-handlers";
import { connect, sync } from "./init-connection";
import { queryParser } from "express-query-parser";
import { swaggerify } from "./swagger-autogen";
import unhandled from "./unhandled";
import packageJson from "../../../package.json"

export async function ooic(config: OoicConfig) {
  const app = express();
  config.cors?.enabled && app.use(cors(config.cors.options));
  config.morgan?.enabled && process.env.NODE_ENV === "development" && app.use(morgan(config.morgan.format, config.morgan.options));
  config.cookieParser?.enabled && app.use(cookieParser(config.cookieParser.secret, config.cookieParser.options));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'))
  app.use(express.json());
  app.use(
    queryParser({
      parseNumber: true,
      parseBoolean: true,
      parseNull: true,
      parseUndefined: true,
    })
  );

  await connect();
  await initRouter(app);
  await initErrorHandlers(app);
  app.use(unhandled);

  await swaggerify(app);
  await sync();

  if (process.env.NODE_ENV === "development") {
    http.createServer(app).listen(process.env.PORT);
    console.log(
      `\nWelcome to ${packageJson.name} v${packageJson.version}! Listening on port ${process.env.PORT}` +
        `\nRunning on environment: ${process.env.NODE_ENV}` +
        `\nhttp://localhost:${process.env.PORT}`
    );
  } else {
    http.createServer(app).listen(process.env.PORT);
    config.ssl?.enabled && https.createServer({ cert: config.ssl.cert, key: config.ssl.key }, app).listen(process.env.SECURE_PORT);
    console.log(
      `\nWelcome to ${packageJson.name} v${packageJson.version}! Listening on port ${process.env.PORT} and ${process.env.SECURE_PORT}` + `\nRunning on environment: ${process.env.NODE_ENV}`
    );
  }
  return app;
}
