<template>
    <div>
        <AdminHeader />
        <AdminSidebar />

        <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
            <div class="mx-auto max-w-6xl">
                <div class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl font-semibold text-gray-800">Chat Logs</h1>
                        <span v-if="booking?.id"
                            class="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">
                            พบข้อมูล
                        </span>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input v-model.trim="bookingIdInput" type="text" placeholder="กรอก Booking ID"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="loadLogs" :disabled="isLoading || !bookingIdInput"
                            class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isLoading ? 'กำลังโหลด...' : 'ค้นหา' }}
                        </button>
                    </div>
                </div>

                <div v-if="errorMessage" class="p-4 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {{ errorMessage }}
                </div>

                <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <!-- Conversations list -->
                    <section class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden lg:col-span-4">
                        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div class="text-sm font-medium text-gray-800">
                                Conversations
                                <span class="ml-2 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {{ conversationsPagination.total || 0 }}
                                </span>
                            </div>
                            <button @click="loadConversations" class="text-xs text-blue-600 hover:underline"
                                :disabled="isLoadingConversations">
                                รีเฟรช
                            </button>
                        </div>

                        <div class="p-3 border-b border-gray-100 bg-white">
                            <input v-model.trim="conversationFilterBookingId" type="text"
                                placeholder="กรองด้วย Booking ID (ไม่บังคับ)"
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div class="mt-2 flex gap-2">
                                <button @click="applyConversationFilter"
                                    class="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    ค้นหา
                                </button>
                                <button @click="clearConversationFilter"
                                    class="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                    ล้าง
                                </button>
                            </div>
                        </div>

                        <div class="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                            <div v-if="isLoadingConversations" class="p-6 text-sm text-center text-gray-500">
                                กำลังโหลดรายการ...
                            </div>
                            <div v-else-if="conversations.length === 0" class="p-6 text-sm text-center text-gray-500">
                                ยังไม่มีแชทในระบบ
                            </div>

                            <button v-for="c in conversations" :key="c.bookingId" type="button"
                                class="w-full text-left p-3 hover:bg-gray-50"
                                :class="c.bookingId === booking?.id ? 'bg-blue-50' : ''"
                                @click="selectConversation(c.bookingId)">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <div class="text-sm font-medium text-gray-900 truncate">
                                            {{ c.booking?.route?.startLocation?.name || '-' }} → {{ c.booking?.route?.endLocation?.name || '-' }}
                                        </div>
                                        <div class="mt-0.5 text-[11px] text-gray-500 truncate">
                                            Booking: {{ c.bookingId }}
                                        </div>
                                        <div class="mt-1 text-[11px] text-gray-600">
                                            {{ c.messageCount }} ข้อความ • ล่าสุด: {{ formatDateTime(c.lastMessageAt) }}
                                        </div>
                                    </div>
                                    <span class="shrink-0 text-[10px] px-2 py-0.5 rounded-full"
                                        :class="badgeClass(c.booking?.status)">
                                        {{ c.booking?.status || 'UNKNOWN' }}
                                    </span>
                                </div>
                            </button>
                        </div>

                        <div v-if="conversationsPagination.totalPages > 1"
                            class="p-3 border-t border-gray-200 bg-white flex items-center justify-between">
                            <button class="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                :disabled="isLoadingConversations || conversationsPagination.page <= 1"
                                @click="goConversationPage(conversationsPagination.page - 1)">
                                ก่อนหน้า
                            </button>
                            <div class="text-xs text-gray-600">
                                หน้า {{ conversationsPagination.page }} / {{ conversationsPagination.totalPages }}
                            </div>
                            <button class="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                :disabled="isLoadingConversations || conversationsPagination.page >= conversationsPagination.totalPages"
                                @click="goConversationPage(conversationsPagination.page + 1)">
                                ถัดไป
                            </button>
                        </div>
                    </section>

                    <!-- Messages -->
                    <section class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden lg:col-span-8">
                        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div class="flex items-center justify-between">
                                <div class="text-sm font-medium text-gray-800">
                                    Messages
                                    <span class="ml-2 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {{ messages.length }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <button
                                        v-if="booking?.id"
                                        type="button"
                                        class="text-xs text-gray-700 hover:underline"
                                        @click="exportChat('txt')"
                                    >
                                        ดาวน์โหลด .txt
                                    </button>
                                    <button
                                        v-if="booking?.id"
                                        type="button"
                                        class="text-xs text-gray-700 hover:underline"
                                        @click="exportChat('json')"
                                    >
                                        ดาวน์โหลด .json
                                    </button>
                                    <button @click="scrollToBottom" class="text-xs text-blue-600 hover:underline" :disabled="!booking?.id">
                                        ไปท้ายแชท
                                    </button>
                                </div>
                            </div>
                            <p class="mt-1 text-xs text-gray-500">
                                หน้านี้สำหรับผู้ดูแลระบบเท่านั้น (อ่านอย่างเดียว) เพื่อใช้ตรวจสอบเหตุการณ์/ข้อร้องเรียน
                            </p>
                        </div>

                        <div v-if="booking?.id" class="px-4 py-3 border-b border-gray-100 bg-white">
                            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div class="text-xs text-gray-700">
                                    <span class="font-medium text-gray-900">Booking:</span> {{ booking.id }}
                                </div>
                                <div class="text-xs text-gray-700">
                                    <span class="font-medium text-gray-900">Departure:</span> {{ formatDateTime(booking?.route?.departureTime) }}
                                </div>
                                <div class="text-xs text-gray-500 sm:col-span-2">
                                    DriverId: {{ booking?.route?.driverId || '-' }} • PassengerId: {{ booking?.passengerId || '-' }}
                                </div>
                            </div>
                        </div>

                        <div ref="scrollEl" class="h-[65vh] overflow-y-auto p-4 bg-gray-50 space-y-2">
                            <div v-if="isLoading && messages.length === 0" class="py-10 text-sm text-center text-gray-500">
                                กำลังโหลด...
                            </div>
                            <div v-else-if="!booking?.id" class="py-10 text-sm text-center text-gray-500">
                                เลือกรายการแชทจากฝั่งซ้าย หรือกรอก Booking ID เพื่อดูข้อความ
                            </div>
                            <div v-else-if="messages.length === 0" class="py-10 text-sm text-center text-gray-500">
                                ไม่มีข้อความในแชทนี้
                            </div>

                            <div v-for="m in messages" :key="m.id" class="flex"
                                :class="m.senderId === booking?.route?.driverId ? 'justify-start' : 'justify-end'">
                                <div class="max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm"
                                    :class="m.senderId === booking?.route?.driverId
                                        ? 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                                        : 'bg-blue-600 text-white rounded-br-sm'">
                                    <div class="text-[10px] opacity-80 mb-1">
                                        <span class="font-medium">
                                            {{ m.senderId === booking?.route?.driverId ? 'Driver' : 'Passenger' }}
                                        </span>
                                        <span class="mx-1">•</span>
                                        <span>{{ m.type || 'TEXT' }}</span>
                                    </div>

                                    <template v-if="!m.type || m.type === 'TEXT'">
                                        <p class="whitespace-pre-wrap break-words">{{ m.text }}</p>
                                    </template>
                                    <template v-else-if="m.type === 'LOCATION'">
                                        <a class="underline underline-offset-2" :href="googleMapsLink(m.latitude, m.longitude)"
                                            target="_blank" rel="noopener">
                                            เปิดพิกัดใน Google Maps ({{ formatLatLng(m.latitude, m.longitude) }})
                                        </a>
                                    </template>
                                    <template v-else>
                                        <a class="underline underline-offset-2" :href="toAbsoluteMediaUrl(m.mediaUrl)"
                                            target="_blank" rel="noopener">
                                            เปิดไฟล์แนบ
                                        </a>
                                    </template>

                                    <div class="mt-1 text-[10px] opacity-80">
                                        {{ formatDateTime(m.createdAt) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'

dayjs.locale('th')

definePageMeta({
    middleware: 'auth',
    layout: false
})

useHead({
    link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }
    ]
})

