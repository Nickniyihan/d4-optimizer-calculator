import { AffixGroup, EquipmentItem } from "./damageModel";

export type MoveDirection = "up" | "down";

export function reorderAffixInEquipmentItem(
  item: EquipmentItem,
  group: AffixGroup,
  affixId: string,
  direction: MoveDirection,
): EquipmentItem {
  const key = group === "item" ? "affixes" : "extraAffixes";
  const affixes = [...(item[key] ?? [])];
  const visibleIndexes = affixes
    .map((affix, index) => (affix.value !== 0 ? index : -1))
    .filter((index) => index >= 0);
  const visiblePosition = visibleIndexes.findIndex(
    (index) => affixes[index]?.id === affixId,
  );

  if (visiblePosition < 0) {
    return item;
  }

  const nextVisiblePosition =
    direction === "up" ? visiblePosition - 1 : visiblePosition + 1;

  if (
    nextVisiblePosition < 0 ||
    nextVisiblePosition >= visibleIndexes.length
  ) {
    return item;
  }

  const fromIndex = visibleIndexes[visiblePosition];
  const toIndex = visibleIndexes[nextVisiblePosition];
  const fromAffix = affixes[fromIndex];

  affixes[fromIndex] = affixes[toIndex];
  affixes[toIndex] = fromAffix;

  return {
    ...item,
    [key]: affixes,
  };
}
