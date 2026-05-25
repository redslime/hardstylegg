<script setup lang="ts">
import {DivIcon, type GeoJSON, type LeafletMouseEvent, type Map, type Marker} from 'leaflet'
import PinIcon from '~/components/icons/PinIcon.vue'
import {renderToString} from 'vue/server-renderer'
import {nextTick} from 'vue'
import {
  EventHighlightMapItem,
  type EventMarker,
  type HighlightMapItem,
  mapEventMarkers
} from "~/utils/game/impl/ClientMapGame";
import type {MapContainer} from "~/types/gameModels";

const { $leaflet: L } = useNuxtApp()

export type HighlightItem = { id: number, icon: DivIcon, marker: Marker }

const { init, interact, debug, osm } = defineProps({
  init: { type: Object as PropType<EventHighlightMapItem> },
  interact: { type: Boolean, default: true },
  debug: { type: Boolean, default: import.meta.env.DEV },
  osm: { type: Boolean, default: import.meta.env.DEV }
})
const emit = defineEmits<{ click: [item: HighlightMapItem] }>()

const loading = ref<boolean>(true)
const highlighted = ref<HighlightItem | undefined>()
const mapContainer = ref<HTMLElement | null>(null)
const geoLayer = ref<GeoJSON | null>(null)
const markerRefs = ref<Record<string, Marker>>({})
let map: Map

const defaultStyle = {
  color: '#888',
  weight: 1,
  fillOpacity: 0.2,
  interactive: interact
}

let pinIconHtml = ''

const solve = (container: MapContainer) => {
  hideMarkers()

  // mark current highlighted marker as false, if selected
  if(highlighted.value) {
    highlightMarker(highlighted.value.id, "fail")
  }

  // mark goal as correct
  if(container.goal) {
    highlightMarker(Number(container.goal), "success")
  }
}

async function createPinIcon(title: string) {
  if (!pinIconHtml) {
    pinIconHtml = await renderToString(h(PinIcon))
  }
  
  return L.divIcon({
    html: `<div class='flex items-center gap-1'>
             <div class="pin-svg-wrapper">${pinIconHtml}</div>
             <span class="pin-label">${title}</span>
           </div>`,
    className: 'pin',
    iconSize: [0, 0],
    iconAnchor: [8, 16]
  })
}

async function addMarker(marker: EventMarker) {
  if (!map) return
  
  const icon = await createPinIcon(marker.name)
  const options = { title: marker.name }
  const mapMarker = L.marker([marker.lat, marker.lng], {
    ...options,
    icon,
    interactive: true
  }).addTo(map)

  mapMarker.on('click', () => {
    if(interact) {
      clickMarker(marker.id, mapMarker, icon)
    }
  })

  if(init && init.id === marker.id) {
    clickMarker(marker.id, mapMarker, icon)
  }
  
  markerRefs.value[marker.id] = mapMarker
  return mapMarker
}

function clickMarker(id: number, marker: Marker, icon: DivIcon) {
  if(highlighted.value) {
    highlighted.value.icon.options.className = 'pin'
    highlighted.value.marker.setIcon(highlighted.value.icon)
  }

  icon.options.className = 'pin-highlighted'
  marker.options.icon!!.options.className = 'pin-highlighted'
  marker.setIcon(icon)
  highlighted.value = { id, icon, marker }
  emit("click", new EventHighlightMapItem(id))
}

function hideMarkers() {
  Object.values(markerRefs.value).forEach(marker => {
    marker.setOpacity(0)
  })
}

function highlightMarker(id: number, color: string) {
  const marker = markerRefs.value[id]

  if(marker) {
    marker.setOpacity(1)
    marker.setIcon(L.divIcon({
      html: `<div class='flex items-center gap-1'>
               <div class="pin-svg-wrapper">${pinIconHtml}</div>
               <span class="pin-label">${marker.options.title}</span>
             </div>`,
      className: `pin-${color}`,
      iconSize: [0, 0],
      iconAnchor: [8, 16]
    }))
  }
}

defineExpose({ solve })
onMounted(async () => {
  if (!mapContainer.value) return

  loading.value = true
  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([51.3, 5.5], 7)

  if (osm) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      opacity: 0.5
    }).addTo(map)
  }

  try {
    const features = await fetch("/benelux.geojson?v=1").then(re => re.json())
    geoLayer.value = L.geoJSON({ type: 'FeatureCollection', features } as any, {
      style: defaultStyle
    }).addTo(map)
  } catch (err) {
    console.error('Failed to load detailed GeoJSON', err)
  }

  map.on('click', (e: LeafletMouseEvent) => {
    if (debug) {
      console.log(`{ name: 'replace', lat: ${e.latlng.lat.toFixed(5)}, lng: ${e.latlng.lng.toFixed(5)} },`)
    }
  })

  for(const marker of mapEventMarkers) {
    await addMarker(marker)
  }

  loading.value = false
  await nextTick(() => {
    map.invalidateSize()
  })
})

watch(() => interact, (value) => {
  geoLayer.value?.eachLayer((layer: any) => {
    if (value) {
      layer.options.interactive = true;
      const path = (layer as any)._path;
      if (path) path.style.pointerEvents = "auto";
    } else {
      layer.options.interactive = false;
      const path = (layer as any)._path;
      if (path) path.style.pointerEvents = "none";

      layer.off();
    }
  });
  
  Object.values(markerRefs.value).forEach(marker => {
    if (value) {
      marker.getElement()?.style.setProperty('pointer-events', 'auto')
    } else {
      marker.getElement()?.style.setProperty('pointer-events', 'none')
    }
  })
});
</script>

<template>
  <div class="flex justify-center items-center w-full min-h-10" v-if="loading">
    <div class="loading loading-spinner loading-xl"></div>
    Loading map...
  </div>
  <div ref="mapContainer" class="relative" style="height: 540px; width: 100%;" v-show="!loading">
    <slot></slot>
  </div>
</template>

<style>
.leaflet-container {
  background: transparent !important;
}
.pin {
  color: var(--color-info);
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
}
.pin-highlighted {
  color: var(--color-warning);
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
}
.pin-success {
  color: var(--color-success);
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
}
.pin-fail {
  color: var(--color-error);
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
}
.pin-svg-wrapper svg {
  width: 24px;
  height: 24px;
}
.pin-label {
  white-space: nowrap;
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}
</style>