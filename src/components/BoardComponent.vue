<template>
  <div class="flex p-6 gap-6 flex-col" @dragend="currentInventoryDrag = null">
    <!-- Hex Board -->
    <div>
      <div v-for="(row, r) in rows" :key="r" class="flex gap-2">
        <HexTile
          v-for="(col, c) in cols"
          :key="`${r}-${c}`"
          :class="r % 2 === 0 ? '' : 'translate-x-1/2'"
          :current-inventory-drag="currentInventoryDrag"
          :main="board[r][c].main"
          :subs="board[r][c].subs"
          @drag-start="item => onTileDragStart(item, r, c)"
          @drop-main="item => handleMainDrop(r, c, item)"
          @drop-sub="item => handleSubDrop(r, c, item)"
        />
      </div>
    </div>

    <!-- Inventory Panel -->
    <div class="flex gap-2">
      <!-- Champions -->
      <div class="border-2 border-gray-300 rounded-xl">
        <div class="flex flex-wrap p-2 gap-1">
          <InventoryItem
            class="w-10 h-10"
            v-for="champion in champions"
            :key="champion.name"
            type="champion"
            :src="champion.url"
            @drag-start="el => currentInventoryDrag = el"
          />
        </div>
      </div>

      <!-- Items -->
      <div class="border-2 border-gray-300 rounded-xl">
        <div class="flex flex-wrap p-2 gap-1">
          <InventoryItem
            class="w-8 h-8"
            v-for="item in itemsNormal"
            :key="item.name"
            type="item"
            :src="item.url"
            @drag-start="el => currentInventoryDrag = el"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HexTile from "./HexTile.vue";
import InventoryItem from "./InventoryItem.vue";

export interface DragItem {
  type: string;
  src: string;
}
type Inventory = { name: string; url: string };


const rows = 4;
const cols = 7;

type BoardTile = {
  main: DragItem | null;
  subs: (DragItem | null)[];
};

// 2D board state (rows × cols)
const board = ref<BoardTile[][]>(
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      main: null,
      subs: [null, null, null]
    }))
  )
);

const currentInventoryDrag = ref<DragItem | null>(null);

const dragSource = ref<{ r: number; c: number } | null>(null); // source tile if drag from a HexTile

function onTileDragStart(item: DragItem, r?: number, c?: number) {
  currentInventoryDrag.value = item;
  if (r !== undefined && c !== undefined) {
    dragSource.value = { r, c };
  } else {
    dragSource.value = null; // drag from inventory
  }
}

function handleMainDrop(r: number, c: number, item: DragItem) {
  // Remove from source if moving between tiles
  if (dragSource.value) {
    const { r: sr, c: sc } = dragSource.value;
    board.value[sr][sc].main = null;
  }

  board.value[r][c].main = item;
  resetDrag();
}

function handleSubDrop(r: number, c: number, item: DragItem) {
  // Remove from source if moving between tiles
  if (dragSource.value) {
    const { r: sr, c: sc } = dragSource.value;
    board.value[sr][sc].subs = board.value[sr][sc].subs.map(s => (s === item ? null : s));
  }

  const subs = board.value[r][c].subs;
  const emptyIndex = subs.findIndex(s => !s);
  if (emptyIndex !== -1) subs[emptyIndex] = item;

  resetDrag();
}

function resetDrag() {
  currentInventoryDrag.value = null;
  dragSource.value = null;
}

