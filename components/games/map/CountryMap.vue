<script setup lang="ts">
import {CountryHighlightMapItem, type HighlightMapItem} from "~/utils/game/impl/ClientMapGame";
import type {MapContainer} from "~/types/gameModels";
import {nextTick} from "vue";

const { $leaflet: L } = useNuxtApp()
const emit = defineEmits<{ click: [item: HighlightMapItem] }>()
const { init, interact } = defineProps({
  init: { type: Object as PropType<CountryHighlightMapItem> },
  interact: { type: Boolean, default: true }
})

const highlighted = ref<CountryHighlightMapItem | undefined>(init)
const mapContainer = ref<HTMLElement | null>(null)
const geoLayer = ref<L.GeoJSON | null>(null)
const loading = ref<boolean>(true)
let map: any

const defaultStyle = {
  color: '#888',
  weight: 1,
  fillOpacity: 0.2,
  interactive: interact
}

const highlightStyle = {
  weight: 2,
  color: '#4af',
  fillOpacity: 0.4
}

const solve = (container: MapContainer) => {
  // mark current highlighted country as false, if selected
  if(highlighted.value) {
    const item = highlighted.value
    item.color = "#FB7085"
    highlightCountry(item)
  }

  // mark goal as correct
  if(container.goal) {
    highlightCountry(new CountryHighlightMapItem(container.goal, "#2ED4BF"))
  }
}

function resetHover(e: any) {
  if(interact) {
    refreshLayers()
  }
}

function focusHover(e: any) {
  if(interact) {
    refreshLayers()
    const layer = e.target
    layer.setStyle(highlightStyle)
  }
}

function onCountryClick(e: any) {
  if(interact) {
    const iso2 = e.target.feature.properties.iso_a2
    const item = new CountryHighlightMapItem(iso2, "#3ABDF8")
    highlighted.value = item
    emit("click", item)
    refreshLayers()
  }
}

function highlightCountry(item: CountryHighlightMapItem) {
  geoLayer.value?.eachLayer((layer: any) => {
    if (layer.feature?.properties?.iso_a2 === item.iso2) {
      layer.setStyle({
        fillColor: item.color,
        weight: 2,
        color: item.color,
        fillOpacity: 0.7
      });
    }
  });
}

function refreshLayers() {
  geoLayer.value?.eachLayer((layer: any) => {
    geoLayer.value!!.resetStyle(layer)
  })

  if(highlighted.value) {
    highlightCountry(highlighted.value)
  }
}

defineExpose({ solve })
onMounted(async () => {
  loading.value = true
  map = L.map(mapContainer.value!, {
    zoomControl: false,
    attributionControl: false,
  }).setView([51, 10], 4)

  L.tileLayer('', {}).addTo(map)

  const geojson = await fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson').then(r => r.json())

  geoLayer.value = L.geoJSON(geojson, {
    style: defaultStyle,
    onEachFeature(feature, layer) {
      layer.on({
        mouseover: focusHover,
        mouseout: resetHover,
        click: onCountryClick
      })
    }
  }).addTo(map)

  if(init) {
    highlightCountry(init)
    emit("click", init)
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
      layer._path.style.pointerEvents = "auto";

      layer.on({
        mouseover: focusHover,
        mouseout: resetHover,
        click: onCountryClick
      });
    } else {
      layer.options.interactive = false;
      layer._path.style.pointerEvents = "none";

      layer.off();
    }
  });
});
</script>

<template>
  <div class="flex gap-3 skeleton justify-center items-center w-full h-[540px]" v-if="loading">
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
</style>