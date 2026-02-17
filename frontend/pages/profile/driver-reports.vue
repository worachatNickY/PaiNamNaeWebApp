<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8 bg-gray-50">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProfileSidebar />
                
                <main class="flex-1 p-8">
                    <!-- Header -->
                    <div class="mb-8">
                        <h1 class="text-2xl font-bold text-gray-900">รายงานเกี่ยวกับฉัน</h1>
                        <p class="mt-1 text-gray-600">ดูรายงานที่ผู้โดยสารส่งมาเกี่ยวกับการให้บริการของคุณ</p>
                    </div>

                    <!-- Stats Cards -->
                    <div v-if="stats" class="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                        <div class="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
                            <p class="text-sm text-gray-500">รายงานทั้งหมด</p>
                        </div>
                        <div class="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <p class="text-2xl font-bold text-yellow-600">{{ stats.byStatus?.PENDING || 0 }}</p>
                            <p class="text-sm text-gray-500">รอตรวจสอบ</p>
                        </div>
                        <div class="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <p class="text-2xl font-bold text-green-600">{{ stats.byStatus?.RESOLVED || 0 }}</p>
                            <p class="text-sm text-gray-500">ดำเนินการแล้ว</p>
                        </div>
                        <div class="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <p class="text-2xl font-bold text-gray-600">{{ stats.byStatus?.DISMISSED || 0 }}</p>
                            <p class="text-sm text-gray-500">ปิดเรื่อง</p>
                        </div>
                    </div>

                    <!-- Notice -->
                    <div class="p-4 mb-6 border border-blue-200 bg-blue-50 rounded-xl">
                        <div class="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="text-sm text-blue-800">
                                    รายงานเหล่านี้ถูกส่งโดยผู้โดยสารเพื่อช่วยปรับปรุงคุณภาพบริการ 
                                    ข้อมูลผู้รายงานจะถูกเก็บเป็นความลับเพื่อความเป็นส่วนตัว
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Reports List -->
                    <div class="bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div v-if="loading" class="p-12 text-center text-gray-500">
                            <svg class="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            กำลังโหลด...
                        </div>

                        <div v-else-if="reports.length === 0" class="p-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-lg font-medium text-gray-700">ยอดเยี่ยม!</p>
                            <p class="mt-1 text-gray-500">ยังไม่มีรายงานใดๆ เกี่ยวกับคุณ</p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div v-for="report in reports" :key="report.id" class="p-6">
                                <div class="flex items-start gap-4">
                                    <!-- Icon by type -->
                                    <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 border-2 border-gray-200 rounded-xl">
                                        <svg v-if="report.type === 'SPEEDING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                        <svg v-else-if="report.type === 'RECKLESS_DRIVING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                        <svg v-else-if="report.type === 'LATE_ARRIVAL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <!-- Content -->
                                    <div class="flex-1">
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span class="font-semibold text-gray-900">{{ report.typeLabel || report.type }}</span>
                                            <span :class="getStatusClass(report.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                                                {{ statusLabels[report.status] || report.status }}
                                            </span>
                                            <span :class="getSeverityClass(report.severity)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                                                {{ severityLabels[report.severity] || report.severity }}
                                            </span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">
                                            <span class="font-medium">หมวดหมู่:</span> {{ report.categoryLabel || report.category }}
                                        </p>
                                        <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ report.description }}</p>
                                        <p class="mt-2 text-xs text-gray-400">{{ formatDate(report.createdAt) }}</p>
                                        
                                        <!-- Resolution message -->
                                        <div v-if="report.status === 'RESOLVED'" class="p-3 mt-3 border border-green-200 bg-green-50 rounded-lg">
                                            <p class="text-sm text-green-700">
                                                <span class="font-medium">ผลการตรวจสอบ:</span> 
                                                {{ report.resolution || 'ทีมงานได้ตรวจสอบและดำเนินการเรียบร้อยแล้ว' }}
                                            </p>
                                        </div>
                                        <div v-else-if="report.status === 'DISMISSED'" class="p-3 mt-3 border border-gray-200 bg-gray-50 rounded-lg">
                                            <p class="text-sm text-gray-600">
                                                รายงานนี้ถูกตรวจสอบและปิดแล้ว ไม่มีการดำเนินการเพิ่มเติม
                                            </p>
                                        </div>
                                        <div v-else-if="report.status === 'PENDING'" class="p-3 mt-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                                            <p class="text-sm text-yellow-700">
                                                รายงานนี้อยู่ระหว่างรอการตรวจสอบจากทีมงาน
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-4 border-t border-gray-200">
                            <p class="text-sm text-gray-600">หน้า {{ pagination.page }} จาก {{ pagination.totalPages }}</p>
                            <div class="flex gap-2">
                                <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    ก่อนหน้า
                                </button>
                                <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages"
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})

const { $api } = useNuxtApp()

const reports = ref([])
const stats = ref(null)
const loading = ref(true)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })

const statusLabels = {
    PENDING: 'รอตรวจสอบ',
    REVIEWING: 'กำลังตรวจสอบ',
    RESOLVED: 'ดำเนินการแล้ว',
    DISMISSED: 'ปิดเรื่อง'
}

const severityLabels = {
    LOW: 'เล็กน้อย',
    MEDIUM: 'ปานกลาง',
    HIGH: 'สูง',
    CRITICAL: 'ร้ายแรง'
}

const fetchReports = async () => {
    loading.value = true
    try {
        const response = await $api(`/reports/against-me?page=${pagination.value.page}&limit=${pagination.value.limit}`)
        reports.value = response.data || response || []
        if (response.pagination) {
            pagination.value = response.pagination
        }
    } catch (error) {
        console.error('Failed to fetch reports:', error)
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const response = await $api('/reports/my-stats')
        stats.value = response.data || response
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    }
}

const changePage = (page) => {
    pagination.value.page = page
    fetchReports()
}

const getStatusClass = (status) => {
    const classes = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        REVIEWING: 'bg-blue-100 text-blue-700',
        RESOLVED: 'bg-green-100 text-green-700',
        DISMISSED: 'bg-gray-100 text-gray-600'
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
}

const getSeverityClass = (severity) => {
    const classes = {
        LOW: 'bg-blue-100 text-blue-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        HIGH: 'bg-orange-100 text-orange-700',
        CRITICAL: 'bg-red-100 text-red-700'
    }
    return classes[severity] || 'bg-gray-100 text-gray-600'
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
    fetchReports()
    fetchStats()
})
</script>
