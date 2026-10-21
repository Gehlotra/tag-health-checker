<script setup lang="ts">
import { ref, computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface SiteReport {
  url: string;
  hasGA4: boolean;
  hasGTM: boolean;
  hasConsentBanner: boolean;
  loadTimeMs: number;
}

type Status = "good" | "ok" | "bad";

const STATUS_COLORS: Record<Status, string> = {
  good: "#22a35a",
  ok: "#e0a800",
  bad: "#d93939",
};

const urlInput = ref("");
const report = ref<SiteReport | null>(null);
const history = ref<SiteReport[]>([]);
const errorMessage = ref("");
const loading = ref(false);

async function checkSite() {
  errorMessage.value = "";
  report.value = null;
  loading.value = true;

  try {
    const response = await fetch(
      `http://localhost:3000/api/check?url=${encodeURIComponent(urlInput.value)}`
    );
    const data = await response.json();

    if (!response.ok) {
      errorMessage.value = data.error;
    } else {
      report.value = data;
      history.value.push(data);
    }
  } catch {
    errorMessage.value = "Could not reach the server. Is it running?";
  } finally {
    loading.value = false;
  }
}

function loadTimeStatus(ms: number): Status {
  if (ms < 1000) return "good";
  if (ms < 3000) return "ok";
  return "bad";
}

function shortUrl(url: string): string {
  return url.replace("https://", "").replace("http://", "");
}

const chartData = computed(() => ({
  labels: history.value.map((item) => shortUrl(item.url)),
  datasets: [
    {
      label: "Load time (ms)",
      data: history.value.map((item) => item.loadTimeMs),
      backgroundColor: history.value.map(
        (item) => STATUS_COLORS[loadTimeStatus(item.loadTimeMs)]
      ),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  scales: {
    y: { beginAtZero: true, title: { display: true, text: "Milliseconds" } },
  },
};
</script>

<template>
  <main>
    <h1>Tag Health Checker</h1>

    <form @submit.prevent="checkSite">
      <input v-model="urlInput" placeholder="Type a website, like infotrust.com" />
      <button type="submit" :disabled="loading">
        {{ loading ? "Checking..." : "Check" }}
      </button>
    </form>

    <p v-if="errorMessage">{{ errorMessage }}</p>

    <div v-if="report" class="results">
      <p class="checked-url">Results for {{ report.url }}</p>

      <div class="cards">
        <div class="card" :class="report.hasGA4 ? 'good' : 'bad'">
          <h3>Google Analytics (GA4)</h3>
          <p>{{ report.hasGA4 ? "Found" : "Not found" }}</p>
        </div>

        <div class="card" :class="report.hasGTM ? 'good' : 'bad'">
          <h3>Google Tag Manager</h3>
          <p>{{ report.hasGTM ? "Found" : "Not found" }}</p>
        </div>

        <div class="card" :class="report.hasConsentBanner ? 'good' : 'bad'">
          <h3>Consent Banner</h3>
          <p>{{ report.hasConsentBanner ? "Found" : "Not found" }}</p>
        </div>

        <div class="card" :class="loadTimeStatus(report.loadTimeMs)">
          <h3>Load Time</h3>
          <p>{{ report.loadTimeMs }} ms</p>
        </div>
      </div>
    </div>

    <section v-if="history.length > 0" class="history">
      <h2>Sites checked</h2>

      <div class="chart-box">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <table>
        <thead>
          <tr>
            <th>Website</th>
            <th>GA4</th>
            <th>GTM</th>
            <th>Consent</th>
            <th>Load time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in history" :key="index">
            <td>{{ shortUrl(item.url) }}</td>
            <td>
              <span class="pill" :class="item.hasGA4 ? 'pill-good' : 'pill-bad'">
                {{ item.hasGA4 ? "Found" : "Missing" }}
              </span>
            </td>
            <td>
              <span class="pill" :class="item.hasGTM ? 'pill-good' : 'pill-bad'">
                {{ item.hasGTM ? "Found" : "Missing" }}
              </span>
            </td>
            <td>
              <span class="pill" :class="item.hasConsentBanner ? 'pill-good' : 'pill-bad'">
                {{ item.hasConsentBanner ? "Found" : "Missing" }}
              </span>
            </td>
            <td>{{ item.loadTimeMs }} ms</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
main {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: system-ui, sans-serif;
}

form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:disabled {
  background: #93a5cf;
}

.checked-url {
  color: #555;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
}

.card {
  padding: 16px;
  border-radius: 10px;
  border-left: 6px solid;
}

.card h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.card p {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.good { background: #e8f7ee; border-color: #22a35a; }
.ok   { background: #fff7e0; border-color: #e0a800; }
.bad  { background: #fdeaea; border-color: #d93939; }

.history {
  margin-top: 40px;
}

.chart-box {
  margin-bottom: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
}

th {
  font-size: 14px;
  color: #555;
}

.pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.pill-good {
  background: #e8f7ee;
  color: #1a7f45;
}

.pill-bad {
  background: #fdeaea;
  color: #b42828;
}
</style>