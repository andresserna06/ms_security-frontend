const toRegex = (pattern: string): RegExp =>
  new RegExp(
    "^" +
      pattern
        .split("/")
        .map((segment) =>
          segment === "**"
            ? ".*"
            : segment === "*" || /^\{[^/]+\}$/.test(segment)
              ? "[^/]+"
              : segment.replace(/[.+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("/") +
      "$",
  );

export function matchesPermission(
  granted: string[],
  method: string,
  url: string,
): boolean {
  return granted.some((entry) => {
    const separator = entry.indexOf(":");

    if (separator < 0) return false;

    if (
      entry.slice(0, separator).toUpperCase() !== method.toUpperCase()
    ) {
      return false;
    }

    return toRegex(entry.slice(separator + 1)).test(url);
  });
}