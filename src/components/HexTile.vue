<template>
  <div class="flex flex-col items-center gap-1">
    <div
      class="w-36 sm:w-40 aspect-square cursor-pointer group relative"
      :class="isHovering ? 'bg-orange-400/60 shadow-[0_0_25px_rgba(249,115,22,0.9)]' : 'bg-orange-400'"
      style="clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onMainDrop"
    >
      <img v-if="image" :src="image" class="absolute inset-0 w-full h-full object-cover" />
    </div>

    <div class="flex gap-1">
      <div
        v-for="(sub, i) in subItems"
        :key="i"
        class="w-10 h-10 border-2 border-gray-400 rounded relative"
        :class="subHovering[i] ? 'bg-gray-200/50' : ''"
        @dragover="(e) => onSubDragOver(e, i)"
        @dragleave="() => onSubDragLeave(i)"
        @drop="(e) => onSubDrop(e, i)"
      >
        <img v-if="sub" :src="sub" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const image = ref<string | null>(null);
const subItems = ref<(string | null)[]>([null, null, null]);

const isHovering = ref(false);
const subHovering = ref([false, false, false]);

function onDragOver(e: DragEvent) { e.preventDefault(); isHovering.value = true; }
function onDragLeave() { isHovering.value = false; }

function onSubDragOver(e: DragEvent, i: number) { e.preventDefault(); subHovering.value[i] = true; }
function onSubDragLeave(i: number) { subHovering.value[i] = false; }

function onMainDrop(e: DragEvent) {
  e.preventDefault();
  isHovering.value = false;

  const data = e.dataTransfer?.getData("application/json");
  if (!data) return;
  const { src, type } = JSON.parse(data);

  if (type === 'champion') {
    image.value = src;
  } else {
    const emptyIndex = subItems.value.findIndex(s => !s);
    if (emptyIndex !== -1) subItems.value[emptyIndex] = src;
  }
}

function onSubDrop(e: DragEvent, i: number) {
  e.preventDefault();
  subHovering.value[i] = false;

  const data = e.dataTransfer?.getData("application/json");
  if (!data) return;
  const { src } = JSON.parse(data);

  subItems.value[i] = src;
}
</script>
