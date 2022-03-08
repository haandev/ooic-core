import fs from "fs";
import { toKebabCase } from "./utils";
import { Express } from "express";
export const initErrorHandlers = async (app: Express) => {
  const ErrorHandlers = {};
  const files = fs.readdirSync("src/error/");
  await Promise.all(files.map((fileName) => import(`../../../src/error/${fileName}`))).then((responses) => {
    responses.forEach((loadedModule, index) => {
      const name = toKebabCase(files[index].split(".")[0]);
      ErrorHandlers[name] = loadedModule.default;
      app.use(ErrorHandlers[name]);
    });
  });
};
