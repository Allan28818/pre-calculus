<script setup lang="ts">
import './styles/main.css'
import { ref, onMounted, watch, computed } from 'vue'

import {
  fromStringToAsciiArray,
  fromAsciiArrayToString,
  encryptAsciiArray,
} from './utils/encryption'

type ChartSeries = {
  name: string
  data: number[]
}

type ChartOptions = {
  chart: {
    height: number
    type: string
    zoom: {
      enabled: boolean
    }
    toolbar: {
      show: boolean
    }
  }
  dataLabels: {
    enabled: boolean
  }
  stroke: {
    curve: string
  }
  title: {
    text: string
    align: string
    style: {
      fontFamily: string
      color?: string
    }
  }
  grid: {
    row: {
      colors: string[]
      opacity: number
    }
  }
  xaxis: {
    categories: number[]
  }
  colors: string[]
}

const textToEncrypt = ref('')
let textToEncryptSnapshot = ''
const encryptedText = ref('')

const isDarkTheme = ref(false)
const showBoxes = ref(false)

const domain = ref<number[]>([])
const image = ref<number[]>([])

const chartOptions = ref<ChartOptions | null>(null)
const chartSeries = ref<ChartSeries[]>([])

const chartColors = computed(() => {
  const root = document.documentElement
  const styles = getComputedStyle(root)

  if (isDarkTheme.value) {
    return {
      gridColor: styles.getPropertyValue('--chart-grid-dark').trim() || 'rgba(255, 255, 255, 0.1)',
      titleColor: styles.getPropertyValue('--chart-title-dark').trim() || 'rgb(255, 204, 163)',
      lineColor: styles.getPropertyValue('--chart-line-dark').trim() || '#ff6000',
    }
  } else {
    return {
      gridColor: styles.getPropertyValue('--chart-grid-light').trim() || '#f3f3f3',
      titleColor: styles.getPropertyValue('--chart-title-light').trim() || '#333',
      lineColor: styles.getPropertyValue('--chart-line-light').trim() || '#ff6000',
    }
  }
})

function updateChartColors() {
  if (showBoxes.value && chartOptions.value) {
    const colors = chartColors.value
    chartOptions.value = {
      ...chartOptions.value,
      title: {
        ...chartOptions.value.title,
        style: {
          ...chartOptions.value.title.style,
          color: colors.titleColor,
        },
      },
      grid: {
        ...chartOptions.value.grid,
        row: {
          colors: [colors.gridColor, 'transparent'],
          opacity: 0.5,
        },
      },
      colors: [colors.lineColor],
    }
  }
}

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  isDarkTheme.value = mediaQuery.matches

  mediaQuery.addEventListener('change', (event) => {
    isDarkTheme.value = event.matches
  })
})

watch(isDarkTheme, () => {
  updateChartColors()
})

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
}

function handleEncrypt() {
  const text = textToEncrypt.value
  textToEncryptSnapshot = text

  const asciiArray = fromStringToAsciiArray(text)

  const encryptedAsciiArray = encryptAsciiArray(asciiArray)

  const result = fromAsciiArrayToString(encryptedAsciiArray)

  const rawChartData = asciiArray
    .map((x, index) => ({
      x,
      y: encryptedAsciiArray[index] as number,
    }))
    .sort((a, b) => a.x - b.x)

  chartSeries.value = [
    {
      name: `Original: ${text}`,
      data: rawChartData.map((data) => data.y),
    },
  ]

  const colors = chartColors.value

  chartOptions.value = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'straight',
    },
    title: {
      text: 'Comparativo das distâncias',
      align: 'left',
      style: {
        fontFamily: 'Poppins, sans-serif',
        color: colors.titleColor,
      },
    },
    grid: {
      row: {
        colors: [colors.gridColor, 'transparent'],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: rawChartData.map((data) => data.x),
    },
    colors: [colors.lineColor],
  }

  domain.value = asciiArray
  image.value = encryptedAsciiArray
  encryptedText.value = result

  showBoxes.value = true
}

function handleReset() {
  textToEncryptSnapshot = ''
  textToEncrypt.value = ''
  encryptedText.value = ''
  domain.value = []
  image.value = []
  chartOptions.value = null
  chartSeries.value = []
  showBoxes.value = false
}
</script>

