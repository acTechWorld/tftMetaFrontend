<template>
  <div class="flex flex-col items-center gap-1">
    <!-- Main hexagon -->
    <div
      class="w-36 sm:w-40 aspect-square cursor-pointer group relative"
      :class="isHovering ? 'bg-orange-400/60 shadow-[0_0_25px_rgba(249,115,22,0.9)]' : 'bg-orange-400'"
      style="clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onMainDrop"
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
    <div class="flex gap-1 transition-opacity duration-200">
      <template v-for="(sub, i) in subs" :key="i">
        <div
          v-show="(isHovering && currentInventoryDrag?.type === 'item') || sub"
          class="w-6 h-6 border-2 border-gray-400 rounded relative -mt-15"
          :class="subHovering[i] ? 'bg-gray-200/50' : ''"
          @dragover="(e) => onSubDragOver(e, i)"
          @dragleave="() => onSubDragLeave(i)"
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
import { ref } from 'vue';

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
  (e: 'drop-sub', item: DragItem ): void
}>();

const isHovering = ref(false);
const subHovering = ref([false, false, false]);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isHovering.value = true;

  if (props.currentInventoryDrag && props.currentInventoryDrag.type !== 'champion') {
  }
}

function onDragLeave() {
  isHovering.value = false;
}

function onSubDragOver(e: DragEvent, i: number) {
  e.preventDefault();
  subHovering.value[i] = true;
}
function onSubDragLeave(i: number) {
  subHovering.value[i] = false;
}

function onMainDrop(e: DragEvent) {

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
