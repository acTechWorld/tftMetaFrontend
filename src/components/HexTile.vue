<template>
  <div
    class="flex flex-col items-center gap-1"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Main hexagon -->
    <div
      class="w-24 xl:w-26 2xl:w-32 aspect-square group relative"
      :class="[isHovering && (currentInventoryDrag?.type === 'champion' || isHoveringItemValid)
        ? 'bg-orange-400/60 dark:bg-purple-400/60 shadow-[0_0_25px_rgba(249,115,22,0.9)]'
        : 'bg-orange-400 dark:bg-purple-400', ctrlPressed && main ? 'cursor-not-allowed': 'cursor-pointer']"
      style="clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);"
      @click="onClick"
    >
      <!-- Champion sprite -->
      <img
        v-if="main"
        :src="main.src"
        class="absolute inset-0 w-full h-full object-cover"
        :draggable="!ctrlPressed"
        @dragstart="e => onDragStart(e, main)"
      />

      <!-- Star overlay (hover) -->
      <div
        v-if="main && starLevel"
        class="absolute top-4 left-1 right-1 flex justify-center gap-1 duration-200 z-10"
      >
        <button
          v-for="n in 3"
          :key="n"
          @click.stop="setStars(n)"
          :class="starLevel >= n ? 'block' : 'hidden group-hover:block'"
          class="cursor-pointer w-4 h-4 md:w-5 md:h-5 text-yellow-400 hover:scale-125 transition-transform"
        >
          <svg
            v-if="starLevel >= n"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.443a1 1 0 00-.364 1.118l1.286 3.946c.3.921-.755 1.688-1.54 1.118l-3.36-2.443a1 1 0 00-1.176 0l-3.36 2.443c-.784.57-1.838-.197-1.539-1.118l1.285-3.946a1 1 0 00-.364-1.118L2.075 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.443a1 1 0 00-.364 1.118l1.286 3.946c.3.921-.755 1.688-1.54 1.118l-3.36-2.443a1 1 0 00-1.176 0l-3.36 2.443c-.784.57-1.838-.197-1.539-1.118l1.285-3.946a1 1 0 00-.364-1.118L2.075 9.373c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.946z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Sub slots -->
    <div class="flex gap-1 transition-opacity duration-200" :class="{'pointer-events-none': isHovering}">
      <template v-for="(sub, i) in subs" :key="i" >
        <div
          v-show="isHoveringItemValid || sub"
          class="w-6 h-6 border-2 border-gray-400 rounded relative -mt-15"
          @click="onSubClick(i, $event)"
        >
          <img
            v-if="sub"
            :src="sub.src"
            class="w-full h-full object-cover"
            draggable="true"
            @dragstart="e => onDragStart(e, sub)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { DragItem } from './BoardComponent.vue';

const props = withDefaults(defineProps<{
  currentInventoryDrag: DragItem | null
  main: DragItem | null
  subs: (DragItem | null)[]
  starLevel: number | null
}>(), {starLevel: 1});

const emits = defineEmits<{
  (e: 'drag-start', item: DragItem): void
  (e: 'drop-main', item: DragItem): void
  (e: 'drop-sub', item: DragItem): void
  (e: 'remove-main'): void
  (e: 'remove-sub', index: number): void
  (e: 'set-stars', level: number): void
}>();

const isHovering = ref(false);
const ctrlPressed = ref(false);

//LIFECYCLE
// Detect ctrl/command key globally
const onKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) ctrlPressed.value = true;
};
const onKeyUp = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.metaKey) ctrlPressed.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});

// COMPUTED
const isHoveringItemValid = computed(() => isHovering.value && props.currentInventoryDrag?.type === 'item' && props.main)

// METHODS
function onClick(e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) {
    emits('remove-main');
  }
}

function setStars(level: number) {
  emits('set-stars', level);
}

function onSubClick(index: number, e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) {
    emits('remove-sub', index);
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isHovering.value = true;
}

function onDragLeave() {
  isHovering.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault(); 
  isHovering.value = false; 
  if (!props.currentInventoryDrag) return; 
  const { type } = props.currentInventoryDrag; 
  if(type === 'champion') {
    emits('drop-main', props.currentInventoryDrag);
  } else {
    emits('drop-sub', props.currentInventoryDrag);
  }
}

function onDragStart(e: DragEvent, el: DragItem | null) {
  if (!el || !e.dataTransfer) return;
  emits('drag-start', el);
  e.dataTransfer.setData("application/json", JSON.stringify(el));
  e.dataTransfer.effectAllowed = "move";
}
</script>
