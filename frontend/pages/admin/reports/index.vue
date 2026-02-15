<template>
    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Driver Reports</h2>
            <p class="mt-2 text-gray-600">จัดการรายงานพฤติกรรมคนขับจากผู้โดยสาร</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-5">
            <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div class="text-sm font-medium text-yellow-600">Pending</div>
                <div class="mt-1 text-2xl font-bold text-yellow-700">{{ stats.counts?.pending || 0 }}</div>
            </div>
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="text-sm font-medium text-blue-600">Reviewing</div>
                <div class="mt-1 text-2xl font-bold text-blue-700">{{ stats.counts?.reviewing || 0 }}</div>
            </div>
            <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div class="text-sm font-medium text-green-600">Resolved</div>
                <div class="mt-1 text-2xl font-bold text-green-700">{{ stats.counts?.resolved || 0 }}</div>
            </div>
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div class="text-sm font-medium text-gray-600">Dismissed</div>
                <div class="mt-1 text-2xl font-bold text-gray-700">{{ stats.counts?.dismissed || 0 }}</div>
            </div>
            <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div class="text-sm font-medium text-purple-600">Total</div>
                <div class="mt-1 text-2xl font-bold text-purple-700">{{ stats.counts?.total || 0 }}</div>
            </div>
        </div>

        <!-- Pending Reports Alert -->
        <div v-if="stats.recentReports?.length > 0" class="p-4 mb-8 bg-yellow-500 rounded-xl">
            <div class="flex items-center gap-3 mb-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-semibold">Reports Requiring Attention</span>
            </div>
            <div class="space-y-2">
                <div v-for="report in stats.recentReports" :key="report.id"
                    class="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div class="flex items-center gap-3">
                        <span :class="getSeverityBadge(report.severity)" class="px-2 py-1 text-xs font-medium rounded">
                            {{ report.severity }}
                        </span>
                        <span class="text-gray-900">{{ typeLabels[report.type] || report.type }}</span>
                    </div>
                    <button @click="viewReport(report)"
                        class="px-3 py-1 text-sm font-medium text-yellow-600 transition-colors bg-yellow-100 rounded-lg hover:bg-yellow-200">
                        View
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Status</label>
                    <select v-model="filters.status"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Category</label>
                    <select v-model="filters.category"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Categories</option>
                        <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Severity</label>
                    <select v-model="filters.severity"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Severity</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">Search</label>
                    <input v-model="filters.search" type="text" placeholder="ชื่อคนขับ, ผู้รายงาน..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="flex items-end">
                    <button @click="fetchReports"
                        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Search
                    </button>
                </div>
            </div>
        </div>

        <!-- Reports List -->
        <div class="bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Driver Reports</h3>
            </div>

            <div v-if="loading" class="p-12 text-center text-gray-500">Loading...</div>

            <div v-else-if="reports.length === 0" class="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500">No reports found</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
                <div v-for="report in reports" :key="report.id"
                    class="p-6 transition-colors cursor-pointer hover:bg-gray-50" @click="viewReport(report)">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4">
                            <!-- Category Icon -->
                            <div :class="getSeverityBadgeClass(report.severity)"
                                class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl">
                                <!-- Driving Behavior -->
                                <svg v-if="report.category === 'DRIVING_BEHAVIOR'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <!-- Vehicle Condition -->
                                <svg v-else-if="report.category === 'VEHICLE_CONDITION'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <!-- Service Quality -->
                                <svg v-else-if="report.category === 'SERVICE_QUALITY'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <!-- Safety Concern -->
                                <svg v-else-if="report.category === 'SAFETY_CONCERN'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <!-- Payment Issue -->
                                <svg v-else-if="report.category === 'PAYMENT_ISSUE'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <!-- Other / Default -->
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="font-semibold text-gray-900">{{ typeLabels[report.type] || report.type }}</span>
                                    <span :class="getStatusClass(report.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                                        {{ report.status }}
                                    </span>
                                    <span :class="getSeverityBadge(report.severity)" class="px-2 py-0.5 text-xs font-medium rounded">
                                        {{ report.severity }}
                                    </span>
                                </div>
                                <p class="mt-1 text-sm text-gray-600">
                                    <span class="font-medium">คนขับ:</span> {{ report.driver?.firstName }} {{ report.driver?.lastName }}
                                    <span class="mx-2 text-gray-300">|</span>
                                    <span class="font-medium">ผู้รายงาน:</span> {{ report.reporter?.firstName }} {{ report.reporter?.lastName }}
                                </p>
                                <p class="mt-1 text-sm text-gray-500 line-clamp-1">{{ report.description }}</p>
                                <p class="mt-1 text-xs text-gray-400">{{ formatDate(report.createdAt) }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button v-if="report.driver?.phoneNumber" 
                                @click.stop
                                :href="`tel:${report.driver.phoneNumber}`"
                                class="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-6 border-t border-gray-200">
                <p class="text-sm text-gray-600">Page {{ pagination.page }} of {{ pagination.totalPages }}</p>
                <div class="flex gap-2">
                    <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Previous
                    </button>
                    <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <Teleport to="body">
            <div v-if="selectedReport" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div class="w-full max-w-3xl mx-4 overflow-hidden bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="p-6 text-white" :class="getHeaderClass(selectedReport.severity)">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold">Report Details</h3>
                                <p class="text-sm opacity-90">{{ typeLabels[selectedReport.type] || selectedReport.type }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 text-sm font-medium bg-white/20 rounded-full">
                                    {{ selectedReport.status }}
                                </span>
                                <span class="px-3 py-1 text-sm font-medium bg-white/20 rounded-full">
                                    {{ selectedReport.severity }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-6 space-y-6">
                        <!-- Driver & Reporter Info -->
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div class="p-4 border border-red-200 rounded-xl bg-red-50">
                                <h4 class="mb-3 text-sm font-semibold text-red-600 uppercase">คนขับที่ถูกรายงาน</h4>
                                <div class="flex items-center gap-3">
                                    <img v-if="selectedReport.driver?.profilePicture" :src="selectedReport.driver.profilePicture"
                                        class="object-cover w-12 h-12 rounded-full" />
                                    <div v-else class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900">{{ selectedReport.driver?.firstName }} {{ selectedReport.driver?.lastName }}</p>
                                        <p class="text-sm text-gray-600">{{ selectedReport.driver?.email }}</p>
                                        <p class="text-sm text-gray-600">{{ selectedReport.driver?.phoneNumber }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4 border border-blue-200 rounded-xl bg-blue-50">
                                <h4 class="mb-3 text-sm font-semibold text-blue-600 uppercase">ผู้รายงาน</h4>
                                <div class="flex items-center gap-3">
                                    <img v-if="selectedReport.reporter?.profilePicture" :src="selectedReport.reporter.profilePicture"
                                        class="object-cover w-12 h-12 rounded-full" />
                                    <div v-else class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900">{{ selectedReport.reporter?.firstName }} {{ selectedReport.reporter?.lastName }}</p>
                                        <p class="text-sm text-gray-600">{{ selectedReport.reporter?.email }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Report Info -->
                        <div>
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">รายละเอียดการรายงาน</h4>
                            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p class="text-sm text-gray-500">หมวดหมู่</p>
                                        <p class="font-medium text-gray-900">{{ categoryLabels[selectedReport.category] || selectedReport.category }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">ประเภท</p>
                                        <p class="font-medium text-gray-900">{{ typeLabels[selectedReport.type] || selectedReport.type }}</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">รายละเอียด</p>
                                    <p class="mt-1 text-gray-900 whitespace-pre-wrap">{{ selectedReport.description }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Admin Notes (for editing) -->
                        <div v-if="['PENDING', 'REVIEWING'].includes(selectedReport.status)">
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">Admin Notes</h4>
                            <textarea v-model="adminNotes" rows="3"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                placeholder="บันทึกสิ่งที่ตรวจพบ..."></textarea>
                        </div>

                        <!-- Resolution (for editing) -->
                        <div v-if="['PENDING', 'REVIEWING'].includes(selectedReport.status)">
                            <h4 class="mb-3 text-sm font-semibold text-gray-500 uppercase">การดำเนินการ</h4>
                            <textarea v-model="resolution" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                placeholder="สรุปการดำเนินการ เช่น ตักเตือน, พักการใช้งาน..."></textarea>
                        </div>

                        <!-- Existing Notes (for resolved reports) -->
                        <div v-else>
                            <div v-if="selectedReport.adminNotes" class="mb-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-500 uppercase">Admin Notes</h4>
                                <p class="p-4 text-gray-700 border border-gray-200 rounded-xl bg-gray-50">{{ selectedReport.adminNotes }}</p>
                            </div>
                            <div v-if="selectedReport.resolution">
                                <h4 class="mb-2 text-sm font-semibold text-gray-500 uppercase">Resolution</h4>
                                <p class="p-4 text-gray-700 border border-gray-200 rounded-xl bg-gray-50">{{ selectedReport.resolution }}</p>
                            </div>
                        </div>

                        <!-- Timestamps -->
                        <div class="pt-4 border-t border-gray-200">
                            <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                <div>
                                    <span class="text-gray-500">Created:</span>
                                    <p class="font-medium text-gray-700">{{ formatDate(selectedReport.createdAt) }}</p>
                                </div>
                                <div v-if="selectedReport.reviewedAt">
                                    <span class="text-gray-500">Reviewed:</span>
                                    <p class="font-medium text-gray-700">{{ formatDate(selectedReport.reviewedAt) }}</p>
                                </div>
                                <div v-if="selectedReport.resolvedAt">
                                    <span class="text-gray-500">Resolved:</span>
                                    <p class="font-medium text-gray-700">{{ formatDate(selectedReport.resolvedAt) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-3 px-6 pb-6">
                        <button @click="selectedReport = null"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Close
                        </button>
                        <div class="flex-1"></div>
                        <template v-if="selectedReport.status === 'PENDING'">
                            <button @click="startReviewReport" :disabled="actionLoading"
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {{ actionLoading ? 'Processing...' : 'Start Review' }}
                            </button>
                        </template>
                        <template v-if="['PENDING', 'REVIEWING'].includes(selectedReport.status)">
                            <button @click="dismissReport" :disabled="actionLoading"
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                                Dismiss
                            </button>
                            <button @click="resolveReport" :disabled="actionLoading"
                                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                                {{ actionLoading ? 'Processing...' : 'Resolve' }}
                            </button>
                        </template>
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

const reports = ref([])
const stats = ref({})
const loading = ref(true)
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const filters = ref({ status: '', category: '', severity: '', search: '' })

const selectedReport = ref(null)
const adminNotes = ref('')
const resolution = ref('')
const actionLoading = ref(false)

const categoryLabels = {
    DRIVING_BEHAVIOR: 'พฤติกรรมการขับขี่',
    VEHICLE_CONDITION: 'สภาพรถ',
    SERVICE_QUALITY: 'คุณภาพบริการ',
    SAFETY_CONCERN: 'ความปลอดภัย',
    PAYMENT_ISSUE: 'ปัญหาการเงิน',
    OTHER: 'อื่นๆ'
}

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

const fetchReports = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        if (filters.value.status) params.append('status', filters.value.status)
        if (filters.value.category) params.append('category', filters.value.category)
        if (filters.value.severity) params.append('severity', filters.value.severity)
        if (filters.value.search) params.append('search', filters.value.search)
        params.append('page', pagination.value.page)
        params.append('limit', pagination.value.limit)

        const response = await $api(`/reports/admin/all?${params.toString()}`)
        reports.value = response.data || []
        pagination.value = response.pagination || pagination.value
    } catch (error) {
        console.error('Failed to fetch reports:', error)
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const response = await $api('/reports/admin/stats')
        stats.value = response || {}
    } catch (error) {
        console.error('Failed to fetch stats:', error)
    }
}

const viewReport = (report) => {
    selectedReport.value = report
    adminNotes.value = report.adminNotes || ''
    resolution.value = report.resolution || ''
}

const startReviewReport = async () => {
    actionLoading.value = true
    try {
        await $api(`/reports/${selectedReport.value.id}/review`, { method: 'PATCH' })
        selectedReport.value = null
        await Promise.all([fetchReports(), fetchStats()])
    } catch (error) {
        alert(error.data?.message || 'Error')
    } finally {
        actionLoading.value = false
    }
}

const resolveReport = async () => {
    actionLoading.value = true
    try {
        await $api(`/reports/${selectedReport.value.id}/resolve`, {
            method: 'PATCH',
            body: {
                status: 'RESOLVED',
                adminNotes: adminNotes.value,
                resolution: resolution.value
            }
        })
        selectedReport.value = null
        await Promise.all([fetchReports(), fetchStats()])
    } catch (error) {
        alert(error.data?.message || 'Error')
    } finally {
        actionLoading.value = false
    }
}

const dismissReport = async () => {
    actionLoading.value = true
    try {
        await $api(`/reports/${selectedReport.value.id}/resolve`, {
            method: 'PATCH',
            body: {
                status: 'DISMISSED',
                adminNotes: adminNotes.value,
                resolution: 'Report dismissed - no action required'
            }
        })
        selectedReport.value = null
        await Promise.all([fetchReports(), fetchStats()])
    } catch (error) {
        alert(error.data?.message || 'Error')
    } finally {
        actionLoading.value = false
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

const getSeverityBadge = (severity) => {
    const classes = {
        CRITICAL: 'bg-red-600 text-white',
        HIGH: 'bg-orange-500 text-white',
        MEDIUM: 'bg-yellow-500 text-white',
        LOW: 'bg-gray-400 text-white'
    }
    return classes[severity] || 'bg-gray-400 text-white'
}

const getSeverityBadgeClass = (severity) => {
    const classes = {
        CRITICAL: 'bg-red-100 text-red-600',
        HIGH: 'bg-orange-100 text-orange-600',
        MEDIUM: 'bg-yellow-100 text-yellow-600',
        LOW: 'bg-gray-100 text-gray-600'
    }
    return classes[severity] || 'bg-gray-100 text-gray-600'
}

const getHeaderClass = (severity) => {
    const classes = {
        CRITICAL: 'bg-gradient-to-r from-red-600 to-red-700',
        HIGH: 'bg-gradient-to-r from-orange-500 to-orange-600',
        MEDIUM: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        LOW: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return classes[severity] || 'bg-gradient-to-r from-gray-500 to-gray-600'
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
    Promise.all([fetchReports(), fetchStats()])
})

// Auto-refresh every 60 seconds
let refreshInterval
onMounted(() => {
    refreshInterval = setInterval(() => {
        fetchStats()
        if (!filters.value.status || filters.value.status === 'PENDING') {
            fetchReports()
        }
    }, 60000)
})

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
})
</script>
