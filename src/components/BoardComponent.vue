<template>
  <div class="flex p-6">
    <div class="w-48 h-fit border-2 border-gray-300 rounded-xl p-4 flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-center">Traits</h2>
      <div v-if="activeTraits.length" class="flex flex-col gap-2">
        <div v-for="trait in activeTraits" :key="trait.id" class="flex items-center gap-2">
          <img
            :src="`/img/tft-trait/${trait.url}`"
            class="w-6 h-6"
            :class="trait.currentThresholdIndex === -1 ? 'bg-gray-400' : 'bg-orange-400'"
            alt=""
          />
          <span>{{ trait.count }}</span>
          <div class="flex flex-col">
            <span>{{ trait.name }}</span>
            <span v-if="trait.currentThresholdIndex === -1">
              {{ trait.count }}/{{ trait.thresholds[0] }}
            </span>
            <div v-else>
              <span v-for="(n, index) in trait.thresholds" :key="index">
                <span
                  :class="index === trait.currentThresholdIndex ? 'font-bold text-green-500' : ''"
                  >{{ n }}</span
                >
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
        <div class="border-2 border-gray-300 rounded-xl w-full flex flex-col">
          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button
              v-for="kind in itemKinds"
              :key="kind"
              @click="activeItemKind = kind"
              class="flex-1 py-2 text-sm font-medium capitalize transition-colors"
              :class="[
                activeItemKind === kind
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              ]"
            >
              {{ kind }}
            </button>
          </div>

          <!-- Items Grid -->
          <div class="flex flex-wrap gap-1 justify-center p-2 overflow-y-auto max-h-[400px]">
            <InventoryItem
              v-for="item in displayedItems"
              :key="item.id"
              type="item"
              class="w-8 h-8"
              :id="item.id"
              :src="item.url"
              @drag-start="(el) => (currentInventoryDrag = el)"
            />
            <p v-if="!displayedItems.length" class="text-xs text-gray-400 text-center w-full py-6">
              No {{ activeItemKind }} items
            </p>
          </div>
        </div>
      </div>
    </div>
<!-- 🆕 Equipped Items Panel -->
<div class="w-56 h-fit border-2 border-gray-300 rounded-xl p-4 flex flex-col gap-3 overflow-y-auto max-h-[800px]">
  <h2 class="text-lg font-semibold text-center">Equipped Items</h2>

  <!-- 🧩 Full Items Section -->
  <div v-if="equippedItemsList.length" class="flex flex-col gap-2">
    <div
      v-for="item in equippedItemsList"
      :key="item.id"
      class="flex flex-col border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition"
    >
      <div class="flex items-center gap-2">
        <img
          :src="`/img/tft-item/${item.id}.png`"
          class="w-6 h-6 rounded"
          alt=""
        />
        <div class="flex flex-col">
          <span class="text-sm font-medium">{{ item.name }}</span>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span>×{{ item.count }}</span>
            <span v-if="item.unique" class="text-red-500 font-semibold">Unique</span>
          </div>
        </div>
      </div>

      <!-- 🧩 Show build icons if it’s a composed item -->
      <div
        v-if="item.build?.length"
        class="flex items-center gap-1 mt-1 ml-8"
      >
        <template v-for="(comp, index) in item.build" :key="comp.id">
          <img
            :src="`/img/tft-item/${comp.id}.png`"
            class="w-5 h-5 rounded"
            alt=""
          />
          <span v-if="index < item.build.length - 1" class="text-gray-400 text-xs">×</span>
        </template>
      </div>
    </div>
  </div>
  <p v-else class="text-sm text-gray-400 text-center">No items equipped</p>

  <!-- 🧱 Divider -->
  <div class="border-t border-gray-300 my-2"></div>

  <!-- 🧩 Total Basic Items Section -->
  <div>
    <h3 class="text-base font-semibold text-center mb-1">Basic Items Needed</h3>

    <div v-if="totalBasicItems.length" class="flex flex-col gap-2">
      <div
        v-for="item in totalBasicItems"
        :key="item.id"
        class="flex items-center gap-2 border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition"
      >
        <img
          :src="`/img/tft-item/${item.id}.png`"
          class="w-5 h-5 rounded"
          alt=""
        />
        <div class="flex flex-col">
          <span class="text-sm font-medium">{{ item.name }}</span>
          <span class="text-xs text-gray-500">×{{ item.count }}</span>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-gray-400 text-center">No basic items required</p>
  </div>
</div>




  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HexTile from './HexTile.vue'
import InventoryItem from './InventoryItem.vue'
import { champions, items, mappingChampionsTraits, championTraits, itemKinds } from '@/assets/datas'

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
const activeItemKind = ref(itemKinds[0])

const dragSource = ref<{ r: number; c: number } | null>(null) // source tile if drag from a HexTile
//COMPUTED
const displayedChampions = computed<Inventory[]>(() =>
  champions.map((c) => ({
    id: c.id,
    name: c.name,
    url: `/img/tft-champion/${c.id}.TFT_Set15.png`,
  })),
)

const displayedItems = computed(() => {
  const currentKind = activeItemKind.value
  return items
    .filter((item) => item.kind === currentKind)
    .map((i) => ({
      id: i.id,
      name: i.name,
      url: `/img/tft-item/${i.id}.png`,
    }))
})

const equippedEmblems = computed(() => {
  const traitCountMap: Record<string, number> = {}

  for (const row of board.value) {
    for (const tile of row) {
      if (!tile.main) continue

      for (const sub of tile.subs) {
        if (!sub) continue

        const item = items.find((i) => i.id === sub.id)
        if (item && item.kind === 'emblem' && item.emblemTrait) {
          const trait = item.emblemTrait
          traitCountMap[trait] = (traitCountMap[trait] || 0) + 1
        }
      }
    }
  }

  return Object.entries(traitCountMap).map(([trait, count]) => ({ trait, count }))
})

