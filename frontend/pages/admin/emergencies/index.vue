<template>
    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Emergency Requests</h2>
            <p class="mt-2 text-gray-600">จัดการคำขอความช่วยเหลือฉุกเฉินจากคนขับ</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div class="text-sm font-medium text-red-600">Active</div>
                <div class="mt-1 text-2xl font-bold text-red-700">{{ stats.counts?.active || 0 }}</div>
            </div>
            <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div class="text-sm font-medium text-yellow-600">Responding</div>
                <div class="mt-1 text-2xl font-bold text-yellow-700">{{ stats.counts?.responding || 0 }}</div>
            </div>
            <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div class="text-sm font-medium text-green-600">Resolved</div>
                <div class="mt-1 text-2xl font-bold text-green-700">{{ stats.counts?.resolved || 0 }}</div>
            </div>
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div class="text-sm font-medium text-gray-600">Total</div>
                <div class="mt-1 text-2xl font-bold text-gray-700">{{ stats.counts?.total || 0 }}</div>
            </div>
        </div>

        <!-- Recent Active Emergencies Alert -->
        <div v-if="stats.recentEmergencies?.length > 0" class="p-4 mb-8 bg-red-600 rounded-xl">
            <div class="flex items-center gap-3 mb-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-semibold">Active Emergencies Requiring Attention</span>
            </div>
            <div class="space-y-2">
                <div v-for="em in stats.recentEmergencies" :key="em.id"
                    class="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                        <span class="font-medium text-gray-900">{{ em.driver?.firstName || em.driver?.username }}</span>
                        <span class="mx-2 text-gray-400">-</span>
                        <span class="text-sm text-gray-600">{{ getTypeLabel(em.type) }}</span>
                    </div>
                    <button @click="viewEmergency(em)"
                        class="px-3 py-1 text-sm font-medium text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200">
                        View
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Status</label>
                    <select v-model="filters.status"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="RESPONDING">Responding</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Type</label>
                    <select v-model="filters.type"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Types</option>
                        <option value="ACCIDENT">Accident</option>
                        <option value="MEDICAL">Medical</option>
                        <option value="THREAT">Threat</option>
                        <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Search</label>
                    <input v-model="filters.search" type="text" placeholder="ชื่อ, เบอร์โทร, ที่อยู่..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="flex items-end">
                    <button @click="fetchEmergencies"
                        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Search
                    </button>
                </div>
            </div>
        </div>

        <!-- Emergency List -->
        <div class="bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Emergency Requests</h3>
            </div>

            <div v-if="loading" class="p-12 text-center text-gray-500">
                Loading...
            </div>

            <div v-else-if="emergencies.length === 0" class="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500">No emergency requests found</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
                <div v-for="em in emergencies" :key="em.id"
                    class="p-6 transition-colors hover:bg-gray-50 cursor-pointer" @click="viewEmergency(em)">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <img v-if="em.driver?.profilePicture" :src="em.driver.profilePicture"
                                    class="w-12 h-12 rounded-full object-cover" />
                                <div v-else
                                    class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-semibold text-gray-900">
                                        {{ em.driver?.firstName || em.driver?.username }}
                                        {{ em.driver?.lastName || '' }}
                                    </span>
                                    <span :class="getStatusClass(em.status)"
                                        class="px-2 py-0.5 text-xs font-medium rounded-full">
                                        {{ em.status }}
                                    </span>
                                </div>
                                <p class="mt-1 text-sm text-gray-600">
                                    <span class="font-medium">{{ getTypeLabel(em.type) }}</span>
                                    <span v-if="em.description" class="mx-2">-</span>
                                    <span v-if="em.description">{{ em.description }}</span>
                                </p>
                                <p v-if="em.address" class="mt-1 text-xs text-gray-500">
                                    {{ em.address }}
                                </p>
                                <p class="mt-1 text-xs text-gray-400">
                                    {{ formatDate(em.createdAt) }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <a v-if="em.driver?.phoneNumber" :href="`tel:${em.driver.phoneNumber}`"
                                @click.stop
                                class="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </a>
                            <a v-if="em.latitude && em.longitude"
                                :href="`https://www.google.com/maps?q=${em.latitude},${em.longitude}`" target="_blank"
                                @click.stop
                                class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-6 border-t border-gray-200">
                <p class="text-sm text-gray-600">
                    Page {{ pagination.page }} of {{ pagination.totalPages }}
                </p>
                <div class="flex gap-2">
                    <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Previous
                    </button>
                    <button @click="changePage(pagination.page + 1)"
                        :disabled="pagination.page >= pagination.totalPages"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <Teleport to="body">
            <div v-if="selectedEmergency" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div class="w-full max-w-2xl mx-4 overflow-hidden bg-white shadow-2xl rounded-2xl">
                    <!-- Header -->
                    <div class="p-6 text-white" :class="getHeaderClass(selectedEmergency.status)">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold">Emergency Details</h3>
                                <p class="text-sm opacity-90">{{ getTypeLabel(selectedEmergency.type) }}</p>
                            </div>
                            <span class="px-3 py-1 text-sm font-medium text-white bg-white/20 rounded-full">
                                {{ selectedEmergency.status }}
                            </span>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-6 space-y-6 max-h-96 overflow-y-auto">
                        <!-- Driver Info -->
                        <div>
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Driver Information</h4>
                            <div class="flex items-center gap-4">
                                <img v-if="selectedEmergency.driver?.profilePicture"
                                    :src="selectedEmergency.driver.profilePicture"
                                    class="w-16 h-16 rounded-full object-cover" />
                                <div v-else class="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900">
                                        {{ selectedEmergency.driver?.firstName }}
                                        {{ selectedEmergency.driver?.lastName }}
                                    </p>
                                    <p class="text-sm text-gray-600">{{ selectedEmergency.driver?.email }}</p>
                                    <p class="text-sm text-gray-600">{{ selectedEmergency.driver?.phoneNumber }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Location -->
                        <div>
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Location</h4>
                            <p v-if="selectedEmergency.address" class="text-gray-700">{{ selectedEmergency.address }}</p>
                            <p class="text-sm text-gray-500">
                                Lat: {{ selectedEmergency.latitude }}, Lng: {{ selectedEmergency.longitude }}
                            </p>
                            <a :href="`https://www.google.com/maps?q=${selectedEmergency.latitude},${selectedEmergency.longitude}`"
                                target="_blank"
                                class="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open in Google Maps
                            </a>
                        </div>

                        <!-- Description -->
                        <div v-if="selectedEmergency.description">
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Description</h4>
                            <p class="text-gray-700">{{ selectedEmergency.description }}</p>
                        </div>

                        <!-- Admin Notes -->
                        <div v-if="['ACTIVE', 'RESPONDING'].includes(selectedEmergency.status)">
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Admin Notes</h4>
                            <textarea v-model="adminNotes" rows="2"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Add notes..."></textarea>
                        </div>
                        <div v-else-if="selectedEmergency.adminNotes">
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Admin Notes</h4>
                            <p class="text-gray-700">{{ selectedEmergency.adminNotes }}</p>
                        </div>

                        <!-- Timestamps -->
                        <div class="pt-4 border-t border-gray-200">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">Created:</span>
                                    <span class="ml-2 text-gray-700">{{ formatDate(selectedEmergency.createdAt) }}</span>
                                </div>
                                <div v-if="selectedEmergency.respondedAt">
                                    <span class="text-gray-500">Responded:</span>
                                    <span class="ml-2 text-gray-700">{{ formatDate(selectedEmergency.respondedAt) }}</span>
                                </div>
                                <div v-if="selectedEmergency.resolvedAt">
                                    <span class="text-gray-500">Resolved:</span>
                                    <span class="ml-2 text-gray-700">{{ formatDate(selectedEmergency.resolvedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 px-6 pb-6">
                        <button @click="selectedEmergency = null"
                            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Close
                        </button>
                        <button v-if="selectedEmergency.status === 'ACTIVE'" @click="respondEmergency"
                            :disabled="actionLoading"
                            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50">
                            {{ actionLoading ? 'Processing...' : 'Mark as Responding' }}
                        </button>
                        <button v-if="['ACTIVE', 'RESPONDING'].includes(selectedEmergency.status)"
                            @click="resolveEmergency" :disabled="actionLoading"
                            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {{ actionLoading ? 'Processing...' : 'Mark as Resolved' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

const { $api } = useNuxtApp()

const emergencies = ref([])
const stats = ref({})
const loading = ref(true)
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const filters = ref({ status: '', type: '', search: '' })

const selectedEmergency = ref(null)
const adminNotes = ref('')
const actionLoading = ref(false)

const fetchEmergencies = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        if (filters.value.status) params.append('status', filters.value.status)
        if (filters.value.type) params.append('type', filters.value.type)
        if (filters.value.search) params.append('search', filters.value.search)
        params.append('page', pagination.value.page)
        params.append('limit', pagination.value.limit)

        const response = await $api(`/emergency/admin/all?${params.toString()}`)
        emergencies.value = response.data || []
        pagination.value = response.pagination || pagination.value
    } catch (error) {
        console.error('Failed to fetch emergencies:', error)
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const response = await $api('/emergency/admin/stats')
        // Stats endpoint returns data directly (no pagination)
        stats.value = response || {}
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    }
}

const viewEmergency = (em) => {
    selectedEmergency.value = em
    adminNotes.value = em.adminNotes || ''
}

const respondEmergency = async () => {
    actionLoading.value = true
    try {
        await $api(`/emergency/${selectedEmergency.value.id}/respond`, {
            method: 'PATCH',
            body: { adminNotes: adminNotes.value }
        })
        selectedEmergency.value = null
        await Promise.all([fetchEmergencies(), fetchStats()])
    } catch (error) {
        alert(error.data?.message || 'Error')
    } finally {
        actionLoading.value = false
    }
}

const resolveEmergency = async () => {
    actionLoading.value = true
    try {
        await $api(`/emergency/${selectedEmergency.value.id}/resolve`, {
            method: 'PATCH',
            body: { adminNotes: adminNotes.value }
        })
        selectedEmergency.value = null
        await Promise.all([fetchEmergencies(), fetchStats()])
    } catch (error) {
        alert(error.data?.message || 'Error')
    } finally {
        actionLoading.value = false
    }
}

const changePage = (page) => {
    pagination.value.page = page
    fetchEmergencies()
}

const getTypeLabel = (type) => {
    const labels = {
        ACCIDENT: 'Accident',
        MEDICAL: 'Medical Emergency',
        THREAT: 'Threat/Danger',
        VEHICLE_BREAKDOWN: 'Vehicle Breakdown',
        OTHER: 'Other'
    }
    return labels[type] || type
}

const getStatusClass = (status) => {
    const classes = {
        ACTIVE: 'bg-red-100 text-red-700',
        RESPONDING: 'bg-yellow-100 text-yellow-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-gray-100 text-gray-600'
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
}

const getHeaderClass = (status) => {
    const classes = {
        ACTIVE: 'bg-gradient-to-r from-red-600 to-red-700',
        RESPONDING: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        RESOLVED: 'bg-gradient-to-r from-green-500 to-green-600',
        CANCELLED: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return classes[status] || 'bg-gradient-to-r from-gray-500 to-gray-600'
}

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    Promise.all([fetchEmergencies(), fetchStats()])
})

// Auto-refresh every 30 seconds for active emergencies
let refreshInterval
onMounted(() => {
    refreshInterval = setInterval(() => {
        fetchStats()
        if (filters.value.status === '' || filters.value.status === 'ACTIVE') {
            fetchEmergencies()
        }
    }, 30000)
})

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
})
</script>
