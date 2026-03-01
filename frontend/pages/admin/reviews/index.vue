<template>
    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Review Management</h2>
            <p class="mt-2 text-gray-600">จัดการและตรวจสอบรีวิวการเดินทางจากผู้โดยสาร</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="text-sm font-medium text-blue-600">Total Reviews</div>
                <div class="mt-1 text-2xl font-bold text-blue-700">{{ pagination.total }}</div>
            </div>
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="text-sm font-medium text-amber-600">Low Rating (1–2★)</div>
                <div class="mt-1 text-2xl font-bold text-amber-700">{{ lowRatingCount }}</div>
            </div>
        </div>

        <!-- Low Rating Alert -->
        <div v-if="lowRatingCount > 0" class="p-4 mb-8 bg-amber-50 border border-amber-200 rounded-xl">
            <div class="flex items-center gap-3 text-amber-800">
                <i class="fas fa-exclamation-triangle text-xl"></i>
                <span class="font-semibold">มีรีวิวคะแนนต่ำที่ควรตรวจสอบ {{ lowRatingCount }} รายการ</span>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Driver ID (กรองตามคนขับ)</label>
                    <input v-model="filters.driverId" type="text" placeholder="เช่น uuid ของ driver"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">แสดงเฉพาะคะแนนต่ำ (1–2 ดาว)</label>
                    <select v-model="filters.lowRatingOnly"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option :value="false">ทั้งหมด</option>
                        <option :value="true">เฉพาะ 1–2 ดาว</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button @click="applyFilters"
                        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        ค้นหา
                    </button>
                </div>
                <div class="flex items-end">
                    <button @click="clearFilters"
                        class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                        ล้างตัวกรอง
                    </button>
                </div>
            </div>
        </div>

        <!-- Reviews Table -->
        <div class="overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                คะแนน
                            </th>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                คนขับ
                            </th>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                ผู้รีวิว
                            </th>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                ความคิดเห็น
                            </th>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                แท็ก
                            </th>
                            <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                วันที่
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-if="loading">
                            <td colspan="6" class="px-4 py-8 text-center text-gray-500">กำลังโหลด...</td>
                        </tr>
                        <tr v-else-if="displayedReviews.length === 0">
                            <td colspan="6" class="px-4 py-8 text-center text-gray-500">ไม่มีรีวิว</td>
                        </tr>
                        <tr v-for="r in displayedReviews" :key="r.id" class="hover:bg-gray-50"
                            :class="{ 'bg-amber-50': r.rating <= 2 }">
                            <td class="px-4 py-3 whitespace-nowrap">
                                <div class="flex gap-1 text-yellow-500">
                                    <span v-for="i in 5" :key="i">{{ i <= r.rating ? '★' : '☆' }}</span>
                                </div>
                                <span class="text-xs text-gray-500">{{ r.rating }}/5</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900">
                                {{ r.driver?.firstName }} {{ r.driver?.lastName }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600">
                                <span v-if="r.isAnonymous">ไม่แสดงชื่อ</span>
                                <span v-else>{{ r.passenger?.firstName }} {{ r.passenger?.lastName }}</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                <span v-if="r.comment">{{ r.comment }}</span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">
                                <span v-if="(r.tags || []).length">{{ formatTags(r.tags) }}</span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {{ formatDate(r.createdAt) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1"
                class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p class="text-sm text-gray-600">
                    แสดง {{ (pagination.page - 1) * pagination.limit + 1 }} -
                    {{ Math.min(pagination.page * pagination.limit, pagination.total) }} จาก {{ pagination.total }} รายการ
                </p>
                <div class="flex gap-2">
                    <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        ก่อนหน้า
                    </button>
                    <span class="px-3 py-1 text-sm">หน้า {{ pagination.page }} / {{ pagination.totalPages }}</span>
                    <button @click="changePage(pagination.page + 1)"
                        :disabled="pagination.page >= pagination.totalPages"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        ถัดไป
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

const { $api } = useNuxtApp()

const reviews = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const filters = ref({ driverId: '', lowRatingOnly: false })

const lowRatingCount = computed(() => reviews.value.filter(r => r.rating <= 2).length)

const displayedReviews = computed(() => {
    if (!filters.value.lowRatingOnly) return reviews.value
    return reviews.value.filter(r => r.rating <= 2)
})

const fetchReviews = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        params.append('page', pagination.value.page)
        params.append('limit', pagination.value.limit)
        if (filters.value.driverId) params.append('driverId', filters.value.driverId)

        const response = await $api(`/reviews?${params.toString()}`)
        reviews.value = response?.data ?? []
        pagination.value = response?.pagination ?? pagination.value
    } catch (error) {
        console.error('Failed to fetch reviews:', error)
        reviews.value = []
    } finally {
        loading.value = false
    }
}

const applyFilters = () => {
    pagination.value.page = 1
    fetchReviews()
}

const clearFilters = () => {
    filters.value = { driverId: '', lowRatingOnly: false }
    pagination.value.page = 1
    fetchReviews()
}

const changePage = (page) => {
    if (page < 1 || page > pagination.value.totalPages) return
    pagination.value.page = page
    fetchReviews()
}

const tagLabels = {
    on_time: 'ตรงเวลา',
    clean: 'รถสะอาด',
    friendly: 'มิตรภาพ',
    safe: 'ขับปลอดภัย',
    comfortable: 'นั่งสบาย'
}
const formatTags = (tags) => {
    if (!tags) return '-'
    const arr = Array.isArray(tags) ? tags : Object.values(tags)
    return arr.map(t => tagLabels[t] || t).join(', ')
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    fetchReviews()
})
</script>