const { $api } = useNuxtApp()
const config = useRuntimeConfig()

const bookingIdInput = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const booking = ref(null)
const messages = ref([])
const scrollEl = ref(null)

const conversations = ref([])
const isLoadingConversations = ref(false)
const conversationsPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const conversationFilterBookingId = ref('')

function formatDateTime(v) {
    if (!v) return '-'
    return dayjs(v).format('D MMM BBBB HH:mm')
}

function badgeClass(status) {
    const s = String(status || '').toUpperCase()
    if (s === 'COMPLETED') return 'bg-indigo-100 text-indigo-800'
    if (s === 'PASSENGER_PICKED_UP' || s === 'DRIVER_ON_THE_WAY') return 'bg-emerald-100 text-emerald-800'
    if (s === 'CONFIRMED') return 'bg-blue-100 text-blue-800'
    if (s === 'PENDING') return 'bg-amber-100 text-amber-800'
    if (s === 'CANCELLED' || s === 'REJECTED') return 'bg-gray-100 text-gray-700'
    return 'bg-gray-100 text-gray-700'
}

function toAbsoluteMediaUrl(p) {
    if (!p) return ''
    if (typeof p !== 'string') return ''
    if (/^https?:\/\//i.test(p)) return p
    const apiBase = String(config.public?.apiBase || '')
    const base = apiBase.replace(/\/api\/?$/i, '/')
    const path = p.startsWith('/') ? p.slice(1) : p
    return `${base}${path}`
}

function googleMapsLink(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') return '#'
    return `https://www.google.com/maps?q=${lat},${lng}`
}
function formatLatLng(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') return ''
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

async function loadLogs() {
    errorMessage.value = ''
    booking.value = null
    messages.value = []

    const bookingId = bookingIdInput.value?.trim()
    if (!bookingId) return

    isLoading.value = true
    try {
        const res = await $api(`/messages/admin/${bookingId}`)
        const data = res?.data || res
        booking.value = data?.booking || null
        messages.value = Array.isArray(data?.messages) ? data.messages : []
        await nextTick()
        scrollToBottom()
    } catch (err) {
        const msg = err?.data?.message || err?.message || 'ไม่สามารถโหลดแชทได้'
        errorMessage.value = msg
    } finally {
        isLoading.value = false
    }
}

function scrollToBottom() {
    if (!scrollEl.value) return
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

function senderLabel(m) {
    const driverId = booking.value?.route?.driverId
    if (!driverId) return 'UNKNOWN'
    return m?.senderId === driverId ? 'DRIVER' : 'PASSENGER'
}

function safeLocName(v) {
    if (!v) return '-'
    // startLocation/endLocation are JSON objects in this project
    if (typeof v === 'string') return v
    if (typeof v === 'object' && v?.name) return String(v.name)
    return '-'
}

function exportChat(format = 'txt') {
    if (!booking.value?.id) return
    const b = booking.value
    const id = String(b.id)
    const departure = b?.route?.departureTime ? new Date(b.route.departureTime).toISOString() : null
    const origin = safeLocName(b?.route?.startLocation)
    const destination = safeLocName(b?.route?.endLocation)

    const ts = dayjs().format('YYYYMMDD_HHmmss')

    if (format === 'json') {
        const payload = {
            exportedAt: new Date().toISOString(),
            booking: {
                id: b.id,
                status: b.status,
                passengerId: b.passengerId,
                driverId: b?.route?.driverId || null,
                departureTime: departure,
                origin,
                destination,
            },
            messages: messages.value.map((m) => ({
                id: m.id,
                type: m.type || 'TEXT',
                senderId: m.senderId,
                senderRole: senderLabel(m),
                receiverId: m.receiverId,
                text: m.text || null,
                mediaUrl: m.mediaUrl || null,
                latitude: typeof m.latitude === 'number' ? m.latitude : null,
                longitude: typeof m.longitude === 'number' ? m.longitude : null,
                createdAt: m.createdAt,
            })),
        }

        downloadFile(`chatlog_${id}_${ts}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
        return
    }

    // txt
    const lines = []
    lines.push(`Chat Log Export`)
    lines.push(`ExportedAt: ${new Date().toISOString()}`)
    lines.push(`BookingId: ${id}`)
    lines.push(`Status: ${b.status}`)
    lines.push(`Route: ${origin} -> ${destination}`)
    lines.push(`DepartureTime: ${departure || '-'}`)
    lines.push(`DriverId: ${b?.route?.driverId || '-'}`)
    lines.push(`PassengerId: ${b.passengerId || '-'}`)
    lines.push(`---`)
    for (const m of messages.value) {
        const when = m.createdAt ? dayjs(m.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'
        const who = senderLabel(m)
        const type = m.type || 'TEXT'
        let body = ''
        if (!m.type || m.type === 'TEXT') body = m.text || ''
        else if (m.type === 'LOCATION') body = `LOCATION: ${m.latitude}, ${m.longitude} (${googleMapsLink(m.latitude, m.longitude)})`
        else body = `MEDIA: ${toAbsoluteMediaUrl(m.mediaUrl)}`
        lines.push(`[${when}] ${who} ${type}: ${body}`)
    }

    downloadFile(`chatlog_${id}_${ts}.txt`, lines.join('\n'), 'text/plain;charset=utf-8')
}

async function loadConversations() {
    isLoadingConversations.value = true
    try {
        const q = new URLSearchParams()
        q.set('page', String(conversationsPagination.value.page || 1))
        q.set('limit', String(conversationsPagination.value.limit || 20))
        if (conversationFilterBookingId.value) q.set('bookingId', conversationFilterBookingId.value)

        const res = await $api(`/messages/admin?${q.toString()}`)
        // api plugin unwraps to { data, pagination } when pagination exists
        const data = res?.data ?? res
        const pagination = res?.pagination
        conversations.value = Array.isArray(data) ? data : []
        if (pagination) conversationsPagination.value = pagination
    } catch (err) {
        const msg = err?.data?.message || err?.message || 'ไม่สามารถโหลดรายการแชทได้'
        errorMessage.value = msg
    } finally {
        isLoadingConversations.value = false
    }
}

function goConversationPage(p) {
    conversationsPagination.value.page = p
    loadConversations()
}

function applyConversationFilter() {
    conversationsPagination.value.page = 1
    loadConversations()
}

function clearConversationFilter() {
    conversationFilterBookingId.value = ''
    conversationsPagination.value.page = 1
    loadConversations()
}

async function selectConversation(id) {
    bookingIdInput.value = id
    await loadLogs()
}

onMounted(() => {
    loadConversations()
})
</script>