<template>
  <main class="container" :class="{ 'dark-mode': isDarkTheme }">
    <div class="content">
      <div class="theme-btn-container">
        <div class="toggle">
          <input type="checkbox" @click="toggleTheme" :checked="!isDarkTheme" />
          <span class="button"></span>
          <span class="label" v-if="!isDarkTheme">☼</span>
          <span class="label" v-else>☽</span>
        </div>
      </div>

      <div class="card">
        <h1 class="title">Composition Encryptor</h1>
        <div class="card-content">
          <input
            type="text"
            id="encrypt-input"
            name="text-to-encrypt"
            placeholder="Digite algo..."
            v-model="textToEncrypt"
          />

          <div class="button-group">
            <button class="encrypt-button" @click="handleEncrypt">
              <span>Criptografar</span>
            </button>

            <button class="reset-button" @click="handleReset" v-show="showBoxes">
              <span>Resetar</span>
            </button>
          </div>

          <div class="boxes" v-show="showBoxes">
            <div class="domain">
              <span class="box-label">
                {{ textToEncryptSnapshot }}
              </span>

              <div class="box-content">
                <div
                  class="box"
                  :class="{ 'dark-mode': isDarkTheme }"
                  v-for="(boxCharacter, idx) in domain"
                  :key="'domain-' + idx"
                >
                  <span>{{ boxCharacter }}</span>
                </div>
              </div>
            </div>
            <div class="image">
              <span class="box-label">
                {{ encryptedText }}
              </span>
              <div class="box-content">
                <div
                  class="box"
                  :class="{ 'dark-mode': isDarkTheme }"
                  v-for="(boxCharacter, idx) in image"
                  :key="'domain-' + idx"
                >
                  <span>{{ boxCharacter }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-wrapper" v-show="showBoxes">
            <apexchart
              width="500"
              type="line"
              :options="chartOptions"
              :series="chartSeries"
            ></apexchart>
          </div>
        </div>
      </div>
    </div>
  </main>
  <svg id="texture-source" style="display: none">
    <filter id="grainy-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    </filter>
  </svg>
</template>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
  z-index: 1;
  isolation: isolate;
}

