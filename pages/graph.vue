<script setup lang="ts">
import ForceGraph3D, {type ForceGraph3DInstance, type LinkObject, type NodeObject} from "3d-force-graph";
import * as THREE from "three";
import EyeSlashIcon from "~/components/icons/EyeSlashIcon.vue";
import EyeIcon from "~/components/icons/EyeIcon.vue";
import Xmark from "~/components/icons/Xmark.vue";
import {RichTrack} from "~/types/content";
import ViewfinderCircleIcon from "~/components/icons/ViewfinderCircleIcon.vue";
import GraphNodeInput from "~/components/graph/GraphNodeInput.vue";
import SpotifyIcon from "~/components/icons/SpotifyIcon.vue";
import {plural} from "~/utils/utils";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import {getInjectedCacheKey} from "~/utils/cacheKeys";

definePageMeta({
  layout: "plain",
});
useHead({
  meta: [
    { name: "darkreader-lock", content: "" } // disable darkreader for this page
  ]
})

export type ArtistGraphNode = {
  id: string;
  name: string;
  image: string | null;
  val: number;
};

type ArtistGraphLink = {
  source: ArtistGraphNode;
  target: ArtistGraphNode;
  value: number;
};

type ArtistGraphData = {
  nodes: ArtistGraphNode[];
  links: ArtistGraphLink[];
};

const graphLevels = [1, 2, 3, 4, 6]
const graphEl = ref<HTMLDivElement | null>(null);
const graph = ref<ForceGraph3DInstance | null>(null);
const nodes = computed<ArtistGraphNode[]>(() => graph.value?.graphData().nodes.map(n => n as ArtistGraphNode) ?? []);
const links = computed<ArtistGraphLink[]>(() => graph.value?.graphData().links.map(l => l as ArtistGraphLink) ?? []);
const textureCache = new Map<string, THREE.Texture>();
const minWeight = ref<number>(3)
const currentNode = ref<ArtistGraphNode | undefined>(undefined)
const collabNode = ref<ArtistGraphNode | undefined>(undefined)
const currentLinks = computed<{ artist: ArtistGraphNode, weight: number }[]>(() => {
  if(currentNode.value && graph) {
    return links.value.filter(l => l.target.id == currentNode.value!!.id || l.source.id == currentNode.value!!.id)
        .map(link => extractTargetArtist(link))
  } else return []
})
const showLinks = ref<boolean>(true)
const alwaysShowLinks = ref<boolean>(false)
const graphCacheKey = computed(() => `graph-${minWeight.value}`)
const { data: graphData, pending } = await useAsyncData<ArtistGraphData>(graphCacheKey, () => $fetch<ArtistGraphData>("/api/content/graph", {
  query: {
    v: getInjectedCacheKey("graph"),
    minWeight: minWeight.value,
  },
}), { lazy: true });
const collabKey = computed(() => `collab-${currentNode.value?.id}:${collabNode.value?.id}`)
const { data: collabTracks } = await useAsyncData<RichTrack[]>(collabKey, () => $fetch<RichTrack[]>(`/api/content/collabs/${currentNode.value?.id}/${collabNode.value?.id}`).then(tracks => tracks.map(RichTrack.fromJson)))

const getCircularTexture = async (id: string) => {
  const url = `https://i.scdn.co/image/${id}`;
  const cachedTexture = textureCache.get(url);

  if (cachedTexture) {
    return cachedTexture;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  const size = 256;
  const radius = size / 2;

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", {
    alpha: true,
  });

  if (!context) {
    throw new Error("Could not create canvas context for graph node texture.");
  }

  context.clearRect(0, 0, size, size);
  context.globalCompositeOperation = "source-over";

  context.save();
  context.beginPath();
  context.arc(radius, radius, radius, 0, Math.PI * 2);
  context.closePath();
  context.clip();

  const imageSize = Math.min(image.width, image.height);
  const sourceX = (image.width - imageSize) / 2;
  const sourceY = (image.height - imageSize) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    imageSize,
    imageSize,
    0,
    0,
    size,
    size,
  );

  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(url, texture);

  return texture;
};

