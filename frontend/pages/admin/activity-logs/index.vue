<template>
    <div>
        <AdminHeader />
        <AdminSidebar />

        <!-- Main Content -->
        <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
            <div class="mx-auto max-w-8xl">
                <!-- Title + Stats -->
                <div class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-semibold text-gray-800">Activity Logs</h1>
                        <span class="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            {{ pagination.total }} รายการ
                        </span>
                    </div>

                    <!-- Quick Search -->
                    <div class="flex items-center gap-2">
                        <input v-model.trim="filters.search" @keyup.enter="applyFilters" type="text"
                            placeholder="ค้นหา : Email / IP / Description"
                            class="max-w-full px-3 py-2 border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="applyFilters"
                            class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                            ค้นหา
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Total Logs</div>
                        <div class="text-2xl font-bold text-gray-800">{{ stats.totalLogs || 0 }}</div>
                    </div>
                    <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Pending Deletion</div>
                        <div class="text-2xl font-bold text-amber-600">{{ stats.pendingDeletion || 0 }}</div>
                    </div>
                    <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Delete Requests (7d)</div>
                        <div class="text-2xl font-bold text-red-600">{{ getActivityCount('ACCOUNT_DELETE_REQUEST') }}</div>
                    </div>
                    <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Logins (7d)</div>
                        <div class="text-2xl font-bold text-green-600">{{ getActivityCount('LOGIN') }}</div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
                        <!-- Activity Type -->
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">ประเภท Activity</label>
                            <select v-model="filters.activityType"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">ทั้งหมด</option>
                                <option v-for="type in activityTypes" :key="type.value" :value="type.value">
                                    {{ type.label }}
                                </option>
                            </select>
                        </div>

                        <!-- User Email -->
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">Email</label>
                            <input v-model="filters.userEmail" type="text" placeholder="กรอก email"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- Start Date -->
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">จากวันที่</label>
                            <input v-model="filters.startDate" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- End Date -->
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">ถึงวันที่</label>
                            <input v-model="filters.endDate" type="date"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                        </div>

                        <!-- Actions -->
                        <div class="flex items-end gap-2">
                            <button @click="clearFilters"
                                class="px-3 py-2 text-gray-700 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                ล้าง
                            </button>
                            <button @click="applyFilters"
                                class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                                กรอง
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-hidden bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        เวลา
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        ประเภท
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        รายละเอียด
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        IP Address
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Device
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-if="isLoading">
                                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                                        กำลังโหลด...
                                    </td>
                                </tr>
                                <tr v-else-if="logs.length === 0">
                                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                                <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                        {{ formatDateTime(log.createdAt) }}
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <span :class="getActivityBadgeClass(log.activityType)"
                                            class="px-2 py-1 text-xs font-medium rounded-full">
                                            {{ getActivityLabel(log.activityType) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-900">
                                        {{ log.userEmail || '-' }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                        {{ log.description || '-' }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                        {{ log.ipAddress || '-' }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" :title="log.userAgent">
                                        {{ truncateUserAgent(log.userAgent) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
                        <div class="text-sm text-gray-500">
                            แสดง {{ (pagination.page - 1) * pagination.limit + 1 }} - 
                            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
                            จาก {{ pagination.total }} รายการ
                        </div>
                        <div class="flex gap-2">
                            <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
                                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                                ก่อนหน้า
                            </button>
                            <span class="px-3 py-1 text-sm">
                                หน้า {{ pagination.page }} / {{ pagination.totalPages }}
                            </span>
                            <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages"
                                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                                ถัดไป
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

definePageMeta({
    middleware: 'auth',
    layout: false
})

const config = useRuntimeConfig()

// State
const logs = ref([])
const stats = ref({})
const activityTypes = ref([])
const isLoading = ref(false)
const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
})

const filters = ref({
    search: '',
    activityType: '',
    userEmail: '',
    startDate: '',
    endDate: ''
})

// Fetch data
const fetchLogs = async () => {
    isLoading.value = true
    try {
        const token = useCookie('token').value
        const params = new URLSearchParams({
            page: pagination.value.page.toString(),
            limit: pagination.value.limit.toString()
        })

        if (filters.value.search) params.append('search', filters.value.search)
        if (filters.value.activityType) params.append('activityType', filters.value.activityType)
        if (filters.value.userEmail) params.append('userEmail', filters.value.userEmail)
        if (filters.value.startDate) params.append('startDate', filters.value.startDate)
        if (filters.value.endDate) params.append('endDate', filters.value.endDate)

        const response = await $fetch(`${config.public.apiBase}activity-logs/admin?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        logs.value = response.data
        pagination.value = response.pagination
    } catch (error) {
        console.error('Failed to fetch logs:', error)
    } finally {
        isLoading.value = false
    }
}

const fetchStats = async () => {
    try {
        const token = useCookie('token').value
        const response = await $fetch(`${config.public.apiBase}activity-logs/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        stats.value = response.data
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    }
}

const fetchActivityTypes = async () => {
    try {
        const token = useCookie('token').value
        const response = await $fetch(`${config.public.apiBase}activity-logs/admin/activity-types`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        activityTypes.value = response.data
    } catch (error) {
        console.error('Failed to fetch activity types:', error)
    }
}

// Helpers
const formatDateTime = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss')
}

const getActivityLabel = (type) => {
    const found = activityTypes.value.find(t => t.value === type)
    return found ? found.label : type
}

const getActivityBadgeClass = (type) => {
    const classes = {
        LOGIN: 'bg-green-100 text-green-800',
        LOGOUT: 'bg-gray-100 text-gray-800',
        REGISTER: 'bg-blue-100 text-blue-800',
        ACCOUNT_DELETE_REQUEST: 'bg-red-100 text-red-800',
        ACCOUNT_DELETE_CONFIRM: 'bg-red-200 text-red-900',
        ACCOUNT_DELETE_CANCEL: 'bg-amber-100 text-amber-800',
        BOOKING_CREATE: 'bg-purple-100 text-purple-800',
        BOOKING_CANCEL: 'bg-orange-100 text-orange-800',
        EMERGENCY_REQUEST: 'bg-red-200 text-red-900',
    }
    return classes[type] || 'bg-gray-100 text-gray-800'
}

const getActivityCount = (type) => {
    if (!stats.value.activityCounts) return 0
    const found = stats.value.activityCounts.find(a => a.type === type)
    return found ? found.count : 0
}

const truncateUserAgent = (ua) => {
    if (!ua) return '-'
    if (ua.length > 50) return ua.substring(0, 50) + '...'
    return ua
}

// Actions
const applyFilters = () => {
    pagination.value.page = 1
    fetchLogs()
}

const clearFilters = () => {
    filters.value = {
        search: '',
        activityType: '',
        userEmail: '',
        startDate: '',
        endDate: ''
    }
    pagination.value.page = 1
    fetchLogs()
}

const goToPage = (page) => {
    if (page < 1 || page > pagination.value.totalPages) return
    pagination.value.page = page
    fetchLogs()
}

// Init
onMounted(() => {
    fetchLogs()
    fetchStats()
    fetchActivityTypes()
})
</script>

<style scoped>
.main-content {
    min-height: calc(100vh - 4rem);
}
</style>
