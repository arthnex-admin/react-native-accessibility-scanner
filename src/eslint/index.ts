/**
 * eslint-plugin-react-native-accessibility-scanner
 */

import {
  getComponentName,
  hasNonEmptyAttribute,
  hasTextChild,
  INTERACTIVE_COMPONENTS,
  TOUCHABLE_COMPONENTS,
  extractStyleDimension,
} from "../utils/ast";
import * as t from "@babel/types";

type ESLintNode = { type: string; [key: string]: unknown };
type RuleContext = {
  report(descriptor: { node: ESLintNode; messageId: string; data?: Record<string, string> }): void;
  options: Array<{ minWidth?: number; minHeight?: number }>;
};
type RuleListener = Record<string, (node: ESLintNode) => void>;
type RuleModule = {
  meta: {
    type: string;
    docs: { description: string; recommended: boolean; url: string };
    schema: unknown[];
    messages: Record<string, string>;
  };
  create(context: RuleContext): RuleListener;
};

function toBabelNode(node: ESLintNode): t.Node {
  return node as unknown as t.Node;
}

// ─── Rule: missing-label ──────────────────────────────────────────────────────

const missingLabelRule: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Interactive React Native elements must have an accessibilityLabel or Text child.",
      recommended: true,
      url: "https://github.com/YOUR_USERNAME/react-native-accessibility-scanner#missing-label",
    },
    schema: [],
    messages: {
      missingLabel:
        "<{{name}}> is interactive but has no accessibilityLabel or Text child. Add accessibilityLabel=\"Describe the action\".",
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const bNode = toBabelNode(node);
        if (!t.isJSXElement(bNode)) return;
        const opening = bNode.openingElement;
        const name = getComponentName(opening);
        if (!name || !INTERACTIVE_COMPONENTS.has(name)) return;
        if (hasNonEmptyAttribute(opening, "accessibilityLabel")) return;
        if (hasTextChild(bNode)) return;
        context.report({ node, messageId: "missingLabel", data: { name } });
      },
    };
  },
};

// ─── Rule: missing-role ───────────────────────────────────────────────────────

const missingRoleRule: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Interactive React Native elements should declare their accessibilityRole.",
      recommended: true,
      url: "https://github.com/YOUR_USERNAME/react-native-accessibility-scanner#missing-role",
    },
    schema: [],
    messages: {
      missingRole:
        "<{{name}}> is missing accessibilityRole. Add accessibilityRole=\"button\" (or appropriate role).",
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const bNode = toBabelNode(node);
        if (!t.isJSXElement(bNode)) return;
        const opening = bNode.openingElement;
        const name = getComponentName(opening);
        if (!name || !INTERACTIVE_COMPONENTS.has(name)) return;
        if (hasNonEmptyAttribute(opening, "accessibilityRole")) return;
        context.report({ node, messageId: "missingRole", data: { name } });
      },
    };
  },
};

// ─── Rule: small-touch-target ─────────────────────────────────────────────────

const smallTouchTargetRule: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Touchable elements should meet minimum touch target size (44×44pt).",
      recommended: true,
      url: "https://github.com/YOUR_USERNAME/react-native-accessibility-scanner#small-touch-target",
    },
    schema: [
      {
        type: "object",
        properties: {
          minWidth: { type: "number" },
          minHeight: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      smallWidth: "<{{name}}> width={{width}} is below minimum {{min}}pt.",
      smallHeight: "<{{name}}> height={{height}} is below minimum {{min}}pt.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const minWidth: number = options.minWidth ?? 44;
    const minHeight: number = options.minHeight ?? 44;
    return {
      JSXElement(node) {
        const bNode = toBabelNode(node);
        if (!t.isJSXElement(bNode)) return;
        const opening = bNode.openingElement;
        const name = getComponentName(opening);
        if (!name || !TOUCHABLE_COMPONENTS.has(name)) return;
        const width = extractStyleDimension(opening, "width");
        const height = extractStyleDimension(opening, "height");
        if (width !== null && width < minWidth) {
          context.report({ node, messageId: "smallWidth", data: { name, width: String(width), min: String(minWidth) } });
        }
        if (height !== null && height < minHeight) {
          context.report({ node, messageId: "smallHeight", data: { name, height: String(height), min: String(minHeight) } });
        }
      },
    };
  },
};

// ─── Plugin export ────────────────────────────────────────────────────────────

const plugin = {
  meta: { name: "react-native-accessibility-scanner", version: "1.0.0" },
  rules: {
    "missing-label": missingLabelRule,
    "missing-role": missingRoleRule,
    "small-touch-target": smallTouchTargetRule,
  },
  configs: {
    recommended: {
      plugins: ["react-native-accessibility-scanner"],
      rules: {
        "react-native-accessibility-scanner/missing-label": "error",
        "react-native-accessibility-scanner/missing-role": "warn",
        "react-native-accessibility-scanner/small-touch-target": "warn",
      },
    },
  },
};

export default plugin;
export { missingLabelRule, missingRoleRule, smallTouchTargetRule };
