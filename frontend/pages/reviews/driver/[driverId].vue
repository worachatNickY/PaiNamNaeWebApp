<template>
  <div class="min-h-screen pb-12 bg-gray-50 text-gray-800">
    <div class="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8 md:py-12">
      <div class="mb-5">
        <NuxtLink
          to="/reviews"
          class="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 group"
        >
          <svg
            class="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          กลับหน้ารวมรีวิว
        </NuxtLink>
      </div>

      <div class="p-6 mb-6 bg-white rounded-lg shadow-md section-card">
        <div class="flex items-center mb-1">
          <div
            class="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shrink-0"
          >
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 sm:text-2xl">
              คะแนนและรีวิว
            </h1>
            <p class="text-base font-medium text-blue-600">
              {{ driverName || 'กำลังโหลด...' }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="p-10 text-center text-gray-500 bg-white rounded-lg shadow-md animate-pulse border border-gray-100"
      >
        <div class="inline-block p-3 mb-3 bg-gray-50 rounded-full">
          <svg
            class="w-6 h-6 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p class="text-base">กำลังโหลดข้อมูลรีวิว...</p>
      </div>

      <div
        v-else-if="!reviews.length"
        class="p-10 text-center text-gray-500 bg-white border border-gray-100 rounded-lg shadow-md"
      >
        <div
          class="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gray-50 rounded-full"
        >
          <svg
            class="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 class="mb-1 text-base font-medium text-gray-900">
          ยังไม่มีรีวิว
        </h3>
        <p class="text-sm text-gray-500">
          ยังไม่มีผู้โดยสารรีวิวให้กับคนขับท่านนี้
        </p>
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="r in reviews"
          :key="r.id"
          class="p-5 transition-all bg-white border border-gray-100 rounded-xl shadow-md section-card flex flex-col"
        >
          <div
            class="flex items-start justify-between mb-3 pb-3 border-b border-gray-50"
          >
            <div class="flex gap-1 text-amber-400">
              <svg
                v-for="i in 5"
                :key="i"
                class="w-4 h-4 sm:w-5 sm:h-5"
                :class="i <= r.rating ? 'fill-current' : 'text-gray-200'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <span
              class="px-2 py-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full"
            >
              {{ formatDate(r.createdAt) }}
            </span>
          </div>

          <p
            v-if="r.comment"
            class="mb-4 text-gray-700 italic text-sm leading-relaxed"
          >
            "{{ r.comment }}"
          </p>

          <div v-if="getTagsArray(r.tags).length" class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="(tag, index) in getTagsArray(r.tags)"
              :key="index"
              class="inline-flex items-center px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
            >
              <svg
                class="w-2.5 h-2.5 mr-1 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ tag }}
            </span>
          </div>

          <div class="mt-auto pt-2 border-t border-gray-50">
            <p class="flex items-center text-xs text-gray-500">
              <svg
                class="w-3.5 h-3.5 mr-1.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span v-if="r.isAnonymous">
                ผู้รีวิว:
                <span class="text-gray-400 italic">ไม่ประสงค์ออกนาม</span>
              </span>
              <span v-else>
                ผู้รีวิว:
                <span class="font-medium text-gray-700">
                  {{ r.passenger?.firstName }} {{ r.passenger?.lastName }}
                </span>
              </span>
            </p>
          </div>
        </li>
      </ul>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between p-4 mt-6 bg-white border border-gray-100 rounded-xl shadow-sm"
      >
        <p class="text-xs font-medium text-gray-600">
          หน้า
          <span class="px-2 py-0.5 mx-1 text-blue-700 bg-blue-50 rounded-md">
            {{ pagination.page }}
          </span>
          จาก {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <NuxtLink
            v-if="pagination.page > 1"
            :to="`/reviews/driver/${route.params.driverId}?page=${pagination.page - 1}`"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 focus:ring-4 focus:ring-gray-100"
          >
            <svg
              class="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            ก่อนหน้า
          </NuxtLink>
          <NuxtLink
            v-if="pagination.page < pagination.totalPages"
            :to="`/reviews/driver/${route.params.driverId}?page=${pagination.page + 1}`"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 focus:ring-4 focus:ring-gray-100"
          >
            ถัดไป
            <svg
              class="w-3 h-3 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const route = useRoute()
const { $api } = useNuxtApp()

const reviews = ref([])
const driverName = ref('')
const loading = ref(true)
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })

const tagLabels = {
  on_time: 'ตรงเวลา',
  clean: 'รถสะอาด',
  friendly: 'มิตรภาพ',
  safe: 'ขับปลอดภัย',
  comfortable: 'นั่งสบาย'
}

function getTagsArray(tags) {
  if (!tags) return []
  const arr = Array.isArray(tags) ? tags : Object.values(tags)
  return arr.map((t) => tagLabels[t] || t)
}

function formatDate(d) {
  return d ? dayjs(d).format('D MMM BBBB') : '-'
}

async function fetchReviews() {
  const driverId = route.params.driverId
  if (!driverId) return
  loading.value = true
  try {
    const page = Number(route.query.page) || 1
    const res = await $api(`/reviews/driver/${driverId}?page=${page}&limit=20`)
    reviews.value = res?.data ?? []
    pagination.value = res?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }

    if (reviews.value.length && reviews.value[0]?.driver) {
      const d = reviews.value[0].driver
      driverName.value =
        `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'คนขับ'
    } else {
      driverName.value =
        route.query.name ? decodeURIComponent(route.query.name) : 'คนขับ'
    }
  } catch (e) {
    reviews.value = []
    driverName.value =
      route.query.name ? decodeURIComponent(route.query.name) : 'คนขับ'
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.driverId, route.query.page],
  fetchReviews,
  { immediate: true }
)
</script>

<style scoped>
.section-card {
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.12);
}
</style>