function zoomOnNode(n: NodeObject | undefined, jump: boolean = false) {
  if(n) {
    if(!jump) {
      showLinks.value = alwaysShowLinks.value
      currentNode.value = n as ArtistGraphNode

      graph.value?.linkColor(link => {
        return (n && (link.source === n || link.target === n)) ? "#00cfff" : "#ffffff";
      });
      graph.value?.linkVisibility(link => {
        return (n && (link.source === n || link.target === n)) ?? false
      })
    }

    if(n.x && n.y && n.z) {
      const distance = 300;
      const distRatio = 1 + distance/Math.hypot(n.x, n.y, n.z);

      const newPos = n.x || n.y || n.z
          ? { x: n.x * distRatio, y: n.y * distRatio, z: n.z * distRatio }
          : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

      graph.value?.cameraPosition(
          newPos, // new position
          { x: n.x, y: n.y, z: n.z }, // lookAt ({ x, y, z })
          1000  // ms transition duration
      );
    }
  }
}

function findNode(name: string): NodeObject | undefined {
  return nodes.value.find(n => {
    const node = n as ArtistGraphNode
    return node.name.toLowerCase() === name.toLowerCase();
  })
}

function search(node: ArtistGraphNode, inputFeedback: (success: boolean) => boolean) {
  zoomOnNode(node)
  inputFeedback(true)
}

function extractTargetArtist(link: LinkObject): { artist: ArtistGraphNode; weight: number } {
  const mapped = link as ArtistGraphLink
  const weight = mapped.value

  if(mapped.source.id == currentNode.value?.id) {
    return { artist: mapped.target, weight }
  } else {
    return { artist: mapped.source, weight }
  }
}

function refreshLinks() {
  const n = currentNode.value
  graph.value?.linkVisibility(link => {
    const sourceId = (link.source as ArtistGraphNode).id
    const targetId = (link.target as ArtistGraphNode).id

    if(n) {
      const currentId = (n as ArtistGraphNode).id
      return (currentId === sourceId || currentId === targetId) ? true : showLinks.value
    } else {
      return showLinks.value
    }
  })
  graph.value?.linkColor(link => {
    if(n) {
      const sourceId = (link.source as ArtistGraphNode).id
      const targetId = (link.target as ArtistGraphNode).id
      const currentId = (n as ArtistGraphNode).id

      return sourceId === currentId || targetId === currentId ? "#00cfff" : "#ffffff";
    } else return "#ffffff"
  });
}

function showAllLinks() {
  showLinks.value = true
  if(currentNode.value) alwaysShowLinks.value = true
}

function hideAllLinks() {
  showLinks.value = false
  if(currentNode.value) alwaysShowLinks.value = false
}

function getNodeImageUrl(node: ArtistGraphNode): string | undefined {
  return node.image ? `https://i.scdn.co/image/${node.image}` : undefined
}

