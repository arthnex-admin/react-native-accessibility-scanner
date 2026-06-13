import * as t from "@babel/types";

/** Interactive RN component names that must have accessibility props */
export const INTERACTIVE_COMPONENTS = new Set([
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "TouchableWithoutFeedback",
  "Pressable",
  "Button",
]);

/** Components where touch-target rules apply */
export const TOUCHABLE_COMPONENTS = new Set([
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "TouchableWithoutFeedback",
  "Pressable",
]);

/** Critical action keywords that should have accessibilityHint */
export const CRITICAL_ACTION_KEYWORDS = [
  "delete",
  "remove",
  "purchase",
  "checkout",
  "submit",
  "payment",
  "pay",
  "buy",
  "confirm",
  "cancel",
];

// ─── JSX Helpers ──────────────────────────────────────────────────────────────

/** Get the component name from a JSXOpeningElement */
export function getComponentName(node: t.JSXOpeningElement): string | null {
  const { name } = node;
  if (t.isJSXIdentifier(name)) return name.name;
  if (t.isJSXMemberExpression(name)) {
    return `${(name.object as t.JSXIdentifier).name}.${name.property.name}`;
  }
  return null;
}

/** Return all JSX attributes from an opening element */
export function getJSXAttributes(node: t.JSXOpeningElement): t.JSXAttribute[] {
  return node.attributes.filter((a): a is t.JSXAttribute => t.isJSXAttribute(a));
}

/** Find a specific named attribute, or return undefined */
export function findAttribute(
  node: t.JSXOpeningElement,
  attrName: string
): t.JSXAttribute | undefined {
  return getJSXAttributes(node).find(
    (a) => t.isJSXIdentifier(a.name) && a.name.name === attrName
  );
}

/** Check if an attribute is present AND has a non-empty value */
export function hasNonEmptyAttribute(
  node: t.JSXOpeningElement,
  attrName: string
): boolean {
  const attr = findAttribute(node, attrName);
  if (!attr) return false;
  const val = attr.value;
  if (!val) return true; // bare prop = true (e.g. accessible)
  if (t.isStringLiteral(val)) return val.value.trim().length > 0;
  if (t.isJSXExpressionContainer(val)) {
    const expr = val.expression;
    if (t.isStringLiteral(expr)) return expr.value.trim().length > 0;
    if (t.isTemplateLiteral(expr)) {
      return expr.quasis.some((q) => q.value.raw.trim().length > 0) ||
        expr.expressions.length > 0;
    }
    // Dynamic expression — assume it's populated
    return !t.isNullLiteral(expr);
  }
  return false;
}

/** Get the string value of an attribute, or null if dynamic/missing */
export function getStringAttributeValue(
  node: t.JSXOpeningElement,
  attrName: string
): string | null {
  const attr = findAttribute(node, attrName);
  if (!attr || !attr.value) return null;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  if (
    t.isJSXExpressionContainer(attr.value) &&
    t.isStringLiteral(attr.value.expression)
  ) {
    return attr.value.expression.value;
  }
  return null;
}

/** Check if a JSXElement has any direct Text children */
export function hasTextChild(node: t.JSXElement): boolean {
  return node.children.some((child) => {
    if (t.isJSXText(child)) return child.value.trim().length > 0;
    if (t.isJSXElement(child)) {
      const name = getComponentName(child.openingElement);
      return name === "Text";
    }
    return false;
  });
}

/** Extract a style value (width/height) from a style prop — best-effort static analysis */
export function extractStyleDimension(
  node: t.JSXOpeningElement,
  dimension: "width" | "height"
): number | null {
  const styleAttr = findAttribute(node, "style");
  if (!styleAttr || !styleAttr.value) return null;

  const extractFromObject = (obj: t.ObjectExpression): number | null => {
    const prop = obj.properties.find(
      (p): p is t.ObjectProperty =>
        t.isObjectProperty(p) &&
        ((t.isIdentifier(p.key) && p.key.name === dimension) ||
          (t.isStringLiteral(p.key) && p.key.value === dimension))
    );
    if (!prop) return null;
    if (t.isNumericLiteral(prop.value)) return prop.value.value;
    return null;
  };

  // style={{ width: 30, height: 30 }}
  if (
    t.isJSXExpressionContainer(styleAttr.value) &&
    t.isObjectExpression(styleAttr.value.expression)
  ) {
    return extractFromObject(styleAttr.value.expression);
  }

  return null;
}

/** Get a short code snippet for an issue (the line of source) */
export function getSnippet(source: string, line: number): string {
  const lines = source.split("\n");
  return (lines[line - 1] || "").trim();
}
