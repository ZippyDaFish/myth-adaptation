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
  | "dayStart"
  | "dollAttemptsChores"
  | "theDayContinues"
  | "playerMakesDinner"
  | "dayEnd";

export interface GameStep {
  key: GameStepKey;
  label: string;          // optional label/title
  continueText: string;   // text for the continue button
  storyText: string;
  interactive?: boolean;  // true if player needs to interact
}

// ----------------------
// Step Definitions
// ----------------------

export const gameSteps: GameStep[] = [
  { key: "nightStart", label: "Night Falls", continueText: "Continue", storyText: "Light gutters and dies as the Rider in Black emerges from the deepening shadows. His horse drinks the last glow from the sky, and where he passes, the world exhales. Doors are barred, secrets stir, and spirits creep closer. He rides slowly, patiently, knowing that all things must eventually rest. When he disappears into the earth, only darkness remains, thick and watchful. Night has fallen and you find rest." },
  { key: "giveDollItems", label: "Give Items to Doll", continueText: "Assign Items", interactive: true, storyText: "" },
  { key: "dayStart", label: "Day Begins", continueText: "Continue", storyText: "A hush falls over the land just before the sun remembers to rise. From the pale mist comes the Rider in White, his horse's hooves making no sound upon the frost. Dew gathers where he passes, and shadows retreat like guilty things. He does not look left or right, for his duty is only to begin. When he rides on, birds draw breath, tools feel lighter in the hand, and the world allows work to start anew. The day begins." },
  { key: "dollAttemptsChores", label: "Doll Attempts Chores", continueText: "See Results", storyText: "" },
  { key: "theDayContinues", label: "The Day Continues", continueText: "Continue", storyText: "The air grows warm, then hot. Heat presses down like a hand on the back. The Rider in Red thunders past in a blaze of color, his cloak aflame with the fire of the sun. Sweat beads on skin, iron grows warm, and nothing may hide from his gaze. Under his reign, effort is demanded and truth is laid bare. What is unfinished becomes obvious, what is weak begins to crack. The day is in full force and you awaken." },
  { key: "playerMakesDinner", label: "Dinner Time", continueText: "Eat", storyText: "" },
  { key: "dayEnd", label: "Day Ends", continueText: "Next Night", storyText: "" },
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
