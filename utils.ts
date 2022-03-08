import { ZodObject, ZodSchema } from "zod";

export const toKebabCase = (str: string) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("-");

export const isStartsCapital = (str: string) => str && str.charAt(0) === str.charAt(0).toUpperCase();

export const getCommentLines = (str: string) => {
  let returnValue = str.match(/\/\*\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*\/+/)?.[0] || "/** */";
  return returnValue
    .replace(/(\/\*\*)|(\*\/)|(\n)/g, "")
    .split("*")
    .map((val) => val.trim())
    .filter((e) => !!e);
};

export const NumberIfNumeric = (value) => {
  return isNaN(value) ? value : Number(value);
}
