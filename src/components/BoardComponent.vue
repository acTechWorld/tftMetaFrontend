<template>
  <div class="flex p-6">
    <div class="w-48 h-fit border-2 border-gray-300 rounded-xl p-4 flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-center">Traits</h2>
      <div v-if="activeTraits.length" class="flex flex-col gap-2">
        <div v-for="trait in activeTraits" :key="trait.id" class="flex items-center gap-2">
          <img :src="`/img/tft-trait/${trait.url}`" class="w-6 h-6 " :class="trait.currentThresholdIndex === -1 ? 'bg-gray-400' : 'bg-orange-400'" alt="" />
          <span>{{ trait.count }}</span>
          <div class="flex flex-col">
            <span>{{ trait.name }}</span>
            <span v-if="trait.currentThresholdIndex === -1">
              {{ trait.count }}/{{ trait.thresholds[0] }}
            </span>
            <div v-else>
              <span v-for="(n, index) in trait.thresholds" :key="index"> 
                 <span :class="index === trait.currentThresholdIndex ? 'font-bold text-green-500' : ''">{{ n }}</span>
                <span v-if="index < trait.thresholds.length - 1"> &gt; </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 text-center">No active traits</p>
    </div>
    <div class="flex gap-6 flex-col max-w-7xl mx-auto" @dragend="currentInventoryDrag = null">
      <!-- Hex Board -->
      <div class="self-center -translate-x-10">
        <div v-for="(row, r) in rows" :key="r" class="flex gap-2">
          <HexTile
            v-for="(col, c) in cols"
            :key="`${r}-${c}`"
            :class="r % 2 === 0 ? '' : 'translate-x-1/2'"
            :current-inventory-drag="currentInventoryDrag"
            :main="board[r][c].main"
            :subs="board[r][c].subs"
            @drag-start="(item) => onTileDragStart(item, r, c)"
            @drop-main="(item) => handleMainDrop(r, c, item)"
            @drop-sub="(item) => handleSubDrop(r, c, item)"
            @remove-main="removeMain(r, c)"
            @remove-sub="(index) => (board[r][c].subs[index] = null)"
          />
        </div>
      </div>

      <!-- Inventory Panel -->
      <div class="flex gap-2 p-10" @dragover.prevent @drop.prevent="handleInventoryDrop">
        <!-- Champions -->
        <div class="border-2 border-gray-300 rounded-xl w-full">
          <div class="flex flex-wrap p-2 gap-1 justify-center">
            <InventoryItem
              class="w-10 h-10"
              v-for="champion in displayedChampions"
              :key="champion.name"
              type="champion"
              :id="champion.id"
              :src="champion.url"
              @drag-start="(el) => (currentInventoryDrag = el)"
            />
          </div>
        </div>

        <!-- Items -->
        <div class="border-2 border-gray-300 rounded-xl w-full">
          <div class="flex flex-wrap p-2 gap-1 justify-center">
            <InventoryItem
              class="w-8 h-8"
              v-for="item in displayedItems"
              :key="item.name"
              :id="item.id"
              type="item"
              :src="item.url"
              @drag-start="(el) => (currentInventoryDrag = el)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HexTile from './HexTile.vue'
import InventoryItem from './InventoryItem.vue'
import { champions, items, mappingChampionsTraits, championTraits } from '@/assets/datas'

export interface DragItem {
  id: string
  type: string
  src: string
}
type Inventory = { id: string; name: string; url: string }

const rows = 4
const cols = 7

type BoardTile = {
  main: DragItem | null
  subs: (DragItem | null)[]
}

// 2D board state (rows × cols)
const board = ref<BoardTile[][]>(
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      main: null,
      subs: [null, null, null],
    })),
  ),
)

const currentInventoryDrag = ref<DragItem | null>(null)

const dragSource = ref<{ r: number; c: number } | null>(null) // source tile if drag from a HexTile
//COMPUTED
const displayedChampions = computed<Inventory[]>(() =>
  champions.map((c) => ({
    id: c.id,
    name: c.name,
    url: `/img/tft-champion/${c.id}.TFT_Set15.png`,
  })),
)

const displayedItems = computed<Inventory[]>(() =>
  items.map((i) => ({
    id: i.id,
    name: i.name,
    url: `/img/tft-item/${i.id}.png`,
  })),
)

