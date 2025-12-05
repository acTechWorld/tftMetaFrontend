<template>
  <transition name="fade">
    <div
      v-if="showLoadModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 m-2"
    >
      <div
        class="bg-gray-50 dark:bg-gray-800 rounded-xl w-96 max-h-[80vh] overflow-auto p-6 relative"
      >
        <button
          class="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          @click="showLoadModal = false"
        >
          ✕
        </button>
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Load Composition
        </h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="(comp, index) in savedCompositions"
            :key="index"
            class="flex items-center gap-2 cursor-pointer p-2 rounded bg-white hover:bg-orange-400/5 dark:bg-gray-700 dark:hover:bg-purple-400/5 border"
            @click="loadComposition(comp)"
          >
            <div class="flex gap-1 overflow-auto flex-1">
              <template v-for="tile in comp.champions">
                <img
                  :key="tile.main?.id"
                  v-if="tile.main"
                  :src="tile.main.src"
                  class="w-6 h-6 rounded"
                />
              </template>
            </div>
            <span class="ml-2 text-gray-700 dark:text-gray-200 font-medium">
              {{ comp.name }}
            </span>
          </div>
          
        </div>
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div
      v-if="showToast"
      class="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-1000"
    >
      {{ toastMessage }}
    </div>
  </transition>
  <transition name="fade">
    <div
      v-if="showSaveModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 m-2"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl w-96 max-h-[80vh] overflow-auto p-6 relative min-h-70 flex flex-col"
      >
        <button
          class="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          @click="showSaveModal = false"
        >
          ✕
        </button>
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Save Composition
        </h2>

        <form @submit.prevent="saveComposition" class="h-full flex flex-col flex-1 gap-4">
          <input
            v-model="compName"
            type="text"
            placeholder="Composition Name"
            :class="[
              'w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200',
            ]"
          />

          <div class="w-full h-full grid grid-cols-2 gap-2 max-h-70 overflow-scroll">
            <div v-for="(tile, index) in onBoardChampions" :key="index">
              <div v-if="tile.main" class="flex items-center gap-1">
                <img :src="tile.main.src" class="w-8 h-8 rounded" />
                <div class="flex gap-1" v-if="tile.subs">
                  <template v-for="sub in tile.subs">
                    <img v-if="sub" :key="sub.id" :src="sub.src" class="w-5 h-5 rounded" />
                  </template>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="!compName.trim()"
            class="w-full mt-auto bg-orange-500 dark:bg-purple-500 text-white font-semibold py-2 rounded"
            :class="
              !compName.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-orange-600 dark:hover:bg-purple-600'
            "
          >
            Save
          </button>
        </form>
      </div>
    </div>
  </transition>
  <!-- Top toggle button -->
  <div class="bg-gray-50 dark:bg-gray-900 min-h-screen pt-30 pb-20 px-5">
    <nav
      class="flex items-center justify-between px-5 py-4 absolute top-0 w-full max-w-[1800px] justify-self-center"
    >
      <img :src="isDark ? '/logo-dark.png' : '/logo-light.png'" width="100" />
      <button
        @click="toggleDarkMode"
        :class="[
          'flex items-center h-fit cursor-pointer gap-2 px-3 py-1 rounded-full transition',
          isDark
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ]"
      >
        <component :is="isDark ? Sun : Moon" class="w-5 h-5" />
        <span class="sr-only">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>
    </nav>
    <div class="max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6">
      <!-- Traits Panel -->
      <div
        class="xl:flex hidden h-fit max-h-[calc(100vh_-_200px)] w-56 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex-col gap-4 bg-white dark:bg-gray-800"
      >
        <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-gray-200">Traits</h2>
        <div v-if="activeTraits.length" class="flex flex-col gap-3 overflow-y-auto">
          <div v-for="trait in activeTraits" :key="trait.id" class="flex items-center gap-2">
            <img
              :src="`/img/tft-trait/${trait.url}`"
              class="w-6 h-6 rounded-full"
              :class="
                trait.currentThresholdIndex === -1
                  ? 'bg-gray-300 dark:bg-gray-600'
                  : 'bg-orange-400 dark:bg-purple-400'
              "
              alt=""
            />
            <div class="flex flex-col flex-1">
              <span class="font-medium text-sm text-gray-700 dark:text-gray-200">{{
                trait.name
              }}</span>
              <div class="text-xs flex gap-1 flex-wrap">
                <span
                  v-if="trait.currentThresholdIndex === -1"
                  class="text-gray-400 dark:text-gray-400"
                >
                  {{ trait.count }}/{{ trait.thresholds[0] }}
                </span>
                <template v-else>
                  <div v-for="(n, index) in trait.thresholds" :key="index">
                    <span
                      :class="
                        index === trait.currentThresholdIndex
                          ? 'font-extrabold text-green-600'
                          : 'text-gray-500 dark:text-gray-400'
                      "
                    >
                      {{ n }}
                    </span>
                    <span
                      class="text-gray-500 dark:text-gray-400"
                      v-if="index !== trait.thresholds.length - 1"
                    >
                      >
                    </span>
                  </div>
                </template>
              </div>
            </div>
            <span class="font-semibold text-gray-700 dark:text-gray-200">{{ trait.count }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">No active traits</p>
      </div>

      <!-- Board + Inventory -->
      <div class="flex-1 flex flex-col gap-6 h-full">
        <!-- Hex Board -->
        <div
          class="self-center flex flex-col gap-4 lg:gap-6 -translate-x-2 @media(min-width:500px)]:-translate-x-2.5 sm:!-translate-x-4 md:!-translate-x-5 lg:!-translate-x-6 xl:!-translate-x-6.5 2xl:!-translate-x-8"
        >
          <div class="flex ml-auto gap-4 text-gray-700 dark:text-gray-200">
            <button
              class="cursor-pointer hover:bg-orange-400/5 dark:hover:bg-purple-600/5 text-lg font-semibold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 rounded-lg border transition-all"
              @click="handleClickLoad"
            >
              Load
            </button>
            <button
              :disabled="onBoardChampions?.length === 0"
              class="text-lg font-semibold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4 rounded-lg border transition-all"
              :class="
                onBoardChampions?.length > 0
                  ? 'cursor-pointer hover:bg-orange-400/5 dark:hover:bg-purple-600/5'
                  : 'opacity-50'
              "
              @click="handleClickSave"
            >
              Save
            </button>
            <button
              class="text-lg font-semibold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer px-4 rounded-lg border hover:bg-orange-400/5 dark:hover:bg-purple-600/5 transition-all"
              @click="handleClickClear"
            >
              Clear
            </button>
          </div>
          <div>
            <div v-for="(row, r) in rows" :key="r" class="flex md:gap-2 justify-center">
              <HexTile
                v-for="(col, c) in cols"
                :key="`${r}-${c}`"
                :class="r % 2 === 0 ? '' : 'translate-x-1/2'"
                :current-inventory-drag="currentInventoryDrag"
                :main="board[r][c].main"
                :subs="board[r][c].subs"
                :star-level="board[r][c].starLevel"
                @drag-start="(item) => onTileDragStart(item, r, c)"
                @drop-main="(item) => handleMainDrop(r, c, item)"
                @drop-sub="(item) => handleSubDrop(r, c, item)"
                @remove-main="removeMain(r, c)"
                @remove-sub="(index) => (board[r][c].subs[index] = null)"
                @set-stars="(starLevel) => (board[r][c].starLevel = starLevel)"
              />
            </div>
          </div>
        </div>

        <!-- Inventory Panel > MD -->
        <div
          class="hidden md:flex flex-col md:flex-row gap-4"
          @dragover.prevent
          @drop.prevent="handleInventoryDrop"
        >
          <!-- Champions -->
          <div
            class="border h-82 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-3 flex-1 flex flex-col"
          >
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
              Champions
            </h3>

            <!-- 🔍 Search Bar -->
            <input
              v-model="champSearch"
              type="text"
              placeholder="Search by name or trait..."
              class="w-full mb-3 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />

            <transition-group
              name="inv"
              tag="div"
              class="flex flex-wrap gap-2 justify-center overflow-y-auto"
            >
              <InventoryItem
                class="w-10 h-10 hover:scale-110 transition-transform"
                v-for="champion in displayedChampions"
                :key="champion.name"
                type="champion"
                :id="champion.id"
                :src="champion.url"
                @drag-start="(el) => (currentInventoryDrag = el)"
                @click="handleClickChampItem(champion)"
              />
              <p
                v-if="!displayedChampions.length"
                class="text-xs absolute text-gray-400 dark:text-gray-400 text-center w-full py-6"
              >
                No champions found
              </p>
            </transition-group>
          </div>

          <!-- Items -->
          <div
            class="border h-82 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex-1 flex flex-col p-3"
          >
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
              Items
            </h3>

            <!-- 🔍 Search Bar -->
            <input
              v-model="itemSearch"
              type="text"
              placeholder="Search by name"
              class="w-full mb-3 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />

            <!-- Tabs -->
            <div class="flex border-b border-gray-300 dark:border-gray-700 overflow-y-auto">
              <button
                v-for="kind in itemKinds"
                :key="kind"
                @click="activeItemKind = kind"
                class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
                :class="[
                  activeItemKind === kind
                    ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                {{ kind }}
              </button>
            </div>

            <!-- Items Grid -->
            <transition-group
              name="inv"
              tag="div"
              class="flex flex-wrap gap-2 p-2 justify-center overflow-y-auto h-fit"
            >
              <InventoryItem
                v-for="item in displayedItems"
                :key="item.id"
                type="item"
                class="w-8 h-8 hover:scale-110 transition-transform search-appear"
                :id="item.id"
                :src="item.url"
                @drag-start="(el) => (currentInventoryDrag = el)"
              />
              <p
                v-if="!displayedItems.length"
                class="text-xs absolute text-gray-400 dark:text-gray-400 text-center w-full py-6"
              >
                No {{ activeItemKind }} items
              </p>
            </transition-group>
          </div>
        </div>

        <!-- Inventory Panel < MD -->
        <div class="flex flex-col md:hidden w-full">
          <!-- Tabs -->
          <div class="flex border-b border-gray-300 dark:border-gray-700 mb-2">
            <button
              @click="mobileInventoryTab = 'champions'"
              class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
              :class="
                mobileInventoryTab === 'champions'
                  ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              "
            >
              Champions
            </button>
            <button
              @click="mobileInventoryTab = 'items'"
              class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
              :class="
                mobileInventoryTab === 'items'
                  ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              "
            >
              Items
            </button>
          </div>

          <!-- Champions panel -->
          <div
            v-if="mobileInventoryTab === 'champions'"
            class="flex h-fit min-h-82 flex-col border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-3 mb-4"
          >
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
              Champions
            </h3>
            <input
              v-model="champSearch"
              type="text"
              placeholder="Search by name or trait..."
              class="w-full mb-3 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <transition-group
              name="inv"
              tag="div"
              class="flex flex-wrap gap-2 justify-center overflow-y-auto"
            >
              <InventoryItem
                class="w-10 h-10 hover:scale-110 transition-transform"
                v-for="champion in displayedChampions"
                :key="champion.name"
                type="champion"
                :id="champion.id"
                :src="champion.url"
                @drag-start="(el) => (currentInventoryDrag = el)"
              />
              <p
                v-if="!displayedChampions.length"
                class="text-xs absolute text-gray-400 dark:text-gray-400 text-center w-full py-6"
              >
                No champions found
              </p>
            </transition-group>
          </div>

          <!-- Items panel -->
          <div
            v-if="mobileInventoryTab === 'items'"
            class="flex h-fit min-h-82 flex-col border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-3"
          >
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
              Items
            </h3>
            <input
              v-model="itemSearch"
              type="text"
              placeholder="Search by name"
              class="w-full mb-3 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />

            <!-- Item kind tabs -->
            <div class="flex border-b border-gray-300 dark:border-gray-700 overflow-x-auto mb-2">
              <button
                v-for="kind in itemKinds"
                :key="kind"
                @click="activeItemKind = kind"
                class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer min-w-[80px]"
                :class="[
                  activeItemKind === kind
                    ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                {{ kind }}
              </button>
            </div>

            <!-- Items grid -->
            <transition-group
              name="inv"
              tag="div"
              class="flex flex-wrap gap-2 p-2 justify-center overflow-y-auto"
            >
              <InventoryItem
                v-for="item in displayedItems"
                :key="item.id"
                type="item"
                class="w-8 h-8 hover:scale-110 transition-transform search-appear"
                :id="item.id"
                :src="item.url"
                @drag-start="(el) => (currentInventoryDrag = el)"
              />
              <p
                v-if="!displayedItems.length"
                class="text-xs absolute text-gray-400 dark:text-gray-400 text-center w-full py-6"
              >
                No {{ activeItemKind }} items
              </p>
            </transition-group>
          </div>
        </div>
      </div>

      <!-- Bottom Panels (Mobile Traits + Equipped Items) > md-->
      <div class="hidden md:flex flex-col md:flex-row gap-4">
        <!-- Traits Panel Mobile -->
        <div
          class="flex xl:hidden h-82 w-full border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex-col gap-4 bg-white dark:bg-gray-800"
        >
          <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-gray-200">Traits</h2>
          <div v-if="activeTraits.length" class="flex flex-col gap-3 overflow-y-auto">
            <div v-for="trait in activeTraits" :key="trait.id" class="flex items-center gap-2">
              <img
                :src="`/img/tft-trait/${trait.url}`"
                class="w-6 h-6 rounded-full"
                :class="
                  trait.currentThresholdIndex === -1
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-orange-400 dark:bg-purple-400'
                "
                alt=""
              />
              <div class="flex flex-col flex-1">
                <span class="font-medium text-sm text-gray-700 dark:text-gray-200">{{
                  trait.name
                }}</span>
                <div class="text-xs flex gap-1 flex-wrap">
                  <span
                    v-if="trait.currentThresholdIndex === -1"
                    class="text-gray-400 dark:text-gray-400"
                  >
                    {{ trait.count }}/{{ trait.thresholds[0] }}
                  </span>
                  <template v-else>
                    <div v-for="(n, index) in trait.thresholds" :key="index">
                      <span
                        :class="
                          index === trait.currentThresholdIndex
                            ? 'font-bold text-green-600'
                            : 'text-gray-500 dark:text-gray-400'
                        "
                      >
                        {{ n }}
                      </span>
                      <span v-if="index !== trait.thresholds.length - 1"> > </span>
                    </div>
                  </template>
                </div>
              </div>
              <span class="font-semibold text-gray-700 dark:text-gray-200">{{ trait.count }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
            No active traits
          </p>
        </div>

        <!-- Equipped Items Panel -->
        <div
          class="w-full h-82 xl:h-fit xl:max-h-[calc(100vh_-_200px)] 2xl:w-56 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex flex-col gap-4 bg-white dark:bg-gray-800 overflow-y-auto"
        >
          <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-gray-200">
            Equipped Items
          </h2>

          <div v-if="equippedItemsList.length" class="flex flex-col gap-2">
            <div
              v-for="item in equippedItemsList"
              :key="item.id"
              class="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div class="flex items-center gap-2">
                <img :src="`/img/tft-item/${item.id}.png`" class="w-6 h-6 rounded" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{
                    item.name
                  }}</span>
                  <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>×{{ item.count }}</span>
                    <span v-if="item.unique" class="text-red-500 font-semibold">Unique</span>
                  </div>
                </div>
              </div>
              <div v-if="item.build?.length" class="flex items-center gap-1 mt-1 ml-8">
                <template v-for="(comp, index) in item.build" :key="comp.id">
                  <img :src="`/img/tft-item/${comp.id}.png`" class="w-5 h-5 rounded" />
                  <span
                    v-if="index < item.build.length - 1"
                    class="text-gray-400 dark:text-gray-500 text-xs"
                    >×</span
                  >
                </template>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
            No items equipped
          </p>

          <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          <!-- Total Basic Items -->
          <div>
            <h3 class="text-base font-semibold text-center mb-2 text-gray-700 dark:text-gray-200">
              Basic Items Needed
            </h3>
            <div v-if="totalBasicItems.length" class="flex flex-col gap-2">
              <div
                v-for="item in totalBasicItems"
                :key="item.id"
                class="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <img :src="`/img/tft-item/${item.id}.png`" class="w-5 h-5 rounded" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{
                    item.name
                  }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">×{{ item.count }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
              No basic items required
            </p>
          </div>
        </div>
      </div>

      <!-- Mobile Traits + Equipped Items (smaller than md) -->
      <div class="flex flex-col md:hidden w-full">
        <!-- Tabs -->
        <div class="flex border-b border-gray-300 dark:border-gray-700 mb-2">
          <button
            @click="mobileBottomTab = 'traits'"
            class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="
              mobileBottomTab === 'traits'
                ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            "
          >
            Traits
          </button>
          <button
            @click="mobileBottomTab = 'equipped'"
            class="flex-1 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="
              mobileBottomTab === 'equipped'
                ? 'text-orange-600 dark:text-purple-400 border-b-2 border-orange-500 dark:border-purple-500 bg-orange-50 dark:bg-purple-950'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            "
          >
            Equipped Items
          </button>
        </div>

        <!-- Traits Panel -->
        <div
          v-if="mobileBottomTab === 'traits'"
          class="flex overflow-auto flex-col border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 h-82 gap-4 bg-white dark:bg-gray-800 mb-4"
        >
          <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-gray-200">Traits</h2>
          <div v-if="activeTraits.length" class="flex flex-col gap-3 overflow-y-auto">
            <div v-for="trait in activeTraits" :key="trait.id" class="flex items-center gap-2">
              <img
                :src="`/img/tft-trait/${trait.url}`"
                class="w-6 h-6 rounded-full"
                :class="
                  trait.currentThresholdIndex === -1
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-orange-400 dark:bg-purple-400'
                "
                alt=""
              />
              <div class="flex flex-col flex-1">
                <span class="font-medium text-sm text-gray-700 dark:text-gray-200">{{
                  trait.name
                }}</span>
                <div class="text-xs flex gap-1 flex-wrap">
                  <span
                    v-if="trait.currentThresholdIndex === -1"
                    class="text-gray-400 dark:text-gray-400"
                  >
                    {{ trait.count }}/{{ trait.thresholds[0] }}
                  </span>
                  <template v-else>
                    <div v-for="(n, index) in trait.thresholds" :key="index">
                      <span
                        :class="
                          index === trait.currentThresholdIndex
                            ? 'font-bold text-green-600'
                            : 'text-gray-500 dark:text-gray-400'
                        "
                        >{{ n }}</span
                      >
                      <span v-if="index !== trait.thresholds.length - 1"> > </span>
                    </div>
                  </template>
                </div>
              </div>
              <span class="font-semibold text-gray-700 dark:text-gray-200">{{ trait.count }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
            No active traits
          </p>
        </div>

        <!-- Equipped Items Panel -->
        <div
          v-if="mobileBottomTab === 'equipped'"
          class="flex h-82 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex-col gap-4 bg-white dark:bg-gray-800"
        >
          <h2 class="text-lg font-semibold text-center text-gray-700 dark:text-gray-200">
            Equipped Items
          </h2>

          <div v-if="equippedItemsList.length" class="flex flex-col gap-2">
            <div
              v-for="item in equippedItemsList"
              :key="item.id"
              class="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div class="flex items-center gap-2">
                <img :src="`/img/tft-item/${item.id}.png`" class="w-6 h-6 rounded" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{
                    item.name
                  }}</span>
                  <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>×{{ item.count }}</span>
                    <span v-if="item.unique" class="text-red-500 font-semibold">Unique</span>
                  </div>
                </div>
              </div>
              <div v-if="item.build?.length" class="flex items-center gap-1 mt-1 ml-8">
                <template v-for="(comp, index) in item.build" :key="comp.id">
                  <img :src="`/img/tft-item/${comp.id}.png`" class="w-5 h-5 rounded" />
                  <span
                    v-if="index < item.build.length - 1"
                    class="text-gray-400 dark:text-gray-500 text-xs"
                    >×</span
                  >
                </template>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
            No items equipped
          </p>

          <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          <!-- Total Basic Items -->
          <div>
            <h3 class="text-base font-semibold text-center mb-2 text-gray-700 dark:text-gray-200">
              Basic Items Needed
            </h3>
            <div v-if="totalBasicItems.length" class="flex flex-col gap-2">
              <div
                v-for="item in totalBasicItems"
                :key="item.id"
                class="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <img :src="`/img/tft-item/${item.id}.png`" class="w-5 h-5 rounded" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{
                    item.name
                  }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">×{{ item.count }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 text-center dark:text-gray-400">
              No basic items required
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

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
  starLevel: number | null
}

