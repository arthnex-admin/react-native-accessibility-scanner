import { describe, it, expect } from "vitest";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import {
  getComponentName,
  findAttribute,
  hasNonEmptyAttribute,
  getStringAttributeValue,
  hasTextChild,
  extractStyleDimension,
  INTERACTIVE_COMPONENTS,
} from "../../src/utils/ast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJSX(code: string) {
  return parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function firstJSXElement(code: string): t.JSXElement {
  const ast = parseJSX(code);
  let found: t.JSXElement | null = null;
  traverse(ast, {
    JSXElement(path) {
      if (!found) found = path.node;
    },
  });
  if (!found) throw new Error("No JSX element found");
  return found;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getComponentName", () => {
  it("returns name for simple identifier", () => {
    const el = firstJSXElement("<TouchableOpacity />");
    expect(getComponentName(el.openingElement)).toBe("TouchableOpacity");
  });

  it("returns null for namespaced elements gracefully", () => {
    const el = firstJSXElement("<View />");
    expect(getComponentName(el.openingElement)).toBe("View");
  });
});

describe("INTERACTIVE_COMPONENTS set", () => {
  it("includes all touchable variants and Pressable", () => {
    expect(INTERACTIVE_COMPONENTS.has("TouchableOpacity")).toBe(true);
    expect(INTERACTIVE_COMPONENTS.has("Pressable")).toBe(true);
    expect(INTERACTIVE_COMPONENTS.has("TouchableHighlight")).toBe(true);
    expect(INTERACTIVE_COMPONENTS.has("View")).toBe(false);
  });
});

describe("findAttribute", () => {
  it("finds an attribute that exists", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel="Search" />');
    const attr = findAttribute(el.openingElement, "accessibilityLabel");
    expect(attr).toBeDefined();
  });

  it("returns undefined for missing attribute", () => {
    const el = firstJSXElement("<TouchableOpacity />");
    const attr = findAttribute(el.openingElement, "accessibilityLabel");
    expect(attr).toBeUndefined();
  });
});

describe("hasNonEmptyAttribute", () => {
  it("returns true for string value", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel="Search" />');
    expect(hasNonEmptyAttribute(el.openingElement, "accessibilityLabel")).toBe(true);
  });

  it("returns false when attribute is absent", () => {
    const el = firstJSXElement("<TouchableOpacity />");
    expect(hasNonEmptyAttribute(el.openingElement, "accessibilityLabel")).toBe(false);
  });

  it("returns false for empty string", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel="" />');
    expect(hasNonEmptyAttribute(el.openingElement, "accessibilityLabel")).toBe(false);
  });

  it("returns true for expression container", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel={label} />');
    expect(hasNonEmptyAttribute(el.openingElement, "accessibilityLabel")).toBe(true);
  });
});

describe("getStringAttributeValue", () => {
  it("returns string value", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel="Search" />');
    expect(getStringAttributeValue(el.openingElement, "accessibilityLabel")).toBe("Search");
  });

  it("returns null for dynamic expression", () => {
    const el = firstJSXElement('<TouchableOpacity accessibilityLabel={someVar} />');
    expect(getStringAttributeValue(el.openingElement, "accessibilityLabel")).toBeNull();
  });

  it("returns null for missing attribute", () => {
    const el = firstJSXElement("<TouchableOpacity />");
    expect(getStringAttributeValue(el.openingElement, "accessibilityLabel")).toBeNull();
  });
});

describe("hasTextChild", () => {
  it("returns true when direct text is present", () => {
    const el = firstJSXElement("<TouchableOpacity>Press me</TouchableOpacity>");
    expect(hasTextChild(el)).toBe(true);
  });

  it("returns true when Text component is a child", () => {
    const el = firstJSXElement("<TouchableOpacity><Text>Hello</Text></TouchableOpacity>");
    expect(hasTextChild(el)).toBe(true);
  });

  it("returns false when no text child", () => {
    const el = firstJSXElement("<TouchableOpacity><View /></TouchableOpacity>");
    expect(hasTextChild(el)).toBe(false);
  });
});

describe("extractStyleDimension", () => {
  it("extracts numeric width from inline style", () => {
    const el = firstJSXElement("<TouchableOpacity style={{ width: 30, height: 50 }} />");
    expect(extractStyleDimension(el.openingElement, "width")).toBe(30);
    expect(extractStyleDimension(el.openingElement, "height")).toBe(50);
  });

  it("returns null when style prop is absent", () => {
    const el = firstJSXElement("<TouchableOpacity />");
    expect(extractStyleDimension(el.openingElement, "width")).toBeNull();
  });

  it("returns null for dynamic style (variable reference)", () => {
    const el = firstJSXElement("<TouchableOpacity style={styles.btn} />");
    expect(extractStyleDimension(el.openingElement, "width")).toBeNull();
  });

  it("returns null when dimension is not in style", () => {
    const el = firstJSXElement("<TouchableOpacity style={{ padding: 10 }} />");
    expect(extractStyleDimension(el.openingElement, "width")).toBeNull();
  });
});
