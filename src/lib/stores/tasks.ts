import { writable, derived } from "svelte/store";

// types
export interface Task {
  id: number;
  name: string;
  difficulty?: number;
}

export interface Item {
  id: number;
  name: string;
}

export interface ItemTaskLink {
  itemId: number;
  taskId: number;
}

// base data
export const tasks = writable<Task[]>([
    { id: 1, name: "Sweep the dirt, dust, and ash from the living area." },
    { id: 2, name: "Brush away the soot that drifts down from the ever-smoldering stove." },
    { id: 3, name: "Sweep under the crooked furniture." },
    { id: 4, name: "Chase away enchanted dust-bunnies that scurry like small animals." },
    { id: 5, name: "Smooth down the creaking floorboards so they stop whispering." },
    { id: 6, name: "Collect twigs, bones, feathers, and other forest debris." },
    { id: 7, name: "Polish the skulls on the bone fence so their eye sockets glow evenly." },
    { id: 8, name: "Clear creeping vines that try to bind the gate shut." },
    { id: 9, name: "Shovel away piles of ash left by burnt intruders." },
    { id: 10, name: "Separate black grains from good wheat kernels one by one." },
    { id: 11, name: "Remove wild peas that mimic wheat and try to hide." },
    { id: 12, name: "Brush away enchanted chaff that moves on its own." },
    { id: 13, name: "Inspect each poppy seed." },
    { id: 14, name: "Pick out hollow seeds filled with whispers." },
    { id: 15, name: "Discard any seeds that wriggle like insects." },
    { id: 16, name: "Count the seeds to ensure none escaped or multiplied." },
    { id: 17, name: "Rub warming oil onto the hut's legs to keep them from stiffening." },
    { id: 18, name: "Check the hut's talons for splinters or stuck bones." },
    { id: 19, name: "Trim the hut's overgrown feathers." },
    { id: 20, name: "Brush away mud and moss from the hut's ankles." },
]);

export const items = writable<Item[]>([
    { id: 101, name: "Birch-Twig Broom" },
    { id: 102, name: "Bone-Handled Tweezers" },
    { id: 103, name: "Lantern of Quiet Flames" },
    { id: 104, name: "Moss-Oil Salve" },
    { id: 105, name: "Cat-Tongue Brush" },
    { id: 106, name: "Ash-Sieve" },
    { id: 107, name: "Spirit-Thread Twine" },
    { id: 108, name: "Witch's Foraging Knife" },
    { id: 109, name: "Bottle of Dawn-Caught Dew" },
    { id: 110, name: "Whisper-Bead Pouch" },
    { id: 111, name: "Ember-Bristle Hearthbrush" },
    { id: 112, name: "Soot-Swallowing Jar" },
    { id: 113, name: "Crooked-Furniture Lifter" },
    { id: 114, name: "Dust-Bunny Net" },
    { id: 115, name: "Sleep-Oil Wood Polish" },
    { id: 116, name: "Bone-Scoop Rake" },
    { id: 117, name: "Skull-Gleam Paste" },
    { id: 118, name: "Vine-Snap Shears" },
    { id: 119, name: "Ash-Shovel of Lightness" },
    { id: 120, name: "Kernel-Culling Tray" },
]);

