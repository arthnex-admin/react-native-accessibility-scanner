import { describe, it, expect, beforeEach } from "vitest";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { MissingLabelRule } from "../../src/rules/missing-label";
import { MissingRoleRule } from "../../src/rules/missing-role";
import { SmallTouchTargetRule } from "../../src/rules/small-touch-target";
import { DuplicateLabelsRule } from "../../src/rules/duplicate-labels";
import { MissingHintRule } from "../../src/rules/missing-hint";
import { TouchableWithoutLabelRule } from "../../src/rules/touchable-without-label";
import { MissingAccessibilityStateRule } from "../../src/rules/missing-accessibility-state";
import { FlatListAccessibilityRule } from "../../src/rules/flatlist-accessibility";
import type { RuleContext, AccessibilityIssue } from "../../src/types";
import { DEFAULT_CONFIG } from "../../src/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeContext(filePath = "Test.tsx", source = ""): RuleContext {
  return { filePath, sourceCode: source, config: { ...DEFAULT_CONFIG } };
}

function runRuleOnCode(
  code: string,
  runFn: (node: t.Node, ctx: RuleContext) => AccessibilityIssue[]
): AccessibilityIssue[] {
  const ctx = makeContext("Test.tsx", code);
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true,
  });
  const issues: AccessibilityIssue[] = [];
  traverse(ast, {
    enter(path) {
      issues.push(...runFn(path.node, ctx));
    },
  });
  return issues;
}

// ─── MissingLabelRule ─────────────────────────────────────────────────────────

describe("MissingLabelRule", () => {
  const rule = new MissingLabelRule();

  it("flags TouchableOpacity without accessibilityLabel and no Text child", () => {
    const issues = runRuleOnCode("<TouchableOpacity onPress={() => {}} />", rule.run.bind(rule));
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("high");
    expect(issues[0].ruleId).toBe("missing-label");
  });

  it("does NOT flag when accessibilityLabel is present", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Search" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag when Text child is present", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity onPress={() => {}}><Text>Hello</Text></TouchableOpacity>",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag non-interactive components like View", () => {
    const issues = runRuleOnCode("<View />", rule.run.bind(rule));
    expect(issues).toHaveLength(0);
  });

  it("flags Pressable without label", () => {
    const issues = runRuleOnCode("<Pressable onPress={() => {}} />", rule.run.bind(rule));
    expect(issues).toHaveLength(1);
  });
});

// ─── MissingRoleRule ──────────────────────────────────────────────────────────

describe("MissingRoleRule", () => {
  const rule = new MissingRoleRule();

  it("flags TouchableOpacity without accessibilityRole", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Search" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("medium");
    expect(issues[0].suggestion).toContain("button");
  });

  it("does NOT flag when accessibilityRole is present", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Search" accessibilityRole="button" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("suggests 'button' role for Pressable", () => {
    const issues = runRuleOnCode(
      '<Pressable accessibilityLabel="Tap" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues[0].suggestion).toContain("button");
  });
});

// ─── SmallTouchTargetRule ─────────────────────────────────────────────────────

describe("SmallTouchTargetRule", () => {
  const rule = new SmallTouchTargetRule();

  it("flags width below 44", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={{ width: 30, height: 50 }} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("width=30");
  });

  it("flags height below 44", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={{ width: 50, height: 20 }} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("height=20");
  });

  it("flags both width and height when both are small", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={{ width: 20, height: 20 }} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(2);
  });

  it("does NOT flag at exactly 44", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={{ width: 44, height: 44 }} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag dynamic style (no static value)", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={styles.button} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("flags at 43 (one below threshold)", () => {
    const issues = runRuleOnCode(
      "<TouchableOpacity style={{ width: 43, height: 43 }} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(2);
  });
});

// ─── DuplicateLabelsRule ──────────────────────────────────────────────────────

describe("DuplicateLabelsRule", () => {
  it("detects duplicate labels within a file", () => {
    const rule = new DuplicateLabelsRule();
    const code = `
      <View>
        <TouchableOpacity accessibilityLabel="Button" onPress={() => {}} />
        <TouchableOpacity accessibilityLabel="Button" onPress={() => {}} />
      </View>
    `;
    const ctx = makeContext("Test.tsx", code);
    rule.reset();
    runRuleOnCode(code, rule.run.bind(rule));
    const issues = rule.collectIssues(ctx);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("low");
    expect(issues[0].message).toContain('"Button"');
  });

  it("does NOT report unique labels", () => {
    const rule = new DuplicateLabelsRule();
    const code = `
      <View>
        <TouchableOpacity accessibilityLabel="Search" onPress={() => {}} />
        <TouchableOpacity accessibilityLabel="Settings" onPress={() => {}} />
      </View>
    `;
    const ctx = makeContext("Test.tsx", code);
    rule.reset();
    runRuleOnCode(code, rule.run.bind(rule));
    const issues = rule.collectIssues(ctx);
    expect(issues).toHaveLength(0);
  });

  it("resets between files", () => {
    const rule = new DuplicateLabelsRule();
    rule.reset();
    const ctx = makeContext("Test.tsx", "");
    const issues = rule.collectIssues(ctx);
    expect(issues).toHaveLength(0);
  });
});

