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
  const Localizer = (source:any, target?:string) => {
    if (Array.isArray(source)) {
      source.forEach((data) => Localizer(data, target))
    } else if (typeof source === 'object') {
      if (source[localesArrayKey]) {
        let localizationObject :any
        if (target) {
          localizationObject = source.locales.find(
            (item:any) => item[localeShortCodeKey] === target
          )
        } else {
          localizationObject = source[localesArrayKey][0]
        }
        Object.entries(localizationObject).forEach(([key, value]) => {
          if (key !== localeShortCodeKey) source[key] = value
        })
        delete source[localesArrayKey]
      }
      Object.entries(source).forEach(([key, value]) => {
        source[key] = Localizer(value, target)
      })
    } else if (
      source === null ||
      ['string', 'number'].includes(typeof source)
    ) {
      return source
    }
  }
  return Localizer
}