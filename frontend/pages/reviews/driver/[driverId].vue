<template>
    <div class="min-h-screen bg-gray-50">
        <div class="px-4 py-8 mx-auto max-w-4xl sm:px-6">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <NuxtLink to="/reviews" class="text-sm text-blue-600 hover:underline">← รีวิวการเดินทาง</NuxtLink>
            </div>

            <h1 class="text-2xl font-bold text-gray-900">รีวิวคนขับ</h1>
            <p class="mt-1 text-gray-600">{{ driverName || 'กำลังโหลด...' }}</p>

            <div v-if="loading" class="p-6 mt-6 bg-white rounded-xl shadow">กำลังโหลดรีวิว...</div>
            <div v-else-if="!reviews.length" class="p-6 mt-6 bg-white rounded-xl shadow text-gray-500">
                ยังไม่มีรีวิวสำหรับคนขับท่านนี้
            </div>
            <ul v-else class="mt-6 space-y-4">
                <li v-for="r in reviews" :key="r.id" class="p-4 bg-white rounded-xl shadow">
                    <div class="flex items-center justify-between">
                        <div class="flex gap-2 text-yellow-500">
                            <span v-for="i in 5" :key="i">{{ i <= r.rating ? '★' : '☆' }}</span>
                        </div>
                        <span class="text-sm text-gray-500">{{ formatDate(r.createdAt) }}</span>
                    </div>
                    <p v-if="r.comment" class="mt-2 text-gray-700">{{ r.comment }}</p>
                    <p v-if="r.tags?.length" class="mt-1 text-sm text-gray-500">
                        {{ formatTags(r.tags) }}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                        <span v-if="r.isAnonymous">ผู้รีวิว: ไม่แสดงชื่อ</span>
                        <span v-else>ผู้รีวิว: {{ r.passenger?.firstName }} {{ r.passenger?.lastName }}</span>
                    </p>
                </li>
            </ul>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-6">
                <p class="text-sm text-gray-600">หน้า {{ pagination.page }} / {{ pagination.totalPages }}</p>
                <div class="flex gap-2">
                    <NuxtLink v-if="pagination.page > 1"
                        :to="`/reviews/driver/${route.params.driverId}?page=${pagination.page - 1}`"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">ก่อนหน้า</NuxtLink>
                    <NuxtLink v-if="pagination.page < pagination.totalPages"
                        :to="`/reviews/driver/${route.params.driverId}?page=${pagination.page + 1}`"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">ถัดไป</NuxtLink>
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
function formatTags(tags) {
    if (!tags) return ''
    const arr = Array.isArray(tags) ? tags : Object.values(tags)
    return arr.map(t => tagLabels[t] || t).join(', ')
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
        pagination.value = res?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }
        if (reviews.value.length && reviews.value[0]?.driver) {
            const d = reviews.value[0].driver
            driverName.value = `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'คนขับ'
        } else {
            driverName.value = route.query.name ? decodeURIComponent(route.query.name) : 'คนขับ'
        }
    } catch (e) {
        reviews.value = []
        driverName.value = route.query.name ? decodeURIComponent(route.query.name) : 'คนขับ'
    } finally {
        loading.value = false
    }
}

watch(() => [route.params.driverId, route.query.page], fetchReviews, { immediate: true })
</script>
