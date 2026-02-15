<template>
    <div class="flex min-h-screen bg-gray-100">
        <ProfileSidebar />
        <main class="flex-1 p-8">
            <div class="max-w-4xl mx-auto">
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
                                    <!-- DIRTY_VEHICLE -->
                                    <svg v-else-if="report.type === 'DIRTY_VEHICLE'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    <!-- VEHICLE_MALFUNCTION -->
                                    <svg v-else-if="report.type === 'VEHICLE_MALFUNCTION'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                    </svg>
                                    <!-- BAD_SMELL -->
                                    <svg v-else-if="report.type === 'BAD_SMELL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <!-- RUDE_BEHAVIOR -->
                                    <svg v-else-if="report.type === 'RUDE_BEHAVIOR'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                                    </svg>
                                    <!-- UNPROFESSIONAL -->
                                    <svg v-else-if="report.type === 'UNPROFESSIONAL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                                    </svg>
                                    <!-- LATE_ARRIVAL -->
                                    <svg v-else-if="report.type === 'LATE_ARRIVAL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <!-- WRONG_ROUTE -->
                                    <svg v-else-if="report.type === 'WRONG_ROUTE'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                    </svg>
                                    <!-- UNSAFE_FEELING / HARASSMENT -->
                                    <svg v-else-if="['UNSAFE_FEELING', 'HARASSMENT'].includes(report.type)" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                                    </svg>
                                    <!-- INTOXICATED -->
                                    <svg v-else-if="report.type === 'INTOXICATED'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <!-- OVERCHARGING -->
                                    <svg v-else-if="report.type === 'OVERCHARGING'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <!-- REFUSED_PAYMENT_METHOD -->
                                    <svg v-else-if="report.type === 'REFUSED_PAYMENT_METHOD'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                    <!-- NO_SHOW -->
                                    <svg v-else-if="report.type === 'NO_SHOW'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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
            </div>
        </main>
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
