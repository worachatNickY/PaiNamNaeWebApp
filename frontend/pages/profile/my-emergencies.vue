<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8 bg-gray-50">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProfileSidebar />

                <main class="flex-1 p-8">
                    <!-- Header -->
                    <div class="mb-8">
                        <h1 class="text-2xl font-bold text-gray-900">รายการขอความช่วยเหลือ</h1>
                        <p class="mt-1 text-gray-600">
                            ดูคำขอ รายการ ที่คุณเคยส่ง พร้อมสถานะการช่วยเหลือจากทีมงาน
                        </p>
                    </div>

                    <!-- Status filters -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <button
                            v-for="opt in statusOptions"
                            :key="opt.value"
                            @click="setStatusFilter(opt.value)"
                            class="px-3 py-1.5 text-sm rounded-full border"
                            :class="statusFilter === opt.value
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'">
                            {{ opt.label }}
                        </button>
                    </div>

                    <!-- List -->
                    <div class="bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div v-if="loading" class="p-12 text-center text-gray-500">
                            <svg class="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            กำลังโหลด...
                        </div>

                        <div v-else-if="requests.length === 0" class="p-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 11-9 9 9 9 0 019-9z" />
                            </svg>
                            <p class="text-lg font-medium text-gray-700">ยังไม่มีเหตุฉุกเฉินที่บันทึกไว้</p>
                            <p class="mt-1 text-sm text-gray-500">
                                หากเกิดเหตุฉุกเฉินระหว่างเดินทาง คุณสามารถกดปุ่ม SOS มุมล่างขวาได้ทุกเวลา
                            </p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div
                                v-for="item in requests"
                                :key="item.id"
                                class="p-6">
                                <div class="flex items-start gap-4">
                                    <!-- Icon -->
                                    <div
                                        class="flex items-center justify-center flex-shrink-0 w-12 h-12 border-2 border-gray-200 rounded-xl">
                                        <svg v-if="item.type === 'ACCIDENT'" xmlns="http://www.w3.org/2000/svg"
                                            class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <svg v-else-if="item.type === 'MEDICAL'" xmlns="http://www.w3.org/2000/svg"
                                            class="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <svg v-else-if="item.type === 'THREAT'" xmlns="http://www.w3.org/2000/svg"
                                            class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 9v2m0 4h.01M4.5 20.25h15a1.5 1.5 0 001.342-2.164l-7.5-14.25a1.5 1.5 0 00-2.684 0l-7.5 14.25A1.5 1.5 0 004.5 20.25z" />
                                        </svg>
                                        <svg v-else-if="item.type === 'VEHICLE_BREAKDOWN'"
                                            xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M9.75 9.75L12 12m0 0l2.25 2.25M12 12l2.25-2.25M12 12l-2.25 2.25M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg"
                                            class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 9v3.75m0 3.75h.008v.008H12V16.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span class="font-semibold text-gray-900">
                                                {{ typeLabels[item.type] || item.type }}
                                            </span>
                                            <span
                                                :class="getStatusClass(item.status)"
                                                class="px-2 py-0.5 text-xs font-medium rounded-full">
                                                {{ statusLabels[item.status] || item.status }}
                                            </span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">
                                            <span class="font-medium">ส่งเมื่อ:</span>
                                            {{ formatDateTime(item.createdAt) }}
                                        </p>
                                        <p v-if="item.address" class="mt-1 text-sm text-gray-500">
                                            <span class="font-medium">ตำแหน่ง:</span> {{ item.address }}
                                        </p>
                                        <p class="mt-1 text-xs text-gray-400">
                                            ({{ item.latitude.toFixed(5) }}, {{ item.longitude.toFixed(5) }})
                                        </p>

                                        <p v-if="item.description" class="mt-2 text-sm text-gray-700">
                                            {{ item.description }}
                                        </p>

                                        <!-- Attachments (read-only for driver) -->
                                        <div
                                            v-if="Array.isArray(item.attachments) && item.attachments.length"
                                            class="mt-3">
                                            <p class="mb-1 text-xs font-semibold text-gray-700 uppercase">
                                                ไฟล์ที่แนบไว้
                                            </p>
                                            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                <div
                                                    v-for="(att, idx) in item.attachments"
                                                    :key="idx"
                                                    class="overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
                                                    <a
                                                        :href="att.url"
                                                        target="_blank"
                                                        class="block">
                                                        <img
                                                            v-if="isImage(att.type)"
                                                            :src="att.url"
                                                            alt="attachment"
                                                            class="object-cover w-full h-24">
                                                        <div
                                                            v-else-if="isVideo(att.type)"
                                                            class="flex flex-col items-center justify-center w-full h-24 text-[11px] text-gray-700 px-2 text-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                class="w-7 h-7 mb-1 text-gray-500"
                                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-3 4H6a2 2 0 01-2-2V8a2 2 0 012-2h6a2 2 0 012 2v8z" />
                                                            </svg>
                                                            <span>วิดีโอ - กดเพื่อเปิดดู</span>
                                                        </div>
                                                        <div
                                                            v-else
                                                            class="flex items-center justify-center w-full h-24 px-2 text-[11px] text-gray-600 text-center">
                                                            ไฟล์แนบอื่น ๆ
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Timeline -->
                                        <div class="mt-3 space-y-1 text-xs text-gray-500">
                                            <p v-if="item.respondedAt">
                                                ทีมงานรับเรื่องแล้ว: {{ formatDateTime(item.respondedAt) }}
                                            </p>
                                            <p v-if="item.resolvedAt">
                                                ปิดเหตุฉุกเฉินแล้ว: {{ formatDateTime(item.resolvedAt) }}
                                            </p>
                                            <p v-if="item.cancelledAt">
                                                คุณยกเลิกคำขอ: {{ formatDateTime(item.cancelledAt) }}
                                            </p>
                                            <p v-if="item.adminNotes" class="mt-1 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                                <span class="font-medium">หมายเหตุจากทีมงาน:</span>
                                                {{ item.adminNotes }}
                                            </p>
                                        </div>

                                        <!-- Actions -->
                                        <div class="flex flex-wrap gap-2 mt-4">
                                            <button
                                                v-if="item.status === 'ACTIVE' || item.status === 'RESPONDING'"
                                                @click="openCancelModal(item)"
                                                class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                                                ยกเลิกคำขอ (กดผิด)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div
                            v-if="pagination.totalPages > 1"
                            class="flex items-center justify-between p-4 border-t border-gray-200">
                            <p class="text-sm text-gray-600">
                                หน้า {{ pagination.page }} จาก {{ pagination.totalPages }}
                            </p>
                            <div class="flex gap-2">
                                <button
                                    @click="changePage(pagination.page - 1)"
                                    :disabled="pagination.page <= 1"
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    ก่อนหน้า
                                </button>
                                <button
                                    @click="changePage(pagination.page + 1)"
                                    :disabled="pagination.page >= pagination.totalPages"
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Cancel modal -->
        <Teleport to="body">
            <div
                v-if="cancelTarget"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div class="w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-2xl">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        ยกเลิกคำขอฉุกเฉินนี้หรือไม่
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">
                        ใช้กรณีที่กดผิด หรือเหตุการณ์จบลงแล้วและไม่ต้องการให้ทีมงานติดตามต่อ
                    </p>
                    <textarea
                        v-model="cancelReason"
                        rows="3"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4"
                        placeholder="เหตุผล (ไม่บังคับ) เช่น กดผิด, ปลอดภัยแล้ว ฯลฯ"></textarea>
                    <div class="flex justify-end gap-2">
                        <button
                            @click="closeCancelModal"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            ยกเลิก
                        </button>
                        <button
                            @click="confirmCancel"
                            :disabled="cancelling"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ cancelling ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})

