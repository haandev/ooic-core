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


export const LocalizerFactory = (options: {
  localesArrayKey:string,
  localeShortCodeKey:string
}) => {
  const localesArrayKey = options.localesArrayKey || "locales"
  const localeShortCodeKey  = options.localeShortCodeKey || "locale"
 const Localizer = (raw, target) => {
    const source = JSON.parse(JSON.stringify(raw))
    if (typeof source === 'object' && !Array.isArray(source)) {
      const localizationObject = target
        ? source[localesArrayKey].find((item) => item[localeShortCodeKey] === target) || {}
        : source[localesArrayKey][0] || {}
      const newSource = {}
      Object.entries(source).forEach(([key, value]) => {
        if (key !== localesArrayKey) {
          if (['string', 'number'].includes(typeof value)) {
            newSource[key] = localizationObject[key] || value
          } else newSource[key] = Localizer(value, target)
        }
      })
      return newSource
    } else if (Array.isArray(source)) {
      return source.map((data) => Localizer(data, target))
    }
  }
  return Localizer
}
