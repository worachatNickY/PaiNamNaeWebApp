<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8 bg-gray-50">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProfileSidebar />
                
                <main class="flex-1 p-8">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">รายงานของฉัน</h1>
                            <p class="mt-1 text-gray-600">ดูสถานะรายงานที่คุณส่งไป</p>
                        </div>
                        <NuxtLink to="/report-driver"
                            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            รายงานใหม่
                        </NuxtLink>
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
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p class="text-gray-500">ยังไม่มีรายงาน</p>
                            <NuxtLink to="/report-driver" class="inline-block mt-4 text-sm text-blue-600 hover:underline">
                                ส่งรายงานแรกของคุณ
                            </NuxtLink>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div v-for="report in reports" :key="report.id" class="p-6">
                                <div class="flex items-start gap-4">
                                    <!-- Icon by type - Simple style -->
                                    <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-xl">
                                        <!-- SPEEDING -->
                                        <svg v-if="report.type === 'SPEEDING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                        <!-- RECKLESS_DRIVING -->
                                        <svg v-else-if="report.type === 'RECKLESS_DRIVING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                        <!-- PHONE_WHILE_DRIVING -->
                                        <svg v-else-if="report.type === 'PHONE_WHILE_DRIVING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                        </svg>
                                        <!-- LATE_ARRIVAL -->
                                        <svg v-else-if="report.type === 'LATE_ARRIVAL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <!-- OVERCHARGING -->
                                        <svg v-else-if="report.type === 'OVERCHARGING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <!-- OTHER / Default -->
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <!-- Content -->
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="font-semibold text-gray-900">{{ typeLabels[report.type] || report.type }}</span>
                                            <span :class="getStatusClass(report.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                                                {{ statusLabels[report.status] || report.status }}
                                            </span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">
                                            <span class="font-medium">คนขับ:</span> {{ report.driver?.firstName }} {{ report.driver?.lastName }}
                                        </p>
                                        <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ report.description }}</p>
                                        <p class="mt-2 text-xs text-gray-400">{{ formatDate(report.createdAt) }}</p>
                                        
                                        <!-- Resolution message -->
                                        <div v-if="report.status === 'RESOLVED'" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p class="text-sm text-green-700">
                                                <span class="font-medium">ดำเนินการแล้ว:</span> 
                                                {{ report.resolution || 'ทีมงานได้ตรวจสอบและดำเนินการเรียบร้อยแล้ว' }}
                                            </p>
                                        </div>
                                        <div v-else-if="report.status === 'DISMISSED'" class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p class="text-sm text-gray-600">
                                                รายงานนี้ถูกปิดแล้ว ขอบคุณสำหรับข้อมูล
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
const loading = ref(true)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })

const typeLabels = {
    SPEEDING: 'ขับรถเร็วเกินไป',
    RECKLESS_DRIVING: 'ขับรถประมาท',
    PHONE_WHILE_DRIVING: 'ใช้โทรศัพท์ขณะขับรถ',
    DIRTY_VEHICLE: 'รถไม่สะอาด',
    VEHICLE_MALFUNCTION: 'รถมีปัญหา/ชำรุด',
    BAD_SMELL: 'รถมีกลิ่นไม่พึงประสงค์',
    RUDE_BEHAVIOR: 'พูดจาไม่สุภาพ',
    UNPROFESSIONAL: 'ไม่เป็นมืออาชีพ',
    LATE_ARRIVAL: 'มาสาย',
    WRONG_ROUTE: 'ไม่ตามเส้นทาง',
    UNSAFE_FEELING: 'รู้สึกไม่ปลอดภัย',
    HARASSMENT: 'ถูกคุกคาม',
    INTOXICATED: 'สงสัยว่าเมา',
    OVERCHARGING: 'เรียกเก็บเงินเกิน',
    REFUSED_PAYMENT_METHOD: 'ไม่รับวิธีชำระเงิน',
    NO_SHOW: 'ไม่มารับ',
    OTHER: 'อื่นๆ'
}

const statusLabels = {
    PENDING: 'รอตรวจสอบ',
    REVIEWING: 'กำลังตรวจสอบ',
    RESOLVED: 'ดำเนินการแล้ว',
    DISMISSED: 'ปิดเรื่อง'
}

const fetchReports = async () => {
    loading.value = true
    try {
        const response = await $api(`/reports/my-reports?page=${pagination.value.page}&limit=${pagination.value.limit}`)
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

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(fetchReports)
</script>