// Inventory images (replace these with your game item paths)
const champions = ref<Inventory[]>([
  { "name": "Aatrox", "url": "https://sunderarmor.com/characters/Skin/15/Aatrox.png" },
  { "name": "Ahri", "url": "https://sunderarmor.com/characters/Skin/15/Ahri.png" },
  { "name": "Akali", "url": "https://sunderarmor.com/characters/Skin/15/Akali.png" },
  { "name": "Ashe", "url": "https://sunderarmor.com/characters/Skin/15/Ashe.png" },
  { "name": "Braum", "url": "https://sunderarmor.com/characters/Skin/15/Braum.png" },
  { "name": "Caitlyn", "url": "https://sunderarmor.com/characters/Skin/15/Caitlyn.png" },
  { "name": "Darius", "url": "https://sunderarmor.com/characters/Skin/15/Darius.png" },
  { "name": "Dr Mundo", "url": "https://sunderarmor.com/characters/Skin/15/DrMundo.png" },
  { "name": "Ezreal", "url": "https://sunderarmor.com/characters/Skin/15/Ezreal.png" },
  { "name": "Gangplank", "url": "https://sunderarmor.com/characters/Skin/15/Gangplank.png" },
  { "name": "Garen", "url": "https://sunderarmor.com/characters/Skin/15/Garen.png" },
  { "name": "Gnar", "url": "https://sunderarmor.com/characters/Skin/15/Gnar.png" },
  { "name": "Gwen", "url": "https://sunderarmor.com/characters/Skin/15/Gwen.png" },
  { "name": "Janna", "url": "https://sunderarmor.com/characters/Skin/15/Janna.png" },
  { "name": "Jarvan IV", "url": "https://sunderarmor.com/characters/Skin/15/JarvanIV.png" },
  { "name": "Jayce", "url": "https://sunderarmor.com/characters/Skin/15/Jayce.png" },
  { "name": "Jhin", "url": "https://sunderarmor.com/characters/Skin/15/Jhin.png" },
  { "name": "Jinx", "url": "https://sunderarmor.com/characters/Skin/15/Jinx.png" },
  { "name": "KSante", "url": "https://sunderarmor.com/characters/Skin/15/KSante.png" },
  { "name": "Kaisa", "url": "https://sunderarmor.com/characters/Skin/15/Kaisa.png" },
  { "name": "Kalista", "url": "https://sunderarmor.com/characters/Skin/15/Kalista.png" },
  { "name": "Karma", "url": "https://sunderarmor.com/characters/Skin/15/Karma.png" },
  { "name": "Katarina", "url": "https://sunderarmor.com/characters/Skin/15/Katarina.png" },
  { "name": "Kayle", "url": "https://sunderarmor.com/characters/Skin/15/Kayle.png" },
  { "name": "Kennen", "url": "https://sunderarmor.com/characters/Skin/15/Kennen.png" },
  { "name": "Kobuko", "url": "https://sunderarmor.com/characters/Skin/15/Kobuko.png" },
  { "name": "Kogmaw", "url": "https://sunderarmor.com/characters/Skin/15/Kogmaw.png" },
  { "name": "Lee Sin", "url": "https://sunderarmor.com/characters/Skin/15/LeeSin.png" },
  { "name": "Leona", "url": "https://sunderarmor.com/characters/Skin/15/Leona.png" },
  { "name": "Lucian", "url": "https://sunderarmor.com/characters/Skin/15/Lucian.png" },
  { "name": "Lulu", "url": "https://sunderarmor.com/characters/Skin/15/Lulu.png" },
  { "name": "Lux", "url": "https://sunderarmor.com/characters/Skin/15/Lux.png" },
  { "name": "Malphite", "url": "https://sunderarmor.com/characters/Skin/15/Malphite.png" },
  { "name": "Malzahar", "url": "https://sunderarmor.com/characters/Skin/15/Malzahar.png" },
  { "name": "Naafiri", "url": "https://sunderarmor.com/characters/Skin/15/Naafiri.png" },
  { "name": "Neeko", "url": "https://sunderarmor.com/characters/Skin/15/Neeko.png" },
  { "name": "Poppy", "url": "https://sunderarmor.com/characters/Skin/15/Poppy.png" },
  { "name": "Rakan", "url": "https://sunderarmor.com/characters/Skin/15/Rakan.png" },
  { "name": "Rammus", "url": "https://sunderarmor.com/characters/Skin/15/Rammus.png" },
  { "name": "Rell", "url": "https://sunderarmor.com/characters/Skin/15/Rell.png" },
  { "name": "Ryze", "url": "https://sunderarmor.com/characters/Skin/15/Ryze.png" },
  { "name": "Samira", "url": "https://sunderarmor.com/characters/Skin/15/Samira.png" },
  { "name": "Senna", "url": "https://sunderarmor.com/characters/Skin/15/Senna.png" },
  { "name": "Seraphine", "url": "https://sunderarmor.com/characters/Skin/15/Seraphine.png" },
  { "name": "Sett", "url": "https://sunderarmor.com/characters/Skin/15/Sett.png" },
  { "name": "Shen", "url": "https://sunderarmor.com/characters/Skin/15/Shen.png" },
  { "name": "Sivir", "url": "https://sunderarmor.com/characters/Skin/15/Sivir.png" },
  { "name": "Smolder", "url": "https://sunderarmor.com/characters/Skin/15/Smolder.png" },
  { "name": "Swain", "url": "https://sunderarmor.com/characters/Skin/15/Swain.png" },
  { "name": "Syndra", "url": "https://sunderarmor.com/characters/Skin/15/Syndra.png" },
  { "name": "Twisted Fate", "url": "https://sunderarmor.com/characters/Skin/15/TwistedFate.png" },
  { "name": "Udyr", "url": "https://sunderarmor.com/characters/Skin/15/Udyr.png" },
  { "name": "Varus", "url": "https://sunderarmor.com/characters/Skin/15/Varus.png" },
  { "name": "Vi", "url": "https://sunderarmor.com/characters/Skin/15/Vi.png" },
  { "name": "Viego", "url": "https://sunderarmor.com/characters/Skin/15/Viego.png" },
  { "name": "Volibear", "url": "https://sunderarmor.com/characters/Skin/15/Volibear.png" },
  { "name": "Xayah", "url": "https://sunderarmor.com/characters/Skin/15/Xayah.png" },
  { "name": "Xin Zhao", "url": "https://sunderarmor.com/characters/Skin/15/XinZhao.png" },
  { "name": "Yasuo", "url": "https://sunderarmor.com/characters/Skin/15/Yasuo.png" },
  { "name": "Yone", "url": "https://sunderarmor.com/characters/Skin/15/Yone.png" },
  { "name": "Yuumi", "url": "https://sunderarmor.com/characters/Skin/15/Yuumi.png" },
  { "name": "Zac", "url": "https://sunderarmor.com/characters/Skin/15/Zac.png" },
  { "name": "Ziggs", "url": "https://sunderarmor.com/characters/Skin/15/Ziggs.png" },
  { "name": "Zyra", "url": "https://sunderarmor.com/characters/Skin/15/Zyra.png" }
]);

