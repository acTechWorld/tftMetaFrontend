<template>
  <div class="flex flex-col items-center gap-1"       
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop">
    <!-- Main hexagon -->
    <div
      class="w-30 xl:w-36 2xl:w-40 aspect-square cursor-pointer group relative"
      :class="isHovering && (currentInventoryDrag?.type === 'champion' || isHoveringItemValid) ? 'bg-orange-400/60 shadow-[0_0_25px_rgba(249,115,22,0.9)]' : 'bg-orange-400'"
      style="clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);"
      @click="onClick"
    >
      <img
        v-if="main"
        :src="main.src"
        class="absolute inset-0 w-full h-full object-cover"
        draggable="true"
        @dragstart="e => onDragStart(e, main)"
      />
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
import { computed, ref } from 'vue';

export interface DragItem {
  type: string;
  src: string;
}

const props = defineProps<{
  currentInventoryDrag: DragItem | null
  main: DragItem | null
  subs: (DragItem | null)[]
}>();

const emits = defineEmits<{
  (e: 'drag-start', item: DragItem): void
  (e: 'drop-main', item: DragItem): void
  (e: 'drop-sub', item: DragItem): void
  (e: 'remove-main'): void
  (e: 'remove-sub', index: number): void
}>();

const isHovering = ref(false);

//COMPUTED
const isHoveringItemValid = computed(() => isHovering.value && props.currentInventoryDrag?.type === 'item' && props.main)

//METHODS
function onClick(e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) {
    emits('remove-main');
  }
}

function onSubClick(index: number, e: MouseEvent) {
  // Ctrl (Win/Linux) or Command (Mac)
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