// ─── MissingHintRule ──────────────────────────────────────────────────────────

describe("MissingHintRule", () => {
  const rule = new MissingHintRule();

  it("flags critical action without hint", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Delete account" accessibilityRole="button" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("low");
    expect(issues[0].suggestion).toContain("Permanently");
  });

  it("does NOT flag when hint is present", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Delete account" accessibilityRole="button" accessibilityHint="Removes your account permanently" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag non-critical actions", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("flags checkout action", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Checkout" accessibilityRole="button" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
  });
});

// ─── TouchableWithoutLabelRule ────────────────────────────────────────────────

describe("TouchableWithoutLabelRule", () => {
  const rule = new TouchableWithoutLabelRule();

  it("flags Pressable with no label and no text child", () => {
    const issues = runRuleOnCode(
      "<Pressable onPress={() => {}} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("high");
  });

  it("does NOT flag when accessibilityLabel present", () => {
    const issues = runRuleOnCode(
      '<Pressable accessibilityLabel="Close" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag when Text child is present", () => {
    const issues = runRuleOnCode(
      "<Pressable onPress={() => {}}><Text>Tap</Text></Pressable>",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });
});

// ─── MissingAccessibilityStateRule ───────────────────────────────────────────

describe("MissingAccessibilityStateRule", () => {
  const rule = new MissingAccessibilityStateRule();

  it("flags disabled prop without accessibilityState", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Submit" accessibilityRole="button" disabled={true} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("medium");
    expect(issues[0].message).toContain("disabled");
    expect(issues[0].ruleId).toBe("missing-accessibility-state");
  });

  it("flags selected prop without accessibilityState", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Tab" accessibilityRole="button" selected={true} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("selected");
  });

  it("does NOT flag when accessibilityState has disabled key", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Submit" disabled={true} accessibilityState={{ disabled: true }} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag when accessibilityState is a dynamic variable", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Submit" disabled={true} accessibilityState={a11yState} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag when disabled prop is absent", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Submit" accessibilityRole="button" onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag non-interactive components like View", () => {
    const issues = runRuleOnCode(
      "<View disabled={true} />",
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("flags Pressable with disabled but no accessibilityState", () => {
    const issues = runRuleOnCode(
      '<Pressable accessibilityLabel="Pay" disabled={isLoading} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
  });

  it("suggestion includes correct fix example", () => {
    const issues = runRuleOnCode(
      '<TouchableOpacity accessibilityLabel="Submit" disabled={true} onPress={() => {}} />',
      rule.run.bind(rule)
    );
    expect(issues[0].suggestion).toContain("accessibilityState");
    expect(issues[0].suggestion).toContain("disabled");
  });
});

// ─── FlatListAccessibilityRule ────────────────────────────────────────────────

describe("FlatListAccessibilityRule", () => {
  const rule = new FlatListAccessibilityRule();

  it("flags FlatList missing both accessibilityLabel and accessible", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} renderItem={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(2);
    const ruleIds = issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("flatlist-missing-accessibility");
  });

  it("flags FlatList missing only accessibilityLabel", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} accessible={true} renderItem={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("accessibilityLabel");
  });

  it("flags FlatList missing only accessible prop", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} accessibilityLabel="Products list" renderItem={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("accessible={true}");
  });

  it("does NOT flag FlatList with both props present", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} accessible={true} accessibilityLabel="Products list" renderItem={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("flags SectionList missing accessibility", () => {
    const issues = runRuleOnCode(
      '<SectionList sections={sections} renderItem={() => null} renderSectionHeader={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain("SectionList");
  });

  it("flags ScrollView missing accessibility", () => {
    const issues = runRuleOnCode(
      '<ScrollView><Text>content</Text></ScrollView>',
      rule.run.bind(rule)
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toContain("ScrollView");
  });

  it("does NOT flag regular View or Text components", () => {
    const issues = runRuleOnCode(
      '<View><Text>Hello</Text></View>',
      rule.run.bind(rule)
    );
    expect(issues).toHaveLength(0);
  });

  it("suggestion includes accessibilityLabel example", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} renderItem={() => null} />',
      rule.run.bind(rule)
    );
    const labelIssue = issues.find(i => i.message.includes("accessibilityLabel"));
    expect(labelIssue?.suggestion).toContain("accessibilityLabel");
  });

  it("missing-label issue has medium severity", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} renderItem={() => null} />',
      rule.run.bind(rule)
    );
    const labelIssue = issues.find(i => i.message.includes("accessibilityLabel"));
    expect(labelIssue?.severity).toBe("medium");
  });

  it("missing-accessible issue has low severity", () => {
    const issues = runRuleOnCode(
      '<FlatList data={items} accessibilityLabel="List" renderItem={() => null} />',
      rule.run.bind(rule)
    );
    expect(issues[0].severity).toBe("low");
  });
});
