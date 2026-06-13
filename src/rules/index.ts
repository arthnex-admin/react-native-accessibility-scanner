import type { AccessibilityRule } from "../types";
import { MissingLabelRule } from "./missing-label";
import { MissingRoleRule } from "./missing-role";
import { SmallTouchTargetRule } from "./small-touch-target";
import { DuplicateLabelsRule } from "./duplicate-labels";
import { MissingHintRule } from "./missing-hint";
import { TouchableWithoutLabelRule } from "./touchable-without-label";

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new Map<string, AccessibilityRule>();

export function registerRule(rule: AccessibilityRule): void {
  registry.set(rule.id, rule);
}

export function getRule(id: string): AccessibilityRule | undefined {
  return registry.get(id);
}

export function getAllRules(): AccessibilityRule[] {
  return Array.from(registry.values());
}

// ─── Built-in rules ───────────────────────────────────────────────────────────

export const duplicateLabelsRule = new DuplicateLabelsRule();

registerRule(new MissingLabelRule());
registerRule(new MissingRoleRule());
registerRule(new SmallTouchTargetRule());
registerRule(duplicateLabelsRule);
registerRule(new MissingHintRule());
registerRule(new TouchableWithoutLabelRule());

export {
  MissingLabelRule,
  MissingRoleRule,
  SmallTouchTargetRule,
  DuplicateLabelsRule,
  MissingHintRule,
  TouchableWithoutLabelRule,
};