function mountGraph(data: ArtistGraphData) {
  if (!graphEl.value) {
    return;
  }

  graph.value = new ForceGraph3D(graphEl.value, { controlType: 'orbit' })
      .graphData(data)
      .backgroundColor("#050505")
      .nodeLabel((node) => {
        const artist = node as ArtistGraphNode;

        return `${artist.name}`;
      })
      .nodeVal((node) => {
        const artist = node as ArtistGraphNode;

        return Math.sqrt(artist.val);
      })
      .linkWidth((link) => {
        const artistLink = link as ArtistGraphLink;

        return Math.sqrt(artistLink.value);
      })
      .linkOpacity(0.35)
      .linkColor(() => "#ffffff")
      .nodeThreeObject((node) => {
        const artist = node as ArtistGraphNode;
        const size = Math.max(10, Math.min(artist.val * 1.5, 32));

        if (!artist.image) {
          const geometry = new THREE.SphereGeometry(6);
          const material = new THREE.MeshBasicMaterial({
            color: "#ffffff",
          });

          return new THREE.Mesh(geometry, material);
        }

        const placeholderCanvas = document.createElement("canvas");
        placeholderCanvas.width = 32;
        placeholderCanvas.height = 32;

        const placeholderContext = placeholderCanvas.getContext("2d");

        if (placeholderContext) {
          placeholderContext.beginPath();
          placeholderContext.arc(16, 16, 16, 0, Math.PI * 2);
          placeholderContext.fillStyle = "#ffffff";
          placeholderContext.fill();
        }

        const placeholderTexture = new THREE.CanvasTexture(placeholderCanvas);
        const material = new THREE.SpriteMaterial({
          map: placeholderTexture,
          transparent: true,
          alphaTest: 0.01,
          depthWrite: false,
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(size, size, 1);

        getCircularTexture(artist.image).then((texture) => {
          material.map = texture;
          material.transparent = true;
          material.alphaTest = 0.01;
          material.depthWrite = false;
          material.needsUpdate = true;
        });

        return sprite;
      })
      .onNodeClick((n) => {
        const node = n as ArtistGraphNode
        zoomOnNode(node)
      })

  graph.value?.d3Force("charge")?.strength(-180);
  graph.value?.enableNodeDrag(false)
}

watch(showLinks, () => refreshLinks())
watch(currentNode, () => {
  refreshLinks()
  collabNode.value = undefined
})
watch(graphData, (data) => {
  if(data) {
    mountGraph(data)
  }
}, { immediate: true })
onMounted(() => mountGraph(graphData.value!!))
</script>

<template>
  <div class="relative h-screen" id="wrapper">
    <div class="absolute w-full z-20 border-b border-white/5">
      <div class="flex justify-center items-center backdrop-blur-2xl p-4 relative min-h-16">
        <div class="flex gap-2 items-center absolute left-4 cursor-pointer" @click="navigateTo('/')">
          <img class="size-8" src="/img/icon512-transparent.png" alt="hardstyle.gg logo" />
          <p class="anton italic text-accent">hardstyle.gg</p>
        </div>
        <div class="flex gap-2 items-center -my-10" v-if="currentNode">
          <img class="size-12 rounded-full" :src="getNodeImageUrl(currentNode)" v-if="currentNode.image" :alt="currentNode.name" />
          <h1 class="font-black text-3xl" v-if="currentNode">{{ currentNode.name }}</h1>
        </div>
        <GraphNodeInput class="absolute right-4" :nodes="nodes"
              @onSelected="search" v-slot="{ inputBindings, inputEvents }">
          <label class="input bg-transparent">
            <SearchIcon />
            <input type="text" class="bg-transparent" v-bind="inputBindings" v-on="inputEvents" />
          </label>
        </GraphNodeInput>
      </div>
    </div>

    <div class="absolute right-2 bottom-2 z-22" v-if="currentNode">
      <div class="flex flex-col items-center justify-center p-3 rounded-md border border-white/10 backdrop-blur-2xl relative">
        <div class="absolute -top-1 -right-1 p-1">
          <Xmark class="opacity-60 cursor-pointer scale-70" @click="currentNode = undefined" />
        </div>
        <div class="flex gap-2 self-start items-center">
          <img class="size-10 rounded-full" :src="getNodeImageUrl(currentNode)" v-if="currentNode.image" :alt="currentNode.name" />
          <h1 class="font-bold text-2xl">{{ currentNode.name }}</h1>
        </div>
        <p class="divider my-1"></p>
        <p class="uppercase font-semibold tracking-tighter opacity-50 text-xs mb-0.5">Most frequent collaborators</p>
        <div class="max-h-60 overflow-y-auto">
          <div class="flex gap-1 items-center self-start" v-for="(link, index) in currentLinks" :key="index">
            <img class="size-6 rounded-full" :src="getNodeImageUrl(link.artist)" v-if="link.artist.image" :alt="link.artist.name" />
            <a class="font-medium hover:underline cursor-pointer"
               @click="collabNode=link.artist"
               @click.ctrl="zoomOnNode(link.artist)">
              {{ link.artist.name }}
            </a>
            <div class="badge badge-primary bg-primary-content/50 badge-sm badge-soft px-1">{{ link.weight }}</div>
          </div>
        </div>
        <p class="tracking-tighter opacity-30 text-xs mt-1 scale-90">(control+click to jump)</p>
      </div>
    </div>

    <div class="absolute left-4 bottom-4 z-22 rounded-box border border-white/5 backdrop-blur-2xl w-43">
      <ul class="menu bg-transparent w-full">
        <li>
          <a v-if="showLinks" @click="hideAllLinks()">
            <EyeSlashIcon />
            Hide all links
          </a>
          <a v-else @click="showAllLinks()">
            <EyeIcon />
            Show all links
          </a>
        </li>
        <li v-if="currentNode">
          <a @click="zoomOnNode(currentNode, true)">
            <ViewfinderCircleIcon />
            Center selected
          </a>
        </li>
      </ul>

      <p class="text-center text-sm opacity-85 tracking-tigther mb-1">Graph granularity</p>
      <div class="flex gap-2 justify-center mb-2">
        <div class="flex flex-col items-center tooltip" :data-tip="`≥${level} ${plural('collab', level)}`" v-for="(level, index) in graphLevels" :key="level">
          <input type="radio" name="graph-level" class="radio radio-xs"
                 @click="minWeight = level; currentNode = undefined" :checked="level === 3" />
          <p class="text-xs opacity-50" v-if="index === 0">max</p>
          <p class="text-xs opacity-50" v-else-if="index === graphLevels.length-1">min</p>
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-0 flex justify-center mb-6 z-21" v-if="collabNode !== undefined && currentNode !== undefined">
      <div class="collapse collapse-plus bg-transparent backdrop-blur-3xl border border-white/5 w-fit">
        <input type="checkbox" :checked="true" />
        <div class="flex gap-1 collapse-title font-semibold text-lg items-center">
          {{ currentNode.name }} x {{ collabNode.name }}
          <div class="badge bg-content/50 badge-sm badge-soft px-1">{{ collabTracks?.length }}</div>
        </div>
        <div class="collapse-content text-sm">
          <div class="flex flex-col gap-2 max-h-70 overflow-auto">
            <div class="flex gap-2 border border-white/10 rounded-md items-center pr-2 relative" v-for="track in collabTracks" :key="track.sid">
              <a class="absolute top-0.5 right-0.5" :href="track.getPlayUrl()" target="_blank">
                <SpotifyIcon class="size-6 fill-white/30 hover:fill-emerald-500 transition-colors" />
              </a>
              <img class="size-16 rounded-md" :src="track.getImageUrl()" :alt="track.getDisplayName(true)" />
              <div class="flex flex-col">
                <p class="font-semibold">{{ track.getDisplayName(true) }}</p>
                <div class="text-xs tracking-tight opacity-80">
                  <template v-for="(artist, index) in track.artists" :key="index">
                    <span class="hover:underline hover:text-white cursor-pointer" @click="zoomOnNode(findNode(artist.name));">
                      {{ artist.name }}
                    </span>
                    <span v-if="index !== track.artists.length-1"> & </span>
                  </template>
                </div>
                <p class="opacity-50 tracking-tighter text-xs">{{ track.year }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-screen h-screen flex justify-center items-center" v-if="pending">
      <span class="loading loading-ring loading-xl"></span>
      Loading...
    </div>
    <div ref="graphEl" class="graph absolute" v-show="!pending"></div>
  </div>
</template>

<style scoped>
#wrapper {
  --root-bg: #050505;
  background: var(--root-bg);
}
.graph {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>