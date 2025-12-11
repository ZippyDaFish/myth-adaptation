import { writable, derived } from "svelte/store";
import type { Item, Task } from "./tasks";
import { items as allItemsStore, tasks as allTasksStore } from "./tasks";
import { get } from "svelte/store";

// ----------------------
// Game Step Types
// ----------------------

export type GameStepKey =
  | "nightStart"
  | "giveDollItems"
  | "nightEnd"
  | "dollAttemptsChores"
  | "playerMakesDinner"
  | "witchGivesBoons"
  | "dayEnd";

export interface GameStep {
  key: GameStepKey;
  label: string;          // optional label/title
  continueText: string;   // text for the continue button
  interactive?: boolean;  // true if player needs to interact
}

// ----------------------
// Step Definitions
// ----------------------

export const gameSteps: GameStep[] = [
  { key: "nightStart", label: "Night Falls", continueText: "Continue" },
  { key: "giveDollItems", label: "Give Items to Doll", continueText: "Assign Items", interactive: true },
  { key: "nightEnd", label: "Night Ends", continueText: "Continue" },
  { key: "dollAttemptsChores", label: "Doll Attempts Chores", continueText: "See Results" },
  { key: "playerMakesDinner", label: "Dinner Time", continueText: "Eat" },
  { key: "witchGivesBoons", label: "Boons & Curses", continueText: "Receive" },
  { key: "dayEnd", label: "Day Ends", continueText: "Next Night" },
];

// ----------------------
// Current Step Store
// ----------------------

export const currentStepIndex = writable(0);

export const currentStep = derived(currentStepIndex, $idx => gameSteps[$idx]);

export function nextStep() {
  currentStepIndex.update(idx => (idx + 1) % gameSteps.length);
}

export function prevStep() {
  currentStepIndex.update(idx => (idx - 1 + gameSteps.length) % gameSteps.length);
}

// ----------------------
// Night State Types
// ----------------------

export interface NightState {
  availableItems: Item[];
  nightlyTasks: Task[];
  dollItems: Item[];
}

export const nightState = writable<NightState>({
  availableItems: [],
  nightlyTasks: [],
  dollItems: [],
});

// ----------------------
// Random Subset Helpers
// ----------------------

function getRandomSubset<T>(arr: T[], maxItems: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, maxItems);
}

// ----------------------
// Start a New Night
// ----------------------

export function startNight(maxItems = 8, maxTasks = 10) {
  const allItems = get(allItemsStore);
  const allTasks = get(allTasksStore);

  nightState.set({
    availableItems: getRandomSubset(allItems, maxItems),
    nightlyTasks: getRandomSubset(allTasks, maxTasks),
    dollItems: [],
  });
}

// ----------------------
// Doll Item Management
// ----------------------

export const maxDollItems = 4;

export function toggleDollItem(item: Item) {
  nightState.update(ns => {
    const exists = ns.dollItems.find(i => i.id === item.id);
    if (exists) {
      return { ...ns, dollItems: ns.dollItems.filter(i => i.id !== item.id) };
    } else if (ns.dollItems.length < maxDollItems) {
      return { ...ns, dollItems: [...ns.dollItems, item] };
    }
    return ns;
  });
}

// ----------------------
// Helper: Tasks Highlighted by Doll
// ----------------------

export function tasksHighlightedByDoll(dollItems: Item[], allTasks: Task[]): Task[] {
  return allTasks.filter(t =>
    dollItems.some(i => {
      const itemTasks = getTaskIdsForItem(i.id);
      return itemTasks.includes(t.id);
    })
  );
}

// ----------------------
// Utility: Get Task IDs for an Item
// ----------------------

import { itemTask } from "./tasks";
export function getTaskIdsForItem(itemId: number): number[] {
  const links = get(itemTask);
  return links.filter(link => link.itemId === itemId).map(link => link.taskId);
}