const { $api } = useNuxtApp()
const { toast } = useToast()

const requests = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const statusFilter = ref('ALL')

const cancelTarget = ref(null)
const cancelReason = ref('')
const cancelling = ref(false)

const statusOptions = [
    { value: 'ALL', label: 'ทั้งหมด' },
    { value: 'ACTIVE', label: 'กำลังดำเนินการ' },
    { value: 'RESPONDING', label: 'ทีมงานตอบรับแล้ว' },
    { value: 'RESOLVED', label: 'ปิดเหตุฉุกเฉินแล้ว' },
    { value: 'CANCELLED', label: 'ยกเลิก' }
]

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

const isImage = (mime) => typeof mime === 'string' && mime.startsWith('image/')
const isVideo = (mime) => typeof mime === 'string' && mime.startsWith('video/')

const fetchRequests = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams()
        params.append('page', pagination.value.page)
        params.append('limit', pagination.value.limit)
        if (statusFilter.value !== 'ALL') {
            params.append('status', statusFilter.value)
        }
        const res = await $api(`/emergency/my-emergencies?${params.toString()}`)
        requests.value = res?.data ?? []
        pagination.value = res?.pagination ?? pagination.value
    } catch (e) {
        console.error('Failed to fetch emergencies', e)
        requests.value = []
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (page < 1 || page > pagination.value.totalPages) return
    pagination.value.page = page
    fetchRequests()
}

const setStatusFilter = (value) => {
    statusFilter.value = value
    pagination.value.page = 1
    fetchRequests()
}

const getStatusClass = (status) => {
    const map = {
        ACTIVE: 'bg-red-100 text-red-700',
        RESPONDING: 'bg-amber-100 text-amber-700',
        RESOLVED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-gray-100 text-gray-600'
    }
    return map[status] || 'bg-gray-100 text-gray-600'
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

const openCancelModal = (item) => {
    cancelTarget.value = item
    cancelReason.value = ''
}

const closeCancelModal = () => {
    cancelTarget.value = null
    cancelReason.value = ''
}

const confirmCancel = async () => {
    if (!cancelTarget.value) return
    cancelling.value = true
    try {
        await $api(`/emergency/${cancelTarget.value.id}/cancel`, {
            method: 'PATCH',
            body: {
                reason: cancelReason.value || undefined
            }
        })
        toast.success('สำเร็จ', 'ยกเลิกคำขอฉุกเฉินแล้ว')
        closeCancelModal()
        fetchRequests()
    } catch (e) {
        console.error('Failed to cancel emergency', e)
        toast.error('เกิดข้อผิดพลาด', e.data?.message || e.message || 'ไม่สามารถยกเลิกคำขอฉุกเฉินได้')
    } finally {
        cancelling.value = false
    }
}

onMounted(fetchRequests)
</script>

