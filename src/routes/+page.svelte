<script lang="ts">
  import type { TaskResult } from "$lib/stores/game";

  import { currentStep, nextStep, nightState, startNight, resolveNightTasks, taskResults, applyNightProgress, overallProgress, currentStepIndex, allGameSteps, totalPoints, VICTORY_POINTS, daysElapsed } from "$lib/stores/game";
  import { getTasksForItem } from "$lib/stores/tasks";

  import type { Item, Task } from "$lib/stores/tasks";

  import { tick } from "svelte";

  let rolling = false;


  // Hover state
  let hoveredItem: Item | null = null;
  let hoverTasks: Task[] = [];

  // On mount, start the night with random items/tasks
  import { onMount } from "svelte";
    import { get } from "svelte/store";
  onMount(() => {
    startNight(); // defaults: 8 items, 10 tasks
  });

  // Assign/remove doll items
  const maxDollItems = 4;
  function toggleDollItem(item: Item) {
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

  function handleHover(item: Item) {
    hoveredItem = item;
    hoverTasks = getTasksForItem(item.id);
  }

  function supportingItemCount(taskId: number): number {
  // Count doll-held items that can help this task
  const dollSupport = $nightState.dollItems.filter(item =>
    getTasksForItem(item.id).some(t => t.id === taskId)
  ).length;

  // Hovered item contributes visually (but does not consume a slot)
  const hoverSupport =
    hoveredItem &&
    getTasksForItem(hoveredItem.id).some(t => t.id === taskId)
      ? 1
      : 0;

  return dollSupport + hoverSupport;
}

function taskOddsClass(taskId: number): string {
  const count = supportingItemCount(taskId);

  if (count >= 4) return "bg-emerald-500 text-white font-semibold";
  if (count === 3) return "bg-green-400 text-green-900";
  if (count === 2) return "bg-green-200";
  if (count === 1) return "bg-yellow-200";
  return "bg-gray-100 text-gray-700";
}

</script>

<div class="p-6 space-y-6">
  <h1 class="text-3xl font-bold mb-4">Witch's Night Loop</h1>

  <!-- GET TASKS + LIST ITEMS + GIVE DOLL ITEMS -->
  {#if ["getTasks", "listItems", "giveDollItems"].includes($currentStep.key)}
    <div class="flex gap-6 mt-4">
      <!-- Available items -->
      <div class="w-1/2 pl-4">
        <h2 class="text-xl font-semibold mb-2">Available Items</h2>
        <ul class="space-y-2">
          {#each $nightState.availableItems as item}
            <li
              on:mouseover={() => handleHover(item)}
              on:focus={() => handleHover(item)}
              on:click={() => toggleDollItem(item)}
              tabindex="0"
              class="p-2 rounded cursor-pointer transition
                     hover:bg-purple-200 hover:text-purple-900
                     {$nightState.dollItems.some(i => i.id === item.id) ? 'bg-purple-300 font-bold' : ''}"
            >
              {item.name}
            </li>
          {/each}
        </ul>

        {#if $currentStep.key === "giveDollItems"}
          <p class="mt-4 text-gray-600">
            Doll Items: {$nightState.dollItems.map(i => i.name).join(", ") || "None"} (Max {maxDollItems})
          </p>
        {/if}
      </div>

      <!-- Tasks panel -->
      <div class="w-1/2 border-r border-gray-300 pr-4">
        <h2 class="text-xl font-semibold mb-2">Item Details / Tasks</h2>

        <ul class="space-y-2">
          {#each $nightState.nightlyTasks as t}
            <li
              class={`p-2 rounded transition-colors duration-200 ${taskOddsClass(t.id)}`}>
              <div class="flex justify-between items-center">
                <span>{t.name}</span>

                {#if supportingItemCount(t.id) > 0 && $currentStep.key === "giveDollItems"}
                  <span class="text-xs opacity-80">
                    +{supportingItemCount(t.id)} on 3d6
                  </span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>

        {#if hoveredItem && $currentStep.key !== "giveDollItems"}
          <h3 class="font-semibold mt-4">{hoveredItem.name}</h3>
        {/if}
      </div>
    </div>
  {/if}


  <!-- STORY BEAT STEPS -->
  {#if !["getTasks", "listItems", "giveDollItems"].includes($currentStep.key)}
    <div class="p-4 bg-gray-100 rounded shadow">
      <h2 class="text-2xl font-semibold mb-2">{$currentStep.label}</h2>
      <p class="text-gray-700">{$currentStep.storyText}</p>
    </div>
  {/if}

{#if $currentStep.key === "dollAttemptsChores"}
  <div class="p-6 bg-gray-100 rounded shadow space-y-4">
    <h2 class="text-2xl font-semibold">The Doll Sets to Work…</h2>

    {#if $taskResults}
      <ul class="space-y-3">
        {#each $taskResults as r}
          <li
            class="p-3 rounded transition-colors duration-300"
            class:bg-green-200={r.outcome === "success"}
            class:bg-yellow-200={r.outcome === "partial"}
            class:bg-red-200={r.outcome === "fail"}
          >
            <div class="flex justify-between items-center">
              <div class="font-semibold">
                {$nightState.nightlyTasks.find(t => t.id === r.taskId)?.name}
              </div>
              <div class="text-sm opacity-80">
                Roll: {r.roll} + {r.bonus} → {r.total} vs {r.difficulty}
              </div>
            </div>
            <p class="text-sm mt-1 italic">{r.narrative}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

{#if $currentStep.key === "dayEnd"}
  <div class="p-6 bg-gray-100 rounded shadow space-y-4">
    <h2 class="text-2xl font-semibold">Day Recap</h2>

    {#if $taskResults}
      <ul class="space-y-2">
        {#each $taskResults as r}
          <li class="flex justify-between p-2 rounded
                     transition-colors duration-200
                     {r.outcome === 'success' ? 'bg-green-200' : ''}
                     {r.outcome === 'partial' ? 'bg-yellow-200' : ''}
                     {r.outcome === 'fail' ? 'bg-red-200' : ''}">
            <span>{$nightState.nightlyTasks.find(t => t.id === r.taskId)?.name}</span>
            <span class="italic">{r.outcome}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}



  <!-- CONTINUE BUTTON -->
<div class="mt-6">
  <button
    class="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition"
    on:click={() => {
      switch ($currentStep.key) {

        // Step where the player assigns items to the doll
        case "giveDollItems":
          resolveNightTasks(); // Doll attempts chores
          nextStep();
          break;

        // Doll is attempting chores (just viewing results)
        case "dollAttemptsChores":
          nextStep();
          break;

        // Day end step: update progress and decide next action
        case "dayEnd":
          applyNightProgress(); // update progress immediately
          daysElapsed.update(d => d + 1); // increment day count

          // force Svelte to notice the change
          tick().then(() => {
            if (get(totalPoints) >= VICTORY_POINTS) {
              currentStepIndex.set(allGameSteps.length - 1); // winStep
            } else {
              startNight();
              currentStepIndex.set(0); // nightStart
            }
          });
          break;

        // Win step: reset the game
        case "win":
          overallProgress.set(0); // Reset progress
          startNight();
          currentStepIndex.set(0); // Start at nightStart
          break;

        // All other steps (story beats)
        default:
          nextStep();
          break;
      }
    }}
  >
    {$currentStep.continueText}
  </button>
</div>


<!-- Main Content Above -->

<!-- Always visible progress bar -->
<div class="fixed bottom-0 left-0 right-0 p-4 bg-gray-200 shadow-inner">
  <div class="w-full h-4 bg-gray-300 rounded overflow-hidden">
    <div
      class="h-4 bg-purple-600 rounded transition-all duration-500"
      style="width: {$overallProgress}%"
    ></div>
  </div>
  <p class="text-sm mt-1 text-center">Overall Progress: {$overallProgress.toFixed(1)}%</p>
</div>

</div>
