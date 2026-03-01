<template>
    <div class="min-h-screen bg-gray-50">
        <div class="px-4 py-8 mx-auto max-w-4xl sm:px-6">
            <h1 class="text-2xl font-bold text-gray-900">รีวิวการเดินทาง</h1>
            <p class="mt-1 text-gray-600">รีวิวได้ภายใน 7 วันหลังเดินทางสำเร็จ และ ทุกคนจะเห็นรีวิวของคุณ</p>

            <!-- ไม่ล็อกอิน: แสดงเฉพาะรีวิวล่าสุด + ปุ่มเข้าสู่ระบบ -->
            <div v-if="!token" class="p-4 mt-6 bg-amber-50 border border-amber-200 rounded-xl">
                <p class="text-gray-700">กรุณาเข้าสู่ระบบเพื่อเขียนรีวิวและดูทริปที่รอรีวิว</p>
                <NuxtLink to="/login" class="inline-block px-4 py-2 mt-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">เข้าสู่ระบบ</NuxtLink>
            </div>

            <template v-else>
                <!-- ทริปที่รอรีวิว (ภายใน 7 วัน) -->
                <section class="mt-8">
                    <h2 class="text-lg font-semibold text-gray-900">ทริปที่รอรีวิว</h2>
                    <p class="mt-1 text-sm text-gray-600">เดินทางสำเร็จแล้ว และยังไม่เกิน 7 วัน — กดเขียนรีวิวได้</p>
                    <div v-if="loadingReviewable" class="p-6 mt-4 bg-white rounded-xl shadow">กำลังโหลด...</div>
                    <div v-else-if="!reviewableTrips.length" class="p-6 mt-4 bg-white rounded-xl shadow text-gray-500">
                        ไม่มีทริปที่รอรีวิวในขณะนี้
                    </div>
                    <ul v-else class="mt-4 space-y-4">
                        <li v-for="trip in reviewableTrips" :key="trip.id"
                            class="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl shadow">
                            <div>
                                <p class="font-medium text-gray-900">{{ tripOrigin(trip) }} → {{ tripDest(trip) }}</p>
                                <p class="text-sm text-gray-600">
                                    คนขับ: {{ trip.route.driver.firstName }} {{ trip.route.driver.lastName }}
                                    · {{ formatDate(trip.route.departureTime) }}
                                </p>
                            </div>
                            <button type="button"
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                @click="openReviewForm(trip)">
                                เขียนรีวิว
                            </button>
                        </li>
                    </ul>
                </section>

                <!-- รีวิวที่ฉันเขียน -->
                <section class="mt-10">
                    <h2 class="text-lg font-semibold text-gray-900">รีวิวที่ของคุณ</h2>
                    <div v-if="loadingMy" class="p-6 mt-4 bg-white rounded-xl shadow">กำลังโหลด...</div>
                    <div v-else-if="!myReviews.length" class="p-6 mt-4 bg-white rounded-xl shadow text-gray-500">
                        ยังไม่มีรีวิวที่คุณเขียน
                    </div>
                    <ul v-else class="mt-4 space-y-4">
                        <li v-for="r in myReviews" :key="r.id" class="p-4 bg-white rounded-xl shadow">
                            <div class="flex items-center justify-between">
                                <div class="flex gap-2 text-yellow-500">
                                    <span v-for="i in 5" :key="i">{{ i <= r.rating ? '★' : '☆' }}</span>
                                </div>
                                <span class="text-sm text-gray-500">{{ formatDate(r.createdAt) }}</span>
                            </div>
                            <p v-if="r.comment" class="mt-2 text-gray-700">{{ r.comment }}</p>
                            <p class="mt-1 text-sm text-gray-500">รีวิวคนขับ: {{ r.driver.firstName }} {{ r.driver.lastName }}</p>
                        </li>
                    </ul>
                </section>
            </template>

            <!-- รีวิวล่าสุด (ทุกคนเห็น ไม่ต้องล็อกอิน) -->
            <section class="mt-10">
                <h2 class="text-lg font-semibold text-gray-900">รีวิวล่าสุด</h2>
                <p class="mt-1 text-sm text-gray-600">รีวิวจากผู้โดยสาร — ทุกคนสามารถดูรีวิวได้</p>
                <div v-if="loadingRecent" class="p-6 mt-4 bg-white rounded-xl shadow">กำลังโหลด...</div>
                <div v-else-if="!recentReviews.length" class="p-6 mt-4 bg-white rounded-xl shadow text-gray-500">
                    ยังไม่มีรีวิว
                </div>
                <ul v-else class="mt-4 space-y-4">
                    <li v-for="r in recentReviews" :key="r.id" class="p-4 bg-white rounded-xl shadow">
                        <div class="flex items-center justify-between">
                            <div class="flex gap-2 text-yellow-500">
                                <span v-for="i in 5" :key="i">{{ i <= r.rating ? '★' : '☆' }}</span>
                            </div>
                            <span class="text-sm text-gray-500">{{ formatDate(r.createdAt) }}</span>
                        </div>
                        <p v-if="r.comment" class="mt-2 text-gray-700">{{ r.comment }}</p>
                        <p class="mt-1 text-sm text-gray-500">
                            คนขับ: {{ r.driver.firstName }} {{ r.driver.lastName }}
                            <span v-if="r.isAnonymous">· ผู้รีวิว: ไม่แสดงชื่อ</span>
                            <span v-else>· ผู้รีวิว: {{ r.passenger?.firstName }} {{ r.passenger?.lastName }}</span>
                        </p>
                    </li>
                </ul>
            </section>
        </div>

        <!-- Modal เขียนรีวิว -->
        <Teleport to="body">
            <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showModal = false">
                <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div class="p-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">เขียนรีวิว</h3>
                        <p v-if="selectedTrip" class="mt-1 text-sm text-gray-600">
                            {{ tripOrigin(selectedTrip) }} → {{ tripDest(selectedTrip) }} · {{ selectedTrip.route.driver.firstName }} {{ selectedTrip.route.driver.lastName }}
                        </p>
                    </div>
                    <form class="p-4 space-y-4" @submit.prevent="submitReview">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">คะแนน (1–5 ดาว)</label>
                            <div class="flex gap-2 mt-2">
                                <button v-for="i in 5" :key="i" type="button"
                                    :class="['w-10 h-10 rounded-lg text-lg', rating >= i ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 bg-gray-100']"
                                    @click="rating = i">
                                    ★
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">แท็ก (ถ้ามี)</label>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <button v-for="tag in tagOptions" :key="tag.value" type="button"
                                    :class="['px-3 py-1 rounded-full text-sm', tags.includes(tag.value) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
                                    @click="toggleTag(tag.value)">
                                    {{ tag.label }}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">ความคิดเห็น</label>
                            <textarea v-model="comment" rows="3" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="บอกประสบการณ์การเดินทาง..."></textarea>
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="anon" v-model="isAnonymous" type="checkbox" class="rounded border-gray-300" />
                            <label for="anon" class="text-sm text-gray-700">ไม่แสดงชื่อของฉันในรีวิว</label>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" class="flex-1 px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                @click="closeModal">ยกเลิก</button>
                            <button type="submit" class="flex-1 px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                :disabled="submitting || !rating">
                                {{ submitting ? 'กำลังส่ง...' : 'ส่งรีวิว' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useToast } from '~/composables/useToast'

dayjs.locale('th')
dayjs.extend(buddhistEra)

const { $api } = useNuxtApp()
const token = useCookie('token')
const { toast } = useToast()

const reviewableTrips = ref([])
const myReviews = ref([])
const recentReviews = ref([])
const loadingReviewable = ref(false)
const loadingMy = ref(false)
const loadingRecent = ref(false)
const showModal = ref(false)
const selectedTrip = ref(null)
const rating = ref(0)
const tags = ref([])
const comment = ref('')
const isAnonymous = ref(false)
const submitting = ref(false)

const tagOptions = [
    { value: 'on_time', label: 'ตรงเวลา' },
    { value: 'clean', label: 'รถสะอาด' },
    { value: 'friendly', label: 'มิตรภาพ' },
    { value: 'safe', label: 'ขับปลอดภัย' },
    { value: 'comfortable', label: 'นั่งสบาย' },
]

function tripOrigin(trip) {
    const s = trip.route?.startLocation
    return s?.name || (s?.address || '-')
}
function tripDest(trip) {
    const e = trip.route?.endLocation
    return e?.name || (e?.address || '-')
}
function formatDate(d) {
    return d ? dayjs(d).format('D MMM BBBB') : '-'
}
function toggleTag(v) {
    if (tags.value.includes(v)) tags.value = tags.value.filter(t => t !== v)
    else tags.value = [...tags.value, v]
}
function openReviewForm(trip) {
    selectedTrip.value = trip
    rating.value = 0
    tags.value = []
    comment.value = ''
    isAnonymous.value = false
    showModal.value = true
}
function closeModal() {
    selectedTrip.value = null
    showModal.value = false
}
async function submitReview() {
    if (!selectedTrip.value || !rating.value) return
    submitting.value = true
    try {
        await $api('/reviews', {
            method: 'POST',
            body: {
                trip_id: selectedTrip.value.id,
                rating: rating.value,
                tags: tags.value.length ? tags.value : undefined,
                comment: comment.value || undefined,
                isAnonymous: isAnonymous.value,
            },
        })
        toast.success('ส่งรีวิวสำเร็จ', 'ขอบคุณสำหรับรีวิว')
        closeModal()
        await Promise.all([fetchReviewable(), fetchMyReviews(), fetchRecent()])
    } catch (e) {
        const msg = e.data?.message || e.message || 'ส่งรีวิวไม่สำเร็จ'
        toast.error('ส่งรีวิวไม่สำเร็จ', msg)
    } finally {
        submitting.value = false
    }
}

async function fetchReviewable() {
    if (!token.value) return
    loadingReviewable.value = true
    try {
        const res = await $api('/reviews/reviewable')
        reviewableTrips.value = Array.isArray(res) ? res : (res?.data || [])
    } catch {
        reviewableTrips.value = []
    } finally {
        loadingReviewable.value = false
    }
}
async function fetchMyReviews() {
    if (!token.value) return
    loadingMy.value = true
    try {
        const res = await $api('/reviews/me?limit=20')
        myReviews.value = res?.data ?? []
    } catch {
        myReviews.value = []
    } finally {
        loadingMy.value = false
    }
}
async function fetchRecent() {
    loadingRecent.value = true
    try {
        const res = await $api('/reviews?limit=10')
        recentReviews.value = res?.data ?? []
    } catch {
        recentReviews.value = []
    } finally {
        loadingRecent.value = false
    }
}

onMounted(() => {
    fetchRecent()
    if (token.value) {
        fetchReviewable()
        fetchMyReviews()
    }
})
</script>