// 2D board state (rows × cols)
const board = ref<BoardTile[][]>(
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      main: null,
      subs: [null, null, null],
      starLevel: null,
    })),
  ),
)

const currentInventoryDrag = ref<DragItem | null>(null)
const activeItemKind = ref(itemKinds[0])
const champSearch = ref<string>('')
const itemSearch = ref<string>('')
const dragSource = ref<{ r: number; c: number } | null>(null) // source tile if drag from a HexTile
const isDark = ref(false)
const mobileInventoryTab = ref<'champions' | 'items'>('champions')
const mobileBottomTab = ref<'traits' | 'equipped'>('traits')
const showSaveModal = ref(false)
const compName = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const showLoadModal = ref(false)
const savedCompositions = ref<any[]>([])

//LIFECYCLE
onMounted(() => {
  const stored = localStorage.getItem('darkMode')
  if (stored === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
//COMPUTED
const displayedChampions = computed<Inventory[]>(() => {
  const search = champSearch.value.trim().toLowerCase()

  return champions
    .filter((c) => {
      if (!search) return true

      // match by name
      const nameMatch = c.name.toLowerCase().includes(search)

      // match by trait
      const traitIds = mappingChampionsTraits[c.id as keyof typeof mappingChampionsTraits] || []
      const traitNames = traitIds
        .map((tid) => championTraits.find((t) => t.id === tid)?.name?.toLowerCase())
        .filter(Boolean)

      const traitMatch = traitNames.some((tName) => tName!.includes(search))

      return nameMatch || traitMatch
    })
    .map((c) => ({
      id: c.id,
      name: c.name,
      url: c.url,
    }))
})

const onBoardChampions = computed(() => {
  const res = []
  for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
         if (!board.value[r][c].main) continue
          res.push({...board.value[r][c], r, c })
      }
  }
  return res
})

const displayedItems = computed(() => {
  const currentKind = activeItemKind.value
  return items
    .filter((item) => {
      const kindMatch = item.kind === currentKind
      // match by name
      const search = itemSearch.value.trim().toLowerCase()

      const nameMatch = item.name.toLowerCase().includes(search)
      return kindMatch && nameMatch
    })
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
      const fullItem = items.find((i) => i.id === id)
      const build = (fullItem?.build || [])
        .map((bid) => items.find((i) => i.id === bid))
        .filter((i) => !!i)

      return {
        id,
        name: fullItem?.name || id,
        count,
        unique: fullItem?.unique || false,
        build, // 🧩 list of basic items
        kind: fullItem?.kind,
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
    const t = championTraits.find((ct) => ct.id.toLowerCase() === trait.toLowerCase())
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
    if (item.kind === 'basic') {
      basicCountMap[item.id] = (basicCountMap[item.id] || 0) + item.count
    } else {
      for (const comp of item.build) {
        basicCountMap[comp.id] = (basicCountMap[comp.id] || 0) + item.count
      }
    }
  }

  // Map to full item objects for display
  return Object.entries(basicCountMap)
    .map(([id, count]) => {
      const fullItem = items.find((i) => i.id === id)
      return {
        id,
        name: fullItem?.name || id,
        count,
      }
    })
    .sort((a, b) => b.count - a.count)
})

//METHODS
function handleClickClear() {
  board.value = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      main: null,
      subs: [null, null, null],
      starLevel: null,
    })),
  )
}