const activeTraits = computed(() => {
  const traitCountMap: Record<string, number> = {};
  const countedChampions = new Set<string>();

  // Count champions (each champion only once)
  for (const row of board.value) {
    for (const tile of row) {
      const champ = tile.main;
      if (!champ) continue;

      const champId = champ.id;
      if (!champId || countedChampions.has(champId)) continue;

      countedChampions.add(champId);

      const traits = mappingChampionsTraits[champId as keyof typeof mappingChampionsTraits];
      if (traits) {
        traits.forEach((traitId) => {
          traitCountMap[traitId] = (traitCountMap[traitId] || 0) + 1;
        });
      }
    }
  }

  // Build trait objects
  let traits = championTraits
    .filter((trait) => traitCountMap[trait.id])
    .map((trait) => {
      const count = traitCountMap[trait.id];
      const thresholds = trait.bonuses.map((b) => b.needed).filter((n) => n !== null) as number[];
      const firstNeeded = thresholds[0] || 0;

      if (count < firstNeeded) {
        // Inactive trait
        return { ...trait, count, thresholds, currentThresholdIndex: -1 };
      } else {
        // Active trait
        let currentThresholdIndex = thresholds.findIndex((n) => count < n) - 1;
        if (currentThresholdIndex < 0) currentThresholdIndex = thresholds.length - 1;

        return { ...trait, count, thresholds, currentThresholdIndex };
      }
    });

  // Sorting
  traits.sort((a, b) => {
    const aActive = a.currentThresholdIndex !== -1;
    const bActive = b.currentThresholdIndex !== -1;

    // Active traits first
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    if (aActive && bActive) {
      // Both active → sort by currentThresholdIndex desc, then count desc
      if (b.currentThresholdIndex! !== a.currentThresholdIndex!) {
        return b.currentThresholdIndex! - a.currentThresholdIndex!;
      }
      return b.count - a.count;
    }

    // Both inactive → sort by count desc
    return b.count - a.count;
  });

  return traits;
});


//METHODS
function onTileDragStart(item: DragItem, r?: number, c?: number) {
  currentInventoryDrag.value = item
  if (r !== undefined && c !== undefined) {
    dragSource.value = { r, c }
  } else {
    dragSource.value = null // drag from inventory
  }
}
function removeMain(r: number, c: number) {
  board.value[r][c].main = null
  board.value[r][c].subs = [null, null, null]
}

function handleMainDrop(r: number, c: number, champion: DragItem) {
  if (!dragSource.value) {
    // Coming from inventory → just place champ and clear subs
    board.value[r][c].main = champion
    board.value[r][c].subs = [null, null, null]
  } else {
    const { r: sr, c: sc } = dragSource.value

    const sourceTile = board.value[sr][sc]
    const targetTile = board.value[r][c]

    if (targetTile.main) {
      // ✅ Swap champions & subs
      const tempMain = targetTile.main
      const tempSubs = [...targetTile.subs]

      targetTile.main = sourceTile.main
      targetTile.subs = [...sourceTile.subs]

      sourceTile.main = tempMain
      sourceTile.subs = [...tempSubs]
    } else {
      // ✅ Just move champ + subs to empty spot
      targetTile.main = sourceTile.main
      targetTile.subs = [...sourceTile.subs]

      sourceTile.main = null
      sourceTile.subs = [null, null, null]
    }
  }

  resetDrag()
}

function handleSubDrop(r: number, c: number, item: DragItem) {
  const targetTile = board.value[r][c]

  if (!targetTile.main) {
    // No champion → cannot place sub, exit early
    return
  }

  // Remove from source if moving between tiles
  if (dragSource.value) {
    const { r: sr, c: sc } = dragSource.value
    board.value[sr][sc].subs = board.value[sr][sc].subs.map((s) => (s === item ? null : s))
  }

  // Place item in first empty sub slot
  const emptyIndex = targetTile.subs.findIndex((s) => !s)
  if (emptyIndex !== -1) {
    targetTile.subs[emptyIndex] = item
  }

  resetDrag()
}

function handleInventoryDrop(e: DragEvent) {
  e.preventDefault()
  if (currentInventoryDrag.value && dragSource.value) {
    const { r: sr, c: sc } = dragSource.value
    if (currentInventoryDrag.value.type === 'champion') {
      //Champion remove
      board.value[sr][sc].main = null
      //All Item remove
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      board.value[sr][sc].subs = [null, null, null]
    } else {
      //Item remove
      board.value[sr][sc].subs = board.value[sr][sc].subs.map((s) =>
        s === currentInventoryDrag.value ? null : s,
      )
    }
  }
  resetDrag()
}

function resetDrag() {
  currentInventoryDrag.value = null
  dragSource.value = null
}
</script>