// associative table
export const itemTask = writable<ItemTaskLink[]>([
  // 1. Sweep the dirt, dust, and ash
  { itemId: 101, taskId: 1 }, // Birch-Twig Broom
  { itemId: 111, taskId: 1 }, // Ember-Bristle Hearthbrush
  { itemId: 119, taskId: 1 }, // Ash-Shovel of Lightness (light ash clearing)

  // 2. Brush away soot drifting from stove
  { itemId: 101, taskId: 2 }, // Birch-Twig Broom
  { itemId: 111, taskId: 2 }, // Ember-Bristle Hearthbrush
  { itemId: 112, taskId: 2 }, // Soot-Swallowing Jar

  // 3. Sweep under crooked furniture
  { itemId: 101, taskId: 3 }, // Birch-Twig Broom
  { itemId: 113, taskId: 3 }, // Crooked-Furniture Lifter

  // 4. Chase enchanted dust-bunnies
  { itemId: 101, taskId: 4 }, // Birch-Twig Broom
  { itemId: 112, taskId: 4 }, // Soot-Swallowing Jar
  { itemId: 114, taskId: 4 }, // Dust-Bunny Net

  // 5. Smooth down creaking floorboards
  { itemId: 104, taskId: 5 }, // Moss-Oil Salve (smooth)
  { itemId: 115, taskId: 5 }, // Sleep-Oil Wood Polish (silence)

  // 6. Collect twigs, bones, feathers, debris
  { itemId: 101, taskId: 6 }, // Birch-Twig Broom (light debris)
  { itemId: 116, taskId: 6 }, // Bone-Scoop Rake

  // 7. Polish skulls on bone fence
  { itemId: 102, taskId: 7 }, // Tweezers (fine detail)
  { itemId: 103, taskId: 7 }, // Lantern (inspect)
  { itemId: 105, taskId: 7 }, // Cat-Tongue Brush
  { itemId: 117, taskId: 7 }, // Skull-Gleam Paste

  // 8. Clear creeping vines from gate
  { itemId: 104, taskId: 8 }, // Moss-Oil Salve (loosen vines)
  { itemId: 107, taskId: 8 }, // Spirit-Thread Twine (tug vines)
  { itemId: 108, taskId: 8 }, // Foraging Knife (cut vines)
  { itemId: 118, taskId: 8 }, // Vine-Snap Shears

  // 9. Shovel ash from burnt intruders
  { itemId: 119, taskId: 9 }, // Ash-Shovel of Lightness
  { itemId: 111, taskId: 9 }, // Ember-Bristle Hearthbrush (heavy ash)
  { itemId: 112, taskId: 9 }, // Soot-Swallowing Jar (airborne dust)

  // 10. Separate black grains from wheat
  { itemId: 102, taskId: 10 }, // Tweezers
  { itemId: 106, taskId: 10 }, // Ash-Sieve
  { itemId: 120, taskId: 10 }, // Kernel-Culling Tray
  { itemId: 103, taskId: 10 }, // Lantern (illumination)

  // 11. Remove wild peas that mimic wheat
  { itemId: 102, taskId: 11 }, // Tweezers
  { itemId: 106, taskId: 11 }, // Ash-Sieve

  // 12. Brush away enchanted chaff
  { itemId: 101, taskId: 12 }, // Birch-Twig Broom
  { itemId: 106, taskId: 12 }, // Ash-Sieve
  { itemId: 111, taskId: 12 }, // Ember-Bristle Hearthbrush
  { itemId: 112, taskId: 12 }, // Soot-Swallowing Jar

  // 13. Inspect each poppy seed
  { itemId: 102, taskId: 13 }, // Tweezers
  { itemId: 103, taskId: 13 }, // Lantern
  { itemId: 106, taskId: 13 }, // Ash-Sieve

  // 14. Pick out hollow seeds filled with whispers
  { itemId: 102, taskId: 14 }, // Tweezers
  { itemId: 103, taskId: 14 }, // Lantern
  { itemId: 120, taskId: 14 }, // Kernel-Culling Tray

  // 15. Discard wriggling seeds
  { itemId: 102, taskId: 15 }, // Tweezers
  { itemId: 106, taskId: 15 }, // Ash-Sieve
  { itemId: 120, taskId: 15 }, // Kernel-Culling Tray

  // 16. Count the seeds
  { itemId: 103, taskId: 16 }, // Lantern (counting, inspection)
  { itemId: 120, taskId: 16 }, // Kernel-Culling Tray

  // 17. Rub warming oil on hut legs
  { itemId: 104, taskId: 17 }, // Moss-Oil Salve

  // 18. Check hut talons for stuck bones
  { itemId: 105, taskId: 18 }, // Cat-Tongue Brush (cleaning)
  { itemId: 108, taskId: 18 }, // Foraging Knife (removal)

  // 19. Trim the hut’s feathers
  { itemId: 108, taskId: 19 }, // Foraging Knife
  { itemId: 118, taskId: 19 }, // Vine-Snap Shears (similar trimming)

  // 20. Brush mud & moss from hut ankles
  { itemId: 101, taskId: 20 }, // Birch-Twig Broom
  { itemId: 105, taskId: 20 }, // Cat-Tongue Brush
  { itemId: 104, taskId: 20 }, // Moss-Oil Salve
]);

export function getItemsForTask(taskId: number): Item[] {
    const links = get(itemTask);
    const allItems = get(items);

    return links
        .filter(link => link.taskId === taskId)
        .map(link => allItems.find(i => i.id === link.itemId)!)
        .filter(Boolean);
}

export function getTasksForItem(itemId: number): Task[] {
    const links = get(itemTask);
    const allTasks = get(tasks);

    return links
        .filter(link => link.itemId === itemId)
        .map(link => allTasks.find(t => t.id === link.taskId)!)
        .filter(Boolean);
}



import { get } from "svelte/store";

// Selected task (UI-controlled)
export const selectedTaskId = writable<number | null>(null);

// Items that can do the selected task
export const itemsForSelectedTask = derived(
    [itemTask, items, selectedTaskId],
    ([$itemTask, $items, $taskId]) => {
        if ($taskId === null) return [];
        return $itemTask
            .filter(link => link.taskId === $taskId)
            .map(link => $items.find(i => i.id === link.itemId)!)
            .filter(Boolean);
    }
);
