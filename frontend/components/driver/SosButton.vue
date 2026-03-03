<template>
    <!-- Floating Incident Report Button -->
    <div v-if="isDriver" class="fixed z-50 bottom-6 right-6">
        <button @click="showModal = true"
            class="flex items-center justify-center w-16 h-16 text-white transition-all bg-red-600 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 animate-pulse-slow">
            <span class="text-[11px] font-bold leading-tight text-center">
                REPORT
            </span>
        </button>
    </div>

    <!-- SOS Modal -->
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div class="w-full max-w-md mx-4 overflow-hidden bg-white shadow-2xl rounded-2xl">
                <!-- Header -->
                <div class="p-6 text-center text-white bg-gradient-to-r from-red-600 to-red-700">
                    <div
                        class="flex items-center justify-center w-20 h-20 mx-auto mb-4 border-4 border-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
<<<<<<< Updated upstream
                    <h2 class="text-2xl font-bold">Emergency SOS</h2>
                    <p class="mt-2 text-red-100">ขอความช่วยเหลือฉุกเฉิน</p>
=======
                    <h2 class="text-xl sm:text-2xl font-bold">รายงานเหตุ / ปัญหาระหว่างการเดินทาง</h2>
                    <p class="mt-1 sm:mt-2 text-sm sm:text-base text-red-100">
                        ใช้รายงานเหตุไม่ปลอดภัย อุบัติเหตุ หรือปัญหาระหว่างการเดินทางให้ทีมงานทราบ
                    </p>
>>>>>>> Stashed changes
                </div>

                <!-- Body -->
                <div class="p-6">
                    <!-- Emergency Type Selection -->
<<<<<<< Updated upstream
                    <div class="mb-6">
                        <label class="block mb-3 text-sm font-semibold text-gray-700">ประเภทเหตุฉุกเฉิน</label>
                        <div class="grid grid-cols-2 gap-3">
=======
                    <div class="mb-4 sm:mb-4">
                        <label class="block mb-2 sm:mb-3 text-sm font-semibold text-gray-700">
                            ประเภทเหตุ / ปัญหาหลัก
                        </label>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
>>>>>>> Stashed changes
                            <button v-for="type in emergencyTypes" :key="type.value" @click="selectedType = type.value"
                                :class="[
                                    'p-4 rounded-xl border-2 transition-all text-center',
                                    selectedType === type.value
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                ]">
                                <div class="flex justify-center mb-2">
                                    <!-- Accident -->
                                    <svg v-if="type.value === 'ACCIDENT'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <!-- Medical -->
                                    <svg v-else-if="type.value === 'MEDICAL'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <!-- Threat -->
                                    <svg v-else-if="type.value === 'THREAT'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <!-- Vehicle Breakdown -->
                                    <svg v-else-if="type.value === 'VEHICLE_BREAKDOWN'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <!-- Other -->
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div class="text-sm font-medium">{{ type.label }}</div>
                            </button>
                        </div>
                    </div>

                    <!-- Incident reason -->
                    <div class="mb-4 sm:mb-6">
                        <label class="block mb-2 text-sm font-semibold text-gray-700">
                            คุณต้องการแจ้งเหตุ / ปัญหาเกี่ยวกับอะไร
                        </label>
                        <select v-model="incidentReason"
                            class="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">เลือกประเภทเหตุ/ปัญหา</option>
                            <option v-for="opt in incidentReasons" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Description -->
<<<<<<< Updated upstream
                    <div class="mb-6">
                        <label class="block mb-2 text-sm font-semibold text-gray-700">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
=======
                    <div class="mb-4 sm:mb-6">
                        <label class="block mb-2 text-sm font-semibold text-gray-700">
                            รายละเอียดเหตุการณ์ (ถ้ามี)
                        </label>
