<script setup lang="ts">
const { $leaflet: L } = useNuxtApp()
const emit = defineEmits(['click'])
const highlighted = defineModel<HighlightItem[]>('highlighted', { default: [] })
const { interact } = defineProps({
  interact: { type: Boolean, default: true }
})

export type HighlightItem = { iso2: string, color: string }
const mapContainer = ref<HTMLElement | null>(null)
const geoLayer = ref<L.GeoJSON | null>(null)
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

function resetHover(e: any) {
  if(interact) {
    const iso2 = e.target.feature.properties.iso_a2

    if(highlighted.value.find(item => item.iso2 === iso2) === undefined) {
      geoLayer.value!!.resetStyle(e.target)
    }
  }
}

function focusHover(e: any) {
  if(interact) {
    const iso2 = e.target.feature.properties.iso_a2

    if(highlighted.value.find(item => item.iso2 === iso2) === undefined) {
      const layer = e.target
      layer.setStyle(highlightStyle)
    }
  }
}

function onCountryClick(e: any) {
  if(interact) {
    const iso2 = e.target.feature.properties.iso_a2
    emit("click", iso2)
  }
}

function highlightCountry(item: HighlightItem) {
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

onMounted(async () => {
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

  highlighted.value.forEach(item => highlightCountry(item))
})

watch(highlighted, (value) => {
  geoLayer.value?.eachLayer((layer: any) => {
    geoLayer.value!!.resetStyle(layer)
  })
  value.forEach(item => highlightCountry(item))
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
  <div ref="mapContainer" style="height: 540px; width: 100%;"></div>
</template>

<style>
.leaflet-container {
  background: transparent !important;
}
</style>