const equippedItemsList = computed(() => {
  const itemCountMap: Record<string, number> = {}

  // 1️⃣ Count equipped items
  for (const row of board.value) {
    for (const tile of row) {
      for (const sub of tile.subs) {
        if (!sub) continue
        itemCountMap[sub.id] = (itemCountMap[sub.id] || 0) + 1
      }
    }
  }

  // 2️⃣ Build summary array
  return Object.entries(itemCountMap)
    .map(([id, count]) => {
      const fullItem = items.find(i => i.id === id)
      const build = (fullItem?.build || [])
        .map(bid => items.find(i => i.id === bid))
        .filter((i) => !!i)

      return {
        id,
        name: fullItem?.name || id,
        count,
        unique: fullItem?.unique || false,
        build, // 🧩 list of basic items
      }
    })
    .sort((a, b) => b.count - a.count)
})




const activeTraits = computed(() => {
  const traitCountMap: Record<string, number> = {}
  const countedChampions = new Set<string>()

  // 🧩 1️⃣ Count champions (each champion only once)
  for (const row of board.value) {
    for (const tile of row) {
      const champ = tile.main
      if (!champ) continue

      const champId = champ.id
      if (!champId || countedChampions.has(champId)) continue

      countedChampions.add(champId)

      const traits = mappingChampionsTraits[champId as keyof typeof mappingChampionsTraits]
      if (traits) {
        traits.forEach((traitId) => {
          traitCountMap[traitId] = (traitCountMap[traitId] || 0) + 1
        })
      }
    }
  }

  // 🧩 2️⃣ Add emblem-based trait counts
  for (const { trait, count } of equippedEmblems.value) {
    // Try to find the trait by name
    const t = championTraits.find(
      (ct) => ct.id.toLowerCase() === trait.toLowerCase()
    ) 
    if (t) {
      traitCountMap[t.id] = (traitCountMap[t.id] || 0) + count
    }
  }

  // 🧩 3️⃣ Build trait objects
  const traits = championTraits
    .filter((trait) => traitCountMap[trait.id])
    .map((trait) => {
      const count = traitCountMap[trait.id]
      const thresholds = trait.bonuses.map((b) => b.needed).filter((n) => n !== null) as number[]
      const firstNeeded = thresholds[0] || 0

      if (count < firstNeeded) {
        // Inactive trait
        return { ...trait, count, thresholds, currentThresholdIndex: -1 }
      } else {
        // Active trait
        let currentThresholdIndex = thresholds.findIndex((n) => count < n) - 1
        if (currentThresholdIndex < 0) currentThresholdIndex = thresholds.length - 1

        return { ...trait, count, thresholds, currentThresholdIndex }
      }
    })

  // 🧩 4️⃣ Sorting (same as before)
  traits.sort((a, b) => {
    const aActive = a.currentThresholdIndex !== -1
    const bActive = b.currentThresholdIndex !== -1

    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1

    if (aActive && bActive) {
      if (b.currentThresholdIndex! !== a.currentThresholdIndex!) {
        return b.currentThresholdIndex! - a.currentThresholdIndex!
      }
      return b.count - a.count
    }

    return b.count - a.count
  })

  return traits
})


const totalBasicItems = computed(() => {
  const basicCountMap: Record<string, number> = {}

  // Loop through equipped full items
  for (const item of equippedItemsList.value) {
    // Skip if no build (i.e., basic items themselves)
    if (!item.build?.length) continue

    for (const comp of item.build) {
      basicCountMap[comp.id] = (basicCountMap[comp.id] || 0) + item.count
    }
  }

  // Map to full item objects for display
  return Object.entries(basicCountMap)
    .map(([id, count]) => {
      const fullItem = items.find(i => i.id === id)
      return {
        id,
        name: fullItem?.name || id,
        count,
      }
    })
    .sort((a, b) => b.count - a.count)
})



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
  const targetTile = board.value[r][c];

  if (!targetTile.main) {
    // No champion → cannot place sub
    return;
  }

  // Get full item data
  const fullItem = items.find(i => i.id === item.id);
  if (!fullItem) return;

  const championId = targetTile.main.id;

  // --- Check uniqueness ---
  if (fullItem.unique) {
    const alreadyEquipped = board.value.some(row =>
      row.some(tile =>
        tile.main?.id === championId && tile.subs.some(s => s?.id === item.id)
      )
    );
    if (alreadyEquipped) {
      // Cannot equip this unique item again on the same champion
      return;
    }
  }

  // --- Check incompatible traits ---
  if (fullItem.incompatibleTraits && fullItem.incompatibleTraits.length) {
    // Get champion's traits
    const championTraitsIds: string[] = mappingChampionsTraits[championId as keyof typeof mappingChampionsTraits] || [];

    // If champion has any incompatible trait, cancel
    const hasIncompatible = fullItem.incompatibleTraits.some((traitId: string) =>
      championTraitsIds.includes(traitId)
    );

    if (hasIncompatible) {
      return; // Cannot equip item on this champion
    }
  }

  // Remove from source if moving between tiles
  if (dragSource.value) {
    const { r: sr, c: sc } = dragSource.value;
    board.value[sr][sc].subs = board.value[sr][sc].subs.map(s => (s === item ? null : s));
  }

  // Place item in first empty sub slot
  const emptyIndex = targetTile.subs.findIndex(s => !s);
  if (emptyIndex !== -1) {
    targetTile.subs[emptyIndex] = item;
  }

  resetDrag();
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
