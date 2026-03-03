<template>
    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Driver Incident Cases</h2>
            <p class="mt-2 text-gray-600">
                ศูนย์กลางจัดการรายงานเหตุ / ปัญหาระหว่างการเดินทางจากผู้ขับขี่ และติดตามความคืบหน้าของแต่ละเคส
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-5">
            <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div class="text-sm font-medium text-red-600">Active</div>
                <div class="mt-1 text-2xl font-bold text-red-700">{{ stats.counts?.active || 0 }}</div>
            </div>
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="text-sm font-medium text-amber-600">Responding</div>
                <div class="mt-1 text-2xl font-bold text-amber-700">{{ stats.counts?.responding || 0 }}</div>
            </div>
            <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div class="text-sm font-medium text-green-600">Resolved</div>
                <div class="mt-1 text-2xl font-bold text-green-700">{{ stats.counts?.resolved || 0 }}</div>
            </div>
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div class="text-sm font-medium text-gray-600">Cancelled</div>
                <div class="mt-1 text-2xl font-bold text-gray-700">{{ stats.counts?.cancelled || 0 }}</div>
            </div>
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="text-sm font-medium text-blue-600">Total</div>
                <div class="mt-1 text-2xl font-bold text-blue-700">{{ stats.counts?.total || 0 }}</div>
            </div>
        </div>

        <!-- Alert for incidents that still need attention -->
        <div v-if="stats.recentEmergencies?.length" class="p-4 mb-8 bg-red-600 rounded-xl">
            <div class="flex items-center gap-3 mb-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-semibold">เคสที่ยังเปิดอยู่ – ควรติดตามและประสานงานด่วน</span>
            </div>
            <div class="space-y-2">
                <div v-for="item in stats.recentEmergencies" :key="item.id"
                    class="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                        <p class="text-sm font-medium text-gray-900">
                            {{ typeLabels[item.type] || item.type }}
                        </p>
                        <p class="text-xs text-gray-500">
                            {{ item.driver?.firstName || item.driver?.username }} ·
                            {{ formatDateTime(item.createdAt) }}
                        </p>
                    </div>
                    <button @click="viewEmergency(item)"
                        class="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200">
                        View
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">สถานะเคส</label>
                    <select v-model="filters.status"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">ทุกสถานะ</option>
                        <option value="ACTIVE">Active</option>
                        <option value="RESPONDING">Responding</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label class="block mb-1 text-sm font-medium text-gray-700">ประเภทเหตุ / ปัญหา</label>
                    <select v-model="filters.type"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">ทุกประเภท</option>
                        <option v-for="(label, key) in typeLabels" :key="key" :value="key">
                            {{ label }}
                        </option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block mb-1 text-sm font-medium text-gray-700">ค้นหาเคส</label>
                    <input v-model="filters.search" type="text"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ชื่อคนขับ, username, เบอร์โทร, ที่อยู่ หรือคำอธิบายเหตุ..." />
                </div>
                <div class="flex items-end">
                    <button @click="fetchEmergencies"
                        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>

        <!-- List -->
        <div class="bg-white border border-gray-300 rounded-lg shadow-md">
            <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">รายการรายงานเหตุจากผู้ขับขี่</h3>
            </div>

            <div v-if="loading" class="p-12 text-center text-gray-500">Loading...</div>

            <div v-else-if="emergencies.length === 0" class="p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 11-9 9 9 9 0 019-9z" />
                </svg>
                <p class="text-gray-500">ยังไม่มีรายงานเหตุจากผู้ขับขี่</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
                <div v-for="item in emergencies" :key="item.id"
                    class="p-6 transition-colors cursor-pointer hover:bg-gray-50"
                    @click="viewEmergency(item)">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4">
                            <!-- Icon -->
                            <div
                                class="flex items-center justify-center flex-shrink-0 w-12 h-12 border-2 border-gray-200 rounded-xl">
                                <svg v-if="item.type === 'ACCIDENT'" xmlns="http://www.w3.org/2000/svg"
                                    class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <svg v-else-if="item.type === 'MEDICAL'" xmlns="http://www.w3.org/2000/svg"
                                    class="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <svg v-else-if="item.type === 'THREAT'" xmlns="http://www.w3.org/2000/svg"
                                    class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 9v3.75m0 3.75h.008v.008H12V16.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <svg v-else-if="item.type === 'VEHICLE_BREAKDOWN'"
                                    xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 9v3.75m0 3.75h.008v.008H12V16.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <!-- Content -->
                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="font-semibold text-gray-900">
                                        {{ typeLabels[item.type] || item.type }}
                                    </span>
                                    <span :class="getStatusClass(item.status)"
                                        class="px-2 py-0.5 text-xs font-medium rounded-full">
                                        {{ statusLabels[item.status] || item.status }}
                                    </span>
                                </div>
                                <p class="mt-1 text-sm text-gray-600">
                                    <span class="font-medium">คนขับ:</span>
                                    {{ item.driver?.firstName }} {{ item.driver?.lastName }}
                                    <span v-if="item.driver?.phoneNumber" class="mx-2 text-gray-300">|</span>
                                    <span v-if="item.driver?.phoneNumber" class="text-gray-600">
                                        {{ item.driver.phoneNumber }}
                                    </span>
                                </p>
                                <p class="mt-1 text-sm text-gray-500 line-clamp-1">
                                    {{ item.address || 'ไม่มีที่อยู่ (ใช้พิกัดเท่านั้น)' }}
                                </p>
                                <p class="mt-1 text-xs text-gray-400">
                                    {{ formatDateTime(item.createdAt) }}
                                </p>
                            </div>
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

        <!-- Detail / Action Modal -->
        <Teleport to="body">
            <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div
                    class="w-full max-w-3xl mx-4 overflow-hidden bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="p-6 text-white" :class="getHeaderClass(selected.status)">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold">Emergency Details</h3>
                                <p class="text-sm opacity-90">
                                    {{ typeLabels[selected.type] || selected.type }}
                                </p>
                            </div>
                            <div class="flex flex-col items-end gap-1 text-xs">
                                <span class="px-3 py-1 font-medium bg-white/20 rounded-full">
                                    {{ statusLabels[selected.status] || selected.status }}
                                </span>
                                <span class="opacity-80">
                                    Created: {{ formatDateTime(selected.createdAt) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-6 space-y-6">
                        <!-- Driver info -->
                        <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">ข้อมูลคนขับ</h4>
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                                    <span class="text-sm font-semibold">
                                        {{ (selected.driver?.firstName || '?').charAt(0) }}
                                    </span>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900">
                                        {{ selected.driver?.firstName }} {{ selected.driver?.lastName }}
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        {{ selected.driver?.username }}
                                    </p>
                                    <p v-if="selected.driver?.phoneNumber" class="text-sm text-gray-600">
                                        {{ selected.driver.phoneNumber }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Location & time -->
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">ตำแหน่ง / สถานที่เกิดเหตุ</h4>
                                <p class="text-sm text-gray-700">
                                    {{ selected.address || 'ไม่มีข้อมูลที่อยู่' }}
                                </p>
                                <p class="mt-1 text-xs text-gray-500">
                                    Lat: {{ selected.latitude.toFixed(6) }},
                                    Lng: {{ selected.longitude.toFixed(6) }}
                                </p>
                                <a v-if="selected.latitude && selected.longitude"
                                   :href="`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`"
                                   target="_blank"
                                   class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:underline">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                              d="M12 2a7 7 0 00-7 7c0 4.418 7 13 7 13s7-8.582 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                                    </svg>
                                    เปิดใน Google Maps
                                </a>
                            </div>
                            <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">ลำดับเหตุการณ์</h4>
                                <ul class="space-y-1 text-xs text-gray-600">
                                    <li>สร้างเคสรายงานเหตุ: {{ formatDateTime(selected.createdAt) }}</li>
                                    <li v-if="selected.respondedAt">
                                        ทีมงานรับเรื่องแล้ว: {{ formatDateTime(selected.respondedAt) }}
                                    </li>
                                    <li v-if="selected.resolvedAt">
                                        ปิดเคสแล้ว: {{ formatDateTime(selected.resolvedAt) }}
                                    </li>
                                    <li v-if="selected.cancelledAt">
                                        คนขับยกเลิก: {{ formatDateTime(selected.cancelledAt) }}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">รายละเอียดจากคนขับ</h4>
                            <p class="text-sm text-gray-700 whitespace-pre-wrap">
                                {{ selected.description || '—' }}
                            </p>
                        </div>

                        <!-- Attachments -->
                        <div v-if="Array.isArray(selected.attachments) && selected.attachments.length"
                             class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">ไฟล์แนบ</h4>
                            <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                                <div v-for="(att, idx) in selected.attachments" :key="idx"
                                     class="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                    <a :href="att.url" target="_blank" class="block">
                                        <img v-if="isImage(att.type)" :src="att.url" alt="attachment"
                                             class="object-cover w-full h-28">
                                        <div v-else-if="isVideo(att.type)"
                                             class="flex flex-col items-center justify-center w-full h-28 text-xs text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-500"
                                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-3 4H6a2 2 0 01-2-2V8a2 2 0 012-2h6a2 2 0 012 2v8z"/>
                                            </svg>
                                            <span>วิดีโอ - กดเพื่อเปิดดู</span>
                                        </div>
                                        <div v-else
                                             class="flex items-center justify-center w-full h-28 text-xs text-gray-600">
                                            ไฟล์แนบอื่น ๆ
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Admin notes -->
                        <div class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <h4 class="mb-2 text-sm font-semibold text-gray-700 uppercase">หมายเหตุจากทีมงาน</h4>
                            <textarea v-model="adminNotes" rows="3"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                placeholder="สรุปการดำเนินการ หรือข้อมูลสำคัญที่ต้องแจ้งคนขับ..."></textarea>
                            <p v-if="selected.adminNotes" class="mt-2 text-xs text-gray-500">
                                หมายเหตุเดิม: {{ selected.adminNotes }}
                            </p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button @click="selected = null"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                            ปิด
                        </button>
                        <div class="flex-1"></div>
                        <button
                            v-if="selected.status === 'ACTIVE'"
                            @click="respond"
                            :disabled="actionLoading"
                            class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50">
                            {{ actionLoading ? 'กำลังอัปเดต...' : 'รับเรื่องแล้ว (Responding)' }}
                        </button>
                        <button
                            v-if="selected.status === 'ACTIVE' || selected.status === 'RESPONDING'"
                            @click="resolve"
                            :disabled="actionLoading"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {{ actionLoading ? 'กำลังอัปเดต...' : 'ปิดเหตุฉุกเฉิน (Resolved)' }}
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
const { toast } = useToast()

const emergencies = ref([])
const stats = ref({ counts: {}, recentEmergencies: [] })
const loading = ref(true)
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const filters = ref({ status: '', type: '', search: '' })

const selected = ref(null)
const adminNotes = ref('')
const actionLoading = ref(false)

const typeLabels = {
    ACCIDENT: 'อุบัติเหตุ',
    MEDICAL: 'เจ็บป่วย',
    THREAT: 'ถูกคุกคาม',
    VEHICLE_BREAKDOWN: 'รถเสีย',
    OTHER: 'อื่นๆ'
}

const statusLabels = {
    ACTIVE: 'กำลังดำเนินการ',
    RESPONDING: 'ทีมงานตอบรับแล้ว',
    RESOLVED: 'ปิดเหตุฉุกเฉินแล้ว',
    CANCELLED: 'ยกเลิก'
}

const fetchStats = async () => {
    try {
        const res = await $api('/emergency/admin/stats')
        stats.value = res?.data || res || { counts: {}, recentEmergencies: [] }
    } catch (e) {
        console.error('Failed to fetch emergency stats', e)
    }
}

const fetchEmergencies = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        params.append('page', pagination.value.page)
        params.append('limit', pagination.value.limit)
        if (filters.value.status) params.append('status', filters.value.status)
        if (filters.value.type) params.append('type', filters.value.type)
        if (filters.value.search) params.append('search', filters.value.search)

        const res = await $api(`/emergency/admin/all?${params.toString()}`)
        emergencies.value = res?.data || res || []
        if (res?.pagination) {
            pagination.value = res.pagination
        }
    } catch (e) {
        console.error('Failed to fetch emergencies', e)
        emergencies.value = []
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (page < 1 || page > pagination.value.totalPages) return
    pagination.value.page = page
    fetchEmergencies()
}

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const isImage = (mime) => typeof mime === 'string' && mime.startsWith('image/')
const isVideo = (mime) => typeof mime === 'string' && mime.startsWith('video/')

const getStatusClass = (status) => {
    const map = {
        ACTIVE: 'bg-red-100 text-red-700',
        RESPONDING: 'bg-amber-100 text-amber-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-gray-100 text-gray-600'
    }
    return map[status] || 'bg-gray-100 text-gray-600'
}

const getHeaderClass = (status) => {
    const map = {
        ACTIVE: 'bg-gradient-to-r from-red-600 to-red-700',
        RESPONDING: 'bg-gradient-to-r from-amber-500 to-amber-600',
        RESOLVED: 'bg-gradient-to-r from-green-600 to-green-700',
        CANCELLED: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return map[status] || 'bg-gradient-to-r from-gray-500 to-gray-600'
}

const viewEmergency = (item) => {
    selected.value = item
    adminNotes.value = item.adminNotes || ''
}

const respond = async () => {
    if (!selected.value) return
    actionLoading.value = true
    try {
        await $api(`/emergency/${selected.value.id}/respond`, {
            method: 'PATCH',
            body: { adminNotes: adminNotes.value || undefined }
        })
        toast.success('สำเร็จ', 'อัปเดตสถานะเป็น Responding แล้ว')
        selected.value = null
        await Promise.all([fetchEmergencies(), fetchStats()])
    } catch (e) {
        console.error('Failed to respond emergency', e)
        toast.error('เกิดข้อผิดพลาด', e.data?.message || e.message || 'ไม่สามารถอัปเดตได้')
    } finally {
        actionLoading.value = false
    }
}

const resolve = async () => {
    if (!selected.value) return

    const notes = adminNotes.value?.trim()
    if (!notes) {
        toast.error('กรุณากรอกหมายเหตุ', 'โปรดสรุปการดำเนินการหรือข้อมูลสำคัญก่อนปิดเหตุฉุกเฉิน')
        return
    }

    actionLoading.value = true
    try {
        await $api(`/emergency/${selected.value.id}/resolve`, {
            method: 'PATCH',
            body: { adminNotes: notes }
        })
        toast.success('สำเร็จ', 'ปิดเหตุฉุกเฉินแล้ว')
        selected.value = null
        await Promise.all([fetchEmergencies(), fetchStats()])
    } catch (e) {
        console.error('Failed to resolve emergency', e)
        toast.error('เกิดข้อผิดพลาด', e.data?.message || e.message || 'ไม่สามารถอัปเดตได้')
    } finally {
        actionLoading.value = false
    }
}

onMounted(() => {
    fetchStats()
    fetchEmergencies()
})
</script>

