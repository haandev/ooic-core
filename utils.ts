import { Model } from "@sequelize/core";
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
  localesArrayKey: string,
  localeShortCodeKey: string
}) => {
  const localesArrayKey = options.localesArrayKey || "locales"
  const localeShortCodeKey = options.localeShortCodeKey || "locale"
  const Localizer = (raw, target) => {
    const source = JSON.parse(JSON.stringify(raw))
    if (typeof source === 'object' && !Array.isArray(source)) {
      const localizationObject = target
        ? source[localesArrayKey].find((item) => item[localeShortCodeKey] === target) || {}
        : source[localesArrayKey][0] || {}
      const newSource = {}
      Object.entries(source).forEach(([key, value]) => {
        if (key !== localesArrayKey) {
          if (key === 'id'){
            newSource[key] = value
          } else if (['string', 'number'].includes(typeof value) || value === null) {
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

export class HierarchicalModel extends Model {
  static hierarchReady: boolean = false;
  static as: string;
  static foreignKey: string;
  static primaryKey: string;
  public static initHierarchy(
    options: {
      as?: string;
      primaryKey?: string;
      foreignKey?: string;
    } = {}
  ) {
    
    this.hierarchReady = true;
    this.as = options.as || "children";
    this.foreignKey = options.foreignKey || "parentId";
    this.primaryKey = options.primaryKey || "id";

    this.hasMany(this, {
      as: this.as,
      foreignKey: this.foreignKey
    });
  }

  public static async getChildrenByPk(pk, depth?: number, scope?: any) {
    const d = depth ?? Number.MAX_SAFE_INTEGER;
    const obj = scope ? this.scope(scope) : this;
    const result = await obj.findAll({
      where: { [this.foreignKey]: pk },
    });

    if (d) {
      const data = await Promise.all(
        result.map(async (item, index) => ({
          ...item.toJSON(),
          [this.as]: await this.getChildrenByPk(
            item[this.primaryKey],
            d - 1,
            scope
          ),
        }))
      );
      return data;
    } else return result;
  }

  public static async getTreeByPk(pk, depth?: number, scope?: any) {
    const obj = scope ? this.scope(scope) : this;
    const [result, children] = await Promise.all([
      obj.findByPk(pk),
      this.getChildrenByPk(pk, depth, scope),
    ]);
    return { ...result.toJSON(), [this.as]: children };
  }

  public static async getAncestorsByPk(pk, depth?: number, scope?: any) {
    const d = depth ?? Number.MAX_SAFE_INTEGER;
    const obj = scope ? this.scope(scope) : this;

    const result = await obj.findByPk(pk);
    let parent = [];
    if (result[this.foreignKey] && d) {
      parent = await this.getAncestorsByPk(
        result[this.foreignKey],
        d - 1,
        scope
      );
    }
    return [result.toJSON(), ...parent];
  }
}
