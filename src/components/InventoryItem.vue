<template>
  <img
    :src="src"
    draggable="true"
    @dragstart="onDragStart"
    class="object-cover border-2 border-gray-500 rounded-md cursor-grab"
  />
</template>

<script setup lang="ts">
import { defineProps } from "vue";
const emits = defineEmits(['drag-start'])
const props = defineProps<{ src: string, type: 'champion' | 'item', id: string }>();

function onDragStart(e: DragEvent) {
  if (!e.dataTransfer) return;
  emits('drag-start', { src: props.src, type: props.type, id: props.id  })
  const payload = JSON.stringify({ src: props.src, type: props.type });
  e.dataTransfer.setData("application/json", payload);
  e.dataTransfer.effectAllowed = "move";
}
</script>
