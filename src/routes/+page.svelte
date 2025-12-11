<script lang="ts">
  import { currentStep, nextStep } from "$lib/stores/game";
  import { items, tasks, getTasksForItem } from "$lib/stores/tasks";
  import { onMount } from "svelte";

  import type { Item, Task } from "$lib/stores/tasks";

  let dollItems: Item[] = []; // items currently held by the doll
  const maxDollItems = 4;

  let hoveredItem: Item | null = null;
  let hoverTasks: Task[] = [];

  function handleHover(item: Item) {
    hoveredItem = item;
    hoverTasks = getTasksForItem(item.id);
  }

  function toggleDollItem(item: Item) {
    const exists = dollItems.find(i => i.id === item.id);
    if (exists) {
      dollItems = dollItems.filter(i => i.id !== item.id);
    } else if (dollItems.length < maxDollItems) {
      dollItems = [...dollItems, item];
    }
  }
</script>

<div class="p-6">
  <h1 class="text-3xl font-bold mb-4">Witch’s Night Loop</h1>

  {#if $currentStep.key === "giveDollItems"}
    <!-- GIVE DOLL ITEMS STEP -->
    <div class="flex gap-6">
      <!-- LEFT: tasks affected by doll items -->
      <div class="w-1/2 border-r border-gray-300 pr-4">
        <h2 class="text-xl font-semibold mb-2">Tasks (highlighted by doll items)</h2>
        <ul class="space-y-2">
          {#each $tasks as t}
            <li
              class="p-2 rounded"
              class:bg-purple-200={dollItems.some(i => getTasksForItem(i.id).some(task => task.id === t.id))}
            >
              {t.name}
            </li>
          {/each}
        </ul>
      </div>

      <!-- RIGHT: select items for doll -->
      <div class="w-1/2 pl-4">
        <h2 class="text-xl font-semibold mb-2">Available Items</h2>
        <ul class="space-y-2">
          {#each $items as item}
            <li
              on:click={() => toggleDollItem(item)}
              class="p-2 rounded cursor-pointer transition
                     hover:bg-purple-200 hover:text-purple-900
                     {dollItems.some(i => i.id === item.id) ? 'bg-purple-300 font-bold' : ''}"
            >
              {item.name}
            </li>
          {/each}
        </ul>

        <p class="mt-4 text-gray-600">
          Doll Items: {dollItems.map(i => i.name).join(", ") || "None"} (Max {maxDollItems})
        </p>
      </div>
    </div>
  {:else if $currentStep.key === "listItems"}
    <!-- LIST ITEMS STEP -->
    <div class="flex gap-6">
      <ul class="w-1/2 space-y-2">
        {#each $items as item}
          <li
            on:mouseover={() => handleHover(item)}
            on:focus={() => handleHover(item)}
            tabindex="0"
            class="p-2 rounded cursor-pointer transition
                   hover:bg-purple-200 hover:text-purple-900"
          >
            {item.name}
          </li>
        {/each}
      </ul>

      <div class="w-1/2 border-l border-gray-300 pl-4">
        {#if hoveredItem}
          <h2 class="text-xl font-semibold mb-2">{hoveredItem.name}</h2>
          <ul class="space-y-2">
            {#each hoverTasks as t}
              <li class="p-2 bg-purple-100 rounded">{t.name}</li>
            {/each}
          </ul>
        {:else}
          <p class="text-gray-400">Hover an item to see its tasks</p>
        {/if}
      </div>
    </div>
  {:else}
    <!-- STORY BEAT / NON-INTERACTIVE STEPS -->
    <div class="p-4 bg-gray-100 rounded shadow">
      <h2 class="text-2xl font-semibold mb-2">{$currentStep.label}</h2>
      <p class="text-gray-700">
        Story beat or instructions for this step go here.
      </p>
    </div>
  {/if}

  <!-- CONTINUE BUTTON -->
  <div class="mt-6">
    <button
      class="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition"
      on:click={nextStep}
    >
      {$currentStep.continueText}
    </button>
  </div>
</div>
