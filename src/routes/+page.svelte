<script lang="ts">
  import { currentStep, nextStep, nightState, startNight } from "$lib/stores/game";
  import { getTasksForItem } from "$lib/stores/tasks";

  import type { Item, Task } from "$lib/stores/tasks";

  // Hover state
  let hoveredItem: Item | null = null;
  let hoverTasks: Task[] = [];

  // On mount, start the night with random items/tasks
  import { onMount } from "svelte";
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
              class="p-2 rounded"
              class:bg-purple-200={
                $nightState.dollItems.some(i => getTasksForItem(i.id).some(task => task.id === t.id)) ||
                (hoveredItem && getTasksForItem(hoveredItem.id).some(task => task.id === t.id))
              }
            >
              {t.name}
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
      <p class="text-gray-700">Story beat or instructions for this step go here.</p>
    </div>
  {/if}

  <!-- CONTINUE BUTTON -->
  <div class="mt-6">
    <button
      class="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition"
      on:click={() => {
        // If we're moving to getTasks, start a new night
        if ($currentStep.key === "dayEnd") startNight();
        nextStep();
      }}
    >
      {$currentStep.continueText}
    </button>
  </div>
</div>
