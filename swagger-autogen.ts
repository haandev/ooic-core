function getFullPath(layer, prevPath = "") {
  let routeName = "";
  if (layer?.route?.path) {
    routeName = layer?.route?.path;
  } else if (layer.regexp) {
    routeName = layer.regexp.source.replace("^\\", "").replace("\\/?(?=\\/|$)", "");
    if (layer.keys && layer.keys.length > 0) {
      layer.keys.forEach(function (key) {
        routeName = routeName.replace("(?:([^\\/]+?))", ":" + key.name);
      });
    }
  }
  return prevPath + routeName.split("\\").join("");
}
const trimEndStr = (source: string, str: string) => {
  const start = source.indexOf(str);
  const length = str.length;
  if (start + length === source.length) {
    return source.slice(0, start);
  }
};
export const routes = [];
const recursivePath = (r, pathPrev = "") => {
  const path = getFullPath(r, pathPrev);
  if (r.name === "router") {
    const stack = r.handle.stack;
    stack.forEach((r, i) => {
      const pathNext = recursivePath(r, path);
    });
  } else {
    if (r.name === "bound dispatch") {
      routes.push({ path, params: r.params, keys: r.keys, stack: r.route.stack, methods: r.route.methods });
    }
    return path;
  }
};

export async function swaggerify(app) {
  app._router.stack.forEach((r, i) => {
    recursivePath(r);
  });
}
