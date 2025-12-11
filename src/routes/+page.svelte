<script lang="ts">
  import { items } from "$lib/stores/tasks";
  import { getTasksForItem } from "$lib/stores/tasks";

  import type { Item, Task } from "$lib/stores/tasks";

  let hoveredItem: Item | null = null;
  let taskList: Task[] = [];

  function handleHover(item: Item) {
    hoveredItem = item;
    taskList = getTasksForItem(item.id);
  }
</script>

<div class="flex h-full w-full">
  <!-- LEFT SIDE: Task list -->
  <div class="w-1/2 p-6 border-r border-gray-300">
    {#if hoveredItem}
      <h2 class="text-2xl font-bold mb-2">{hoveredItem.name}</h2>
      <p class="text-gray-600 mb-4">Tasks this item can perform:</p>

      <ul class="space-y-2">
        {#each taskList as t}
          <li class="p-2 bg-purple-100 rounded shadow-sm">
            {t.name}
          </li>
        {/each}
      </ul>
    {:else}
      <h2 class="text-xl font-semibold text-gray-500">
        Hover an item →
      </h2>
      <p class="text-gray-400">Tasks will appear here.</p>
    {/if}
  </div>

  <!-- RIGHT SIDE: Item list -->
  <div class="w-1/2 p-6">
    <h2 class="text-2xl font-bold mb-4">Items</h2>

    <ul class="space-y-2">
      {#each $items as item}
        <li
          on:mouseover={() => handleHover(item)}
          on:focus={() => handleHover(item)}
          tabindex="0"
          class="p-2 rounded cursor-pointer transition 
                 hover:bg-purple-200 hover:text-purple-900
                 focus:bg-purple-200 focus:text-purple-900"
        >
          {item.name}
        </li>
      {/each}
    </ul>
  </div>
</div>