function handleClickSave() {
  if (onBoardChampions.value?.length > 0) showSaveModal.value = true
}

function handleClickLoad() {
  const stored = localStorage.getItem('savedCompositions')
  savedCompositions.value = stored ? JSON.parse(stored) : []
  if (!savedCompositions.value.length) {
    toastMessage.value = 'No compositions saved'
    showToast.value = true
    setTimeout(() => (showToast.value = false), 3000)
    return
  }
  showLoadModal.value = true
}

function loadComposition(comp: any) {
  // Reset board first
  board.value = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      main: null,
      subs: [null, null, null],
      starLevel: null,
    })),
  )

  // Populate board from saved comp
  comp.champions.forEach((tile: any) => {
    console.log(board.value[tile.r][tile.c])
    board.value[tile.r][tile.c] = {
      main: tile.main,
      subs: tile.subs,
      starLevel: tile.starLevel,
    }
  })


  showLoadModal.value = false
  toastMessage.value = `Composition "${comp.name}" loaded!`
  showToast.value = true
  setTimeout(() => (showToast.value = false), 3000)
}

function saveComposition() {
  if (!compName.value.trim()) {
    return
  }

  const compositions = JSON.parse(localStorage.getItem('savedCompositions') || '[]')

  const newComp = {
    name: compName.value.trim(),
    date: new Date().toISOString(),
    champions: onBoardChampions.value,
  }

  compositions.push(newComp)
  localStorage.setItem('savedCompositions', JSON.stringify(compositions))

  // Show toast
  toastMessage.value = `Composition "${compName.value}" saved!`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)

  showSaveModal.value = false
  compName.value = ''
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
}

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
    board.value[r][c].starLevel = 1
  } else {
    const { r: sr, c: sc } = dragSource.value

    const sourceTile = board.value[sr][sc]
    const targetTile = board.value[r][c]

    if (targetTile.main) {
      // ✅ Swap champions & subs
      const tempMain = targetTile.main
      const tempSubs = [...targetTile.subs]
      const tempStarLevel = targetTile.starLevel

      targetTile.main = sourceTile.main
      targetTile.subs = [...sourceTile.subs]
      targetTile.starLevel = sourceTile.starLevel

      sourceTile.main = tempMain
      sourceTile.subs = [...tempSubs]
      sourceTile.starLevel = tempStarLevel
    } else {
      // ✅ Just move champ + subs to empty spot
      targetTile.main = sourceTile.main
      targetTile.subs = [...sourceTile.subs]
      targetTile.starLevel = sourceTile.starLevel

      sourceTile.main = null
      sourceTile.subs = [null, null, null]
      sourceTile.starLevel = null
    }
  }

  resetDrag()
}

