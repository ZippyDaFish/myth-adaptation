<script lang="ts">
  import type { TaskResult } from "$lib/stores/game";

  import { currentStep, nextStep, nightState, startNight, resolveNightTasks, taskResults, applyNightProgress, overallProgress, currentStepIndex, allGameSteps, totalPoints, VICTORY_POINTS, daysElapsed, introShown } from "$lib/stores/game";
  import { getTasksForItem } from "$lib/stores/tasks";

  import type { Item, Task } from "$lib/stores/tasks";

  import { tick } from "svelte";
  import { onMount } from "svelte";
  import { get } from "svelte/store";


  let rolling = false;

  // Hover state
  let hoveredItem: Item | null = null;
  let hoverTasks: Task[] = [];

  // On mount, start the night with random items/tasks
  onMount(() => {
    if (!get(introShown)) {
      introShown.set(true);
      currentStepIndex.set(allGameSteps.findIndex(s => s.key === "intro"));
    } else {
      currentStepIndex.set(allGameSteps.findIndex(s => s.key === "nightStart"));
    }
    startNight(); // prepare the first night
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
    const dollSupport = $nightState.dollItems.filter(item =>
      getTasksForItem(item.id).some(t => t.id === taskId)
    ).length;

    const hoverSupport =
      hoveredItem &&
      getTasksForItem(hoveredItem.id).some(t => t.id === taskId)
        ? 1
        : 0;

    return dollSupport + hoverSupport;
  }

  function taskOddsClass(taskId: number): string {
    const count = supportingItemCount(taskId);

    if (count >= 4) return "bg-emerald-500 text-white font-semibold shadow-inner";
    if (count === 3) return "bg-green-400 text-green-900 font-semibold shadow-inner";
    if (count === 2) return "bg-green-200 text-green-900 shadow-inner";
    if (count === 1) return "bg-yellow-300 text-yellow-900 shadow-inner";
    return "bg-gray-800 text-gray-200";
  }

  function taskOutcomeClass(outcome: "success" | "partial" | "fail"): string {
    if (outcome === "success") return "bg-emerald-500 text-white font-semibold shadow-md rounded-lg";
    if (outcome === "partial") return "bg-purple-600 text-white font-semibold shadow-md rounded-lg";
    if (outcome === "fail") return "bg-red-700 text-white font-semibold shadow-md rounded-lg";
    return "bg-gray-800 text-gray-200 rounded-lg";
  }

</script>

<!-- Full-screen centered container -->
<div class="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white font-serif">
  <!-- Game Title (outside scrollable container) -->
  <h1 class="text-4xl md:text-5xl font-bold text-center tracking-wide mb-6 drop-shadow-lg">
    The Witch's Chores
  </h1>

  <div class="max-w-4xl w-full p-8 bg-black/70 rounded-3xl shadow-xl border border-purple-700 flex flex-col space-y-8
            max-h-[75vh] overflow-y-auto">

    <!-- Items & Tasks Panels -->
    {#if ["getTasks", "listItems", "giveDollItems"].includes($currentStep.key)}
      <div class="flex flex-col md:flex-row gap-6">

        <!-- Available items -->
        <div class="md:w-1/2 p-4 bg-purple-900/40 rounded-2xl border border-purple-600 shadow-inner space-y-4">
          <h2 class="text-2xl font-semibold text-purple-200 mb-2">Available Items</h2>
          <ul class="space-y-2">
            {#each $nightState.availableItems as item}
              <li
                on:mouseover={() => handleHover(item)}
                on:focus={() => handleHover(item)}
                on:click={() => toggleDollItem(item)}
                tabindex="0"
                class="p-3 rounded cursor-pointer transition-all hover:bg-purple-700/60 hover:scale-105 hover:text-yellow-300
                       {$nightState.dollItems.some(i => i.id === item.id) ? 'bg-purple-500 font-bold text-yellow-200 shadow-lg' : ''}">
                {item.name}
              </li>
            {/each}
          </ul>
          {#if $currentStep.key === "giveDollItems"}
            <p class="mt-2 text-purple-300 italic">
              Doll Items: {$nightState.dollItems.map(i => i.name).join(", ") || "None"} (Max {maxDollItems})
            </p>
          {/if}
        </div>

        <!-- Tasks panel -->
        <div class="md:w-1/2 p-4 bg-purple-800/40 rounded-2xl border border-purple-600 shadow-inner space-y-4">
          <h2 class="text-2xl font-semibold text-purple-200 mb-2">Item Details / Tasks</h2>
          <ul class="space-y-2">
            {#each $nightState.nightlyTasks as t}
              <li class={`p-3 rounded transition-colors duration-200 ${taskOddsClass(t.id)} shadow-sm`}>
                <div class="flex justify-between items-center">
                  <span>{t.name}</span>
                  {#if supportingItemCount(t.id) > 0 && $currentStep.key === "giveDollItems"}
                    <span class="text-xs text-black-300 font-semibold drop-shadow-md">
                      +{supportingItemCount(t.id)} on 3d6
                    </span>
                  {/if}

                </div>
              </li>
            {/each}
          </ul>

          {#if hoveredItem && $currentStep.key !== "giveDollItems"}
            <h3 class="font-semibold mt-4 text-purple-300">{hoveredItem.name}</h3>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Story beat / Recap -->
    {#if !["getTasks", "listItems", "giveDollItems"].includes($currentStep.key)}
      <div class="p-6 bg-purple-900/50 rounded-2xl border border-purple-600 shadow-inner">
        <h2 class="text-3xl font-semibold text-yellow-200 mb-2">{$currentStep.label}</h2>
        <p class="text-purple-100 leading-relaxed">
          {$currentStep.storyText}
        </p>
      </div>
    {/if}

    <!-- Doll attempts chores -->
    {#if $currentStep.key === "dollAttemptsChores"}
      <div class="p-6 bg-purple-900/50 rounded-2xl border border-purple-600 shadow-inner space-y-4">
        <h2 class="text-2xl font-semibold text-yellow-200">The Doll Sets to Work…</h2>
        {#if $taskResults}
          <ul class="space-y-3">
            {#each $taskResults as r}
              <li class={`p-3 rounded transition-all duration-300 ${taskOutcomeClass(r.outcome)}`}>
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


    <!-- Day end recap -->
    {#if $currentStep.key === "dayEnd"}
      <div class="p-6 bg-purple-900/50 rounded-2xl border border-purple-600 shadow-inner space-y-4">
        <h2 class="text-2xl font-semibold text-yellow-200">Day Recap</h2>
        {#if $taskResults}
          <ul class="space-y-2">
            {#each $taskResults as r}
              <li class={`flex justify-between p-2 rounded transition-all duration-300 ${taskOutcomeClass(r.outcome)}`}>
                <span>{$nightState.nightlyTasks.find(t => t.id === r.taskId)?.name}</span>
                <span class="italic">{r.outcome}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <!-- Continue Button -->
    <div class="flex justify-center">
      <button
        class="px-8 py-3 bg-yellow-400 text-purple-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 hover:scale-105 transition-transform duration-200"
        on:click={() => {
          switch ($currentStep.key) {
            case "giveDollItems":
              resolveNightTasks();
              nextStep();
              break;
            case "dollAttemptsChores":
              nextStep();
              break;
            case "dayEnd":
              applyNightProgress();
              daysElapsed.update(d => d + 1);
              tick().then(() => {
                if (get(totalPoints) >= VICTORY_POINTS) {
                  currentStepIndex.set(allGameSteps.length - 1);
                } else {
                  startNight();
                  currentStepIndex.set(1);
                }
              });
              break;
            case "win":
              overallProgress.set(0);
              daysElapsed.set(0);
              introShown.set(false);
              startNight();
              currentStepIndex.set(0);
              break;
            default:
              nextStep();
              break;
          }
        }}
      >
        {$currentStep.continueText}
      </button>
    </div>
  </div>

  <!-- Always visible progress bar -->
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-black/80 shadow-inner">
    <div class="w-full h-4 bg-purple-700/40 rounded overflow-hidden">
      <div
        class="h-4 bg-yellow-400 rounded transition-all duration-500"
        style="width: {$overallProgress}%"
      ></div>
    </div>
    <p class="text-sm mt-1 text-center text-purple-200">Overall Progress: {$overallProgress.toFixed(1)}%</p>
  </div>
</div>
