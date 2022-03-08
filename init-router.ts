import fs from "fs";
import { toKebabCase } from "./utils";
import { Express } from "express";
const loadRouteFolder = (Routers,app,folderName) => {
  const files = fs.readdirSync(`src/router${folderName}/`, { withFileTypes: true });
  files.forEach(async (file)=>{
    if (file.isFile()){
      const  loadedModule = await import(`@/router${folderName}/${file.name}`)
      const name = toKebabCase(file.name.split(".")[0]);
      Routers[name] = loadedModule.default;
      app.use(`${folderName}/${name}`, Routers[name]);
    }
    else {   
     loadRouteFolder(Routers,app,folderName+"/"+file.name)
    }
  })
}

export const initRouter = async (app: Express) => {
  const Routers = {};
  loadRouteFolder(Routers,app,"")
};