function handleSubDrop(r: number, c: number, item: DragItem) {
  const targetTile = board.value[r][c]

  if (!targetTile.main) {
    // No champion → cannot place sub
    return
  }

  // Get full item data
  const fullItem = items.find((i) => i.id === item.id)
  if (!fullItem) return

  const championId = targetTile.main.id

  // --- Check uniqueness ---
  if (fullItem.unique) {
    const alreadyEquipped = board.value.some((row) =>
      row.some((tile) => tile.main?.id === championId && tile.subs.some((s) => s?.id === item.id)),
    )
    if (alreadyEquipped) {
      return // Cannot equip this unique item again on the same champion
    }
  }

  // --- Check incompatible traits ---
  if (fullItem.incompatibleTraits && fullItem.incompatibleTraits.length) {
    const championTraitsIds: string[] =
      mappingChampionsTraits[championId as keyof typeof mappingChampionsTraits] || []

    const hasIncompatible = fullItem.incompatibleTraits.some((traitId: string) =>
      championTraitsIds.includes(traitId),
    )
    if (hasIncompatible) return
  }

  // --- Check for basic items limit ---
  if (fullItem.kind === 'basic') {
    const alreadyBasicEquipped = targetTile.subs.some(
      (s) => s && items.find((i) => i.id === s.id)?.kind === 'basic',
    )
    if (alreadyBasicEquipped) {
      return // Cannot equip more than one basic item
    }
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

function handleClickChampItem(champion: Inventory) {
  for (let r = 0; r < board.value.length; r++) {
    for (let c = 0; c < board.value[r].length; c++) {
      const tile = board.value[r][c]
      if (!tile.main) {
        tile.main = {
          id: champion.id,
          type: 'champion',
          src: champion.url,
        }
        tile.subs = [null, null, null] // reset subs
        tile.starLevel = 1 // optional: set default star level
        return // exit immediately after placing
      }
    }
  }
}
</script>
<style lang="css" scoped>
/* When elements are removed */
.inv-leave-active {
  transition: none !important;
}

.inv-leave-to {
  opacity: 0;
  transform: scale(0.6) rotate(-6deg);
}

.inv-enter-to {
  opacity: 1;
  transform: scale(0.6) rotate(-6deg);
}

/* OPTIONAL: No appear animation */
.inv-enter-active {
  transition: none !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