>>>>>>> Stashed changes
                        <textarea v-model="description" rows="2"
                            class="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="อธิบายสิ่งที่เกิดขึ้น เช่น มีผู้บาดเจ็บ จุดที่เกิดเหตุ สภาพรถ ฯลฯ"></textarea>
                    </div>

                    <!-- Attachments -->
                    <div class="mb-4 sm:mb-6">
                            <label class="block mb-2 text-sm font-semibold text-gray-700">
                            แนบรูปภาพหรือวิดีโอเพิ่มเติม (ไม่บังคับ)
                        </label>
                        <input type="file" multiple accept="image/*,video/*"
                            class="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                            @change="onFilesChange" />
                        <p class="mt-1 text-xs text-gray-500">
                            รองรับไฟล์ภาพและวิดีโอ ขนาดไม่เกินประมาณ 20 MB ต่อไฟล์ (สูงสุด 5 ไฟล์)
                        </p>
                        <ul v-if="files.length" class="mt-2 text-xs text-gray-600 list-disc list-inside space-y-0.5">
                            <li v-for="file in files" :key="file.name + file.lastModified">
                                {{ file.name }}
                            </li>
                        </ul>
                    </div>

                    <!-- Location Status -->
                    <div class="p-4 mb-6 rounded-xl" :class="locationStatus.bgClass">
                        <div class="flex items-center gap-3">
                            <div class="flex-shrink-0">
                                <svg v-if="location" xmlns="http://www.w3.org/2000/svg"
                                    class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <svg v-else-if="locationLoading" class="w-5 h-5 text-yellow-600 animate-spin"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium" :class="locationStatus.textClass">
                                    {{ locationStatus.text }}
                                </p>
                                <p v-if="locationAddress" class="mt-1 text-xs text-gray-500">{{ locationAddress }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Warning -->
                    <div class="p-4 mb-6 border border-yellow-200 bg-yellow-50 rounded-xl">
                        <div class="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-5 h-5 mt-0.5 text-yellow-600"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-sm text-yellow-800">
                                การกดส่งรายงานจะส่งข้อมูลไปยังทีมงานทันที กรุณาใช้เฉพาะกรณีที่ต้องการให้ทีมงานติดตามจริงเท่านั้น
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 px-6 pb-6">
                    <button @click="closeModal"
                        class="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200">
                        ยกเลิก
                    </button>
                    <button @click="submitSOS" :disabled="!canSubmit || submitting"
                        class="flex-1 px-6 py-3 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="submitting">กำลังส่ง...</span>
                        <span v-else>ส่งรายงาน</span>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Success Modal -->
    <Teleport to="body">
        <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div class="w-full max-w-sm p-8 mx-4 text-center bg-white shadow-2xl rounded-2xl">
                <div
                    class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-green-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 class="mb-2 text-xl font-bold text-gray-900">ส่งคำขอสำเร็จ</h3>
                <p class="mb-6 text-gray-600">ทีมงานได้รับการแจ้งเตือนแล้ว กรุณารอความช่วยเหลือ</p>
                <button @click="showSuccessModal = false"
                    class="w-full px-6 py-3 font-semibold text-white transition-colors bg-green-600 rounded-xl hover:bg-green-700">
                    เข้าใจแล้ว
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { $api } = useNuxtApp()
const { user } = useAuth()

const showModal = ref(false)
const showSuccessModal = ref(false)
const selectedType = ref(null)
const incidentReason = ref('')
const description = ref('')
const files = ref(/** @type {File[]} */([]))
const location = ref(null)
const locationAddress = ref('')
const locationLoading = ref(false)
const submitting = ref(false)

const isDriver = computed(() => user.value?.role === 'DRIVER')

const emergencyTypes = [
    { value: 'ACCIDENT', label: 'เหตุอุบัติเหตุ / เฉี่ยวชน' },
    { value: 'MEDICAL', label: 'เหตุเจ็บป่วย / ต้องการแพทย์' },
    { value: 'THREAT', label: 'ไม่ปลอดภัย / ถูกคุกคาม' },
    { value: 'VEHICLE_BREAKDOWN', label: 'รถเสีย / ใช้งานต่อไม่ได้' },
    { value: 'OTHER', label: 'เหตุอื่น ๆ ที่ต้องการแจ้ง' }
]

const incidentReasons = [
    { value: 'NO_SHOW', label: 'ผู้โดยสารไม่มาตามนัด (No-show)' },
    { value: 'WRONG_MEETUP', label: 'จุดนัดพบผิด / หากันไม่เจอ' },
    { value: 'VEHICLE_ISSUE', label: 'รถเสีย / เกิดเหตุทำให้ไปต่อไม่ได้' },
    { value: 'ACCIDENT', label: 'อุบัติเหตุ / เฉี่ยวชน' },
    { value: 'PASSENGER_BEHAVIOR', label: 'ผู้โดยสารก้าวร้าว / เสี่ยงต่อความปลอดภัย' },
    { value: 'VEHICLE_DIRTY_DAMAGE', label: 'ทำรถสกปรก / เสียหาย' },
    { value: 'LOST_ITEM', label: 'ลืมของไว้ในรถ' },
    { value: 'PAYMENT_ISSUE', label: 'ปัญหาการชำระเงิน / ยอดไม่ถูกต้อง' }
]

const locationStatus = computed(() => {
    if (location.value) {
        return {
            text: 'ตำแหน่งของคุณพร้อมส่ง',
            bgClass: 'bg-green-50',
            textClass: 'text-green-700'
        }
    }
    if (locationLoading.value) {
        return {
            text: 'กำลังหาตำแหน่ง...',
            bgClass: 'bg-yellow-50',
            textClass: 'text-yellow-700'
        }
    }
    return {
        text: 'ไม่สามารถหาตำแหน่งได้',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700'
    }
})

const canSubmit = computed(() => selectedType.value && incidentReason.value && location.value)

const getLocation = () => {
    locationLoading.value = true
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                location.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
                locationLoading.value = false

                // Try to get address (optional)
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.value.latitude}&lon=${location.value.longitude}&accept-language=th`
                    )
                    const data = await response.json()
                    locationAddress.value = data.display_name || ''
                } catch (e) {
                    console.log('Could not get address')
                }
            },
            (error) => {
                console.error('Location error:', error)
                locationLoading.value = false
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    } else {
        locationLoading.value = false
    }
}

const closeModal = () => {
    showModal.value = false
    selectedType.value = null
    incidentReason.value = ''
    description.value = ''
    files.value = []
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_FILES = 5

const onFilesChange = (event) => {
    const list = event.target.files
    if (!list || !list.length) return

    const incoming = Array.from(list)
    const validNew = []
    const rejected = []

    incoming.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
            rejected.push(file.name)
        } else {
            validNew.push(file)
        }
    })

    let combined = [...files.value, ...validNew]

    if (combined.length > MAX_FILES) {
        toast.error('ไฟล์แนบเยอะเกินไป', `เลือกได้สูงสุด ${MAX_FILES} ไฟล์ต่อการแจ้งเหตุ`)
    }

    // จำกัดไม่เกิน MAX_FILES ไฟล์
    combined = combined.slice(0, MAX_FILES)
    files.value = combined

    if (rejected.length) {
        toast.error(
            'ไฟล์ขนาดเกินกำหนด',
            `ไฟล์ต่อไปนี้มีขนาดเกิน 20 MB และจะไม่ถูกแนบ: ${rejected.join(', ')}`
        )
    }

    // รีเซ็ต input เพื่อให้เลือกไฟล์ชุดเดิมซ้ำได้ถ้าต้องการ
    event.target.value = ''
}

const submitSOS = async () => {
    if (!canSubmit.value) return

    submitting.value = true
    try {
        const reasonLabel = incidentReasons.find(r => r.value === incidentReason.value)?.label
        const parts = []
        if (reasonLabel) parts.push(`[${reasonLabel}]`)
        if (description.value) parts.push(description.value)
        const fullDescription = parts.join(' ')

        const emergency = await $api('/emergency', {
            method: 'POST',
            body: {
                type: selectedType.value,
                description: fullDescription || null,
                latitude: location.value.latitude,
                longitude: location.value.longitude,
                address: locationAddress.value || null
            }
        })

        // อัปโหลดไฟล์แนบ (ถ้ามี)
        if (emergency?.id && files.value.length) {
            const formData = new FormData()
            files.value.forEach(file => {
                formData.append('files', file)
            })
            await $api(`/emergency/${emergency.id}/attachments`, {
                method: 'POST',
                body: formData
            })
        }

        closeModal()
        showSuccessModal.value = true
    } catch (error) {
        const msg = error.data?.message || error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
        if (msg.includes('active emergency')) {
            alert('คุณมีคำขอฉุกเฉินที่ยังดำเนินการอยู่ กรุณารอทีมงานติดต่อกลับ')
        } else {
            alert(msg)
        }
    } finally {
        submitting.value = false
    }
}

// Get location when modal opens
watch(showModal, (val) => {
    if (val) {
        getLocation()
    }
})
</script>


<style scoped>
@keyframes pulse-slow {
    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    50% {
        box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
    }
}

.animate-pulse-slow {
    animation: pulse-slow 2s infinite;
}
</style>
