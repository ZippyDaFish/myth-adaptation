import { writable } from "svelte/store";

export type GameStepKey =
  | "nightStart"
  | "getTasks"
  | "listItems"
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

export const gameSteps: GameStep[] = [
  { key: "nightStart", label: "Night Falls", continueText: "Continue" },
  { key: "getTasks", label: "Tasks Awaken", continueText: "Gather Tasks", interactive: true },
  { key: "listItems", label: "Available Items", continueText: "Review Items", interactive: true },
  { key: "giveDollItems", label: "Give Items to Doll", continueText: "Assign Items", interactive: true },
  { key: "nightEnd", label: "Night Ends", continueText: "Continue" },
  { key: "dollAttemptsChores", label: "Doll Attempts Chores", continueText: "See Results" },
  { key: "playerMakesDinner", label: "Dinner Time", continueText: "Eat" },
  { key: "witchGivesBoons", label: "Boons & Curses", continueText: "Receive" },
  { key: "dayEnd", label: "Day Ends", continueText: "Next Night" },
];

export const currentStepIndex = writable(0);

// Derived helper to get current step
import { derived } from "svelte/store";
export const currentStep = derived(currentStepIndex, $idx => gameSteps[$idx]);

export function nextStep() {
  currentStepIndex.update(idx => (idx + 1) % gameSteps.length);
}

export function prevStep() {
  currentStepIndex.update(idx => (idx - 1 + gameSteps.length) % gameSteps.length);
}