.container.dark-mode {
  background-color: var(--bg-primary-dark);
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  filter: url(#grainy-noise);
  opacity: 0.25;
  z-index: -1;
}

.content {
  z-index: 3;
}

.container .card {
  display: flex;
  flex-direction: column;
  width: 40%;
  height: auto;
  padding: 30px 10px;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-top: 10px;
  border-radius: 10px;
  box-shadow: 0px 2.5px 25px 5px #000000;
  background: var(--foreground-dark);
  border-top: 1px solid var(--soul-white);
  gap: 2rem;
}

.container:not(.dark-mode) .card {
  background: var(--white-card);
  box-shadow: 0px 2.5px 25px 5px var(--shadow-light);
  border-top: 1px solid var(--soul-orange);
}

.container .card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  filter: url(#grainy-noise);
  opacity: 0.25;
}

.container .card .title {
  font-size: 1.6rem;
  font-weight: 900;
}

.container .card .card-content {
  display: flex;
  flex-direction: column;
  z-index: 4;
  gap: 10px;
}

.card .card-content input {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  border: none;
  outline: transparent;
  padding: 0.7rem;
  border-radius: 1rem;
  transition: all 0.3s;
  font-size: 1.2rem;
  opacity: 0.8;
}

.card .card-content input::placeholder {
  font-style: italic;
}

.card .card-content input:focus {
  outline: solid;
  opacity: 1;
}

.container.dark-mode .card .card-content input {
  color: var(--text-white);
  background: var(--input-dark);
  box-shadow:
    20px 20px 60px var(--bg-hard-dark),
    -20px -20px 60px var(--dark-ultra);
}

.container.dark-mode .card .card-content input:hover {
  background: var(--input-dark);
  background: linear-gradient(
    315deg,
    var(--input-dark) 0%,
    hsla(0, 0%, 40%, 1) 52%,
    var(--input-dark) 100%
  );
}

.container.dark-mode .card .card-content input:focus {
  outline-color: var(--bg-hard-dark);
  background: var(--focus-input-dark);
  box-shadow:
    inset 20px 20px 60px var(--focus-input-dark),
    inset -20px -20px 60px var(--soul-orange),
    0px 0px 20px 5px var(--bg-primary-dark);
}

.container.dark-mode .card .card-content input::placeholder {
  color: var(--grey);
}

.container:not(.dark-mode) .card .card-content input {
  color: var(--text-black);
  background: var(--white-card);
  box-shadow:
    20px 20px 60px var(--shadow-input-light),
    -20px -20px 60px var(--white-card);
}

.container:not(.dark-mode) .card .card-content input:hover {
  background: linear-gradient(
    315deg,
    var(--gradient-light-start) 0%,
    var(--gradient-light-mid) 52%,
    var(--gradient-light-end) 100%
  );
}

.container:not(.dark-mode) .card .card-content input:focus {
  outline-color: var(--orange);
  background: var(--white-soft);
  box-shadow:
    inset 20px 20px 60px var(--shadow-input-focus-light),
    inset -20px -20px 60px var(--white-card),
    0px 0px 20px 5px var(--soul-orange);
}

.container:not(.dark-mode) .card .card-content input::placeholder {
  color: var(--grey-light);
}

.toggle {
  display: inline-block;
}

.toggle {
  position: absolute;
  height: 100px;
  width: 100px;
}

.toggle:before {
  box-shadow: 0;
  border-radius: 84.5px;
  background: #fff;
  position: absolute;
  margin-left: -36px;
  margin-top: -36px;
  opacity: 0.2;
  height: 72px;
  width: 72px;
  left: 50%;
  top: 50%;
}

.toogle input:checked ~ .label {
  color: rgba(255, 0, 0, 0.8);
}

.toggle .button {
  transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow:
    0 15px 25px -4px rgba(0, 0, 0, 0.5),
    inset 0 -3px 4px -1px rgba(0, 0, 0, 0.2),
    0 -10px 15px -1px rgba(255, 255, 255, 0.6),
    inset 0 3px 4px -1px rgba(255, 255, 255, 0.2),
    inset 0 0 5px 1px rgba(255, 255, 255, 0.8),
    inset 0 20px 30px 0 rgba(255, 255, 255, 0.2);
  border-radius: 68.8px;
  position: absolute;
  background: #eaeaea;
  margin-left: -34.4px;
  margin-top: -34.4px;
  display: block;
  height: 68.8px;
  width: 68.8px;
  left: 50%;
  top: 50%;
}

.toggle .label {
  transition: color 300ms ease-out;
  line-height: 101px;
  text-align: center;
  position: absolute;
  font-weight: 700;
  font-size: 28px;
  display: block;
  opacity: 0.9;
  height: 100%;
  width: 100%;
  color: rgba(0, 0, 0, 0.9);
}

.toggle input {
  opacity: 0;
  position: absolute;
  cursor: pointer;
  z-index: 1;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

.toggle input:active ~ .button {
  filter: blur(0.5px);
  box-shadow:
    0 12px 25px -4px rgba(0, 0, 0, 0.4),
    inset 0 -8px 30px 1px rgba(255, 255, 255, 0.9),
    0 -10px 15px -1px rgba(255, 255, 255, 0.6),
    inset 0 8px 25px 0 rgba(0, 0, 0, 0.4),
    inset 0 0 10px 1px rgba(255, 255, 255, 0.6);
}

.toggle input:active ~ .label {
  font-size: 26px;
  color: rgba(0, 0, 0, 0.45);
}

.toggle input:checked ~ .button {
  filter: blur(0.5px);
  box-shadow:
    0 10px 25px -4px rgba(0, 0, 0, 0.4),
    inset 0 -8px 25px -1px rgba(255, 255, 255, 0.9),
    0 -10px 15px -1px rgba(255, 255, 255, 0.6),
    inset 0 8px 20px 0 rgba(0, 0, 0, 0.2),
    inset 0 0 5px 1px rgba(255, 255, 255, 0.6);
}

.toggle input:checked ~ .label {
  color: rgba(0, 0, 0, 0.8);
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-top: 40px;
}

.encrypt-button,
.reset-button {
  width: fit-content;
  min-width: 100px;
  height: 45px;
  padding: 8px 16px;
  border-radius: 5px;
  box-shadow: 0px 0px 20px -20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out 0ms;
  user-select: none;
  background: transparent;
}

.encrypt-button:hover,
.reset-button:hover {
  box-shadow: 0px 0px 20px -18px;
}

.encrypt-button:active,
.reset-button:active {
  transform: scale(0.95);
}

.container.dark-mode .card .encrypt-button {
  color: var(--text-white);
  font-weight: bold;
  text-transform: uppercase;
  border: 2.5px solid var(--bg-primary-dark);
}

.container.dark-mode .card .encrypt-button:hover {
  background-color: var(--foreground-dark);
}

.container.dark-mode .card .reset-button {
  color: var(--text-white);
  font-weight: bold;
  text-transform: uppercase;
  border: 2.5px solid var(--bg-primary-dark);
}

.container.dark-mode .card .reset-button:hover {
  background-color: var(--bg-hard-dark);
  border-color: var(--dark-ultra);
}

.container:not(.dark-mode) .card .encrypt-button {
  color: var(--text-grey);
  font-weight: bold;
  text-transform: uppercase;
  border: 2.5px solid var(--orange);
}

.container:not(.dark-mode) .card .encrypt-button:hover {
  background-color: var(--soul-orange);
  border-color: var(--orange-hover);
}

.container:not(.dark-mode) .card .reset-button {
  color: var(--text-grey);
  font-weight: bold;
  text-transform: uppercase;
  border: 2.5px solid var(--text-grey);
}

.container:not(.dark-mode) .card .reset-button:hover {
  background-color: var(--grey);
  border-color: var(--text-black);
  color: var(--white-card);
}

.boxes {
  margin: auto;
  margin-top: 30px;
}

.boxes .domain,
.boxes .image {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 90%;

  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
}

.box-label {
  font-size: 1rem;
  display: flex;
  text-align: center;
  font-weight: 800;
  align-items: center;
  justify-content: center;
}

.box-content {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: auto;
  max-width: 100%;
  flex-wrap: wrap;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  border: 2px solid var(--soul-orange);
  font-weight: 700;
  color: var(--text-black);
  cursor: pointer;
  transition: all 0.3s;
}

.box:hover {
  scale: 1.1;
  background: var(--soul-orange);
}

.box.dark-mode {
  color: var(--text-white);
}
</style>