const itemsNormal = ref<Inventory[]>([
  {
    "name": "Infinity Edge",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_infinityedge.png"
  },
  {
    "name": "Sterak's Gage",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_steraksgage.png"
  },
  {
    "name": "Bloodthirster",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_bloodthirster.png"
  },
  {
    "name": "Edge of Night",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_guardianangel.png"
  },
  {
    "name": "Spear of Shojin",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_spearofshojin.png"
  },
  {
    "name": "Hextech Gunblade",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_hextechgunblade.png"
  },
  {
    "name": "Giant Slayer",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_madredsbloodrazor.png"
  },
  {
    "name": "Deathblade",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_deathblade.png"
  },
  {
    "name": "Last Whisper",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_lastwhisper.png"
  },
  {
    "name": "Nashor's Tooth",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_leviathan.png"
  },
  {
    "name": "Kraken's Fury",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_runaanshurricane.png?v=1"
  },
  {
    "name": "Titan's Resolve",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_titansresolve.png"
  },
  {
    "name": "Void Staff",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_statikkshiv.png?v=1"
  },
  {
    "name": "Guinsoo's Rageblade",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_guinsoosrageblade.png"
  },
  {
    "name": "Red Buff",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_rapidfirecannon.png"
  },
  {
    "name": "Jeweled Gauntlet",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_jeweledgauntlet.png"
  },
  {
    "name": "Morellonomicon",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_morellonomicon.png"
  },
  {
    "name": "Ionic Spark",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_ionicspark.png"
  },
  {
    "name": "Crownguard",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_crownguard.png"
  },
  {
    "name": "Archangel's Staff",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_archangelsstaff.png"
  },
  {
    "name": "Rabadon's Deathcap",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_rabadonsdeathcap.png"
  },
  {
    "name": "Hand Of Justice",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_unstableconcoction.png"
  },
  {
    "name": "Spirit Visage",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_redemption.png?v=1"
  },
  {
    "name": "Adaptive Helm",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_adaptivehelm.png"
  },
  {
    "name": "Protector's Vow",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_frozenheart.png"
  },
  {
    "name": "Blue Buff",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_bluebuff.png"
  },
  {
    "name": "Steadfast Heart",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_nightharvester.png"
  },
  {
    "name": "Sunfire Cape",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_redbuff.png"
  },
  {
    "name": "Gargoyle Stoneplate",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_gargoylestoneplate.png"
  },
  {
    "name": "Bramble Vest",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_bramblevest.png"
  },
  {
    "name": "Quicksilver",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_quicksilver.png"
  },
  {
    "name": "Evenshroud",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_spectralgauntlet.png"
  },
  {
    "name": "Dragon's Claw",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_dragonsclaw.png"
  },
  {
    "name": "Striker's Flail",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_powergauntlet.png"
  },
  {
    "name": "Warmog's Armor",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_warmogsarmor.png"
  },
  {
    "name": "Tactician's Cape",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_tacticiansring.png"
  },
  {
    "name": "Thief's Gloves",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_thiefsgloves.png"
  },
  {
    "name": "Tactician's Crown",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_forceofnature.png"
  },
  {
    "name": "Tactician's Shield",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_tacticiansscepter.png"
  },
  {
    "name": "B.F. Sword",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_bfsword.png"
  },
  {
    "name": "Recurve Bow",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_recurvebow.png"
  },
  {
    "name": "Needlessly Large Rod",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_needlesslylargerod.png"
  },
  {
    "name": "Tear of the Goddess",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_tearofthegoddess.png"
  },
  {
    "name": "Chain Vest",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_chainvest.png"
  },
  {
    "name": "Negatron Cloak",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_negatroncloak.png"
  },
  {
    "name": "Giant's Belt",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_giantsbelt.png"
  },
  {
    "name": "Spatula",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_spatula.png"
  },
  {
    "name": "Sparring Gloves",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_sparringgloves.png"
  },
  {
    "name": "Frying Pan",
    "url": "https://cdn.metatft.com/file/metatft/items/tft_item_fryingpan.png"
  }
]
);
</script>
