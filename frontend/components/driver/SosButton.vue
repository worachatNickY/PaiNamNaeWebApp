<template>
    <!-- Floating SOS Button -->
    <div v-if="isDriver" class="fixed z-50 bottom-6 right-6">
        <button @click="showModal = true"
            class="flex items-center justify-center w-16 h-16 text-white transition-all bg-red-600 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 animate-pulse-slow">
            <span class="text-xl font-bold">SOS</span>
        </button>
    </div>

    <!-- SOS Modal: responsive - scrollable body, fixed footer on small screens -->
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
            <div class="flex flex-col w-full max-w-md max-h-[90vh] sm:max-h-[85vh] mx-0 sm:mx-4 overflow-hidden bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl">
                <!-- Header -->
                <div class="flex-shrink-0 p-4 sm:p-6 text-center text-white bg-gradient-to-r from-red-600 to-red-700">
                    <div
                        class="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-4 border-4 border-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-bold">Emergency SOS</h2>
                    <p class="mt-1 sm:mt-2 text-sm sm:text-base text-red-100">ขอความช่วยเหลือฉุกเฉิน</p>
                </div>

                <!-- Body: scrollable on small screens -->
                <div class="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
                    <!-- Emergency Type Selection -->
                    <div class="mb-4 sm:mb-6">
                        <label class="block mb-2 sm:mb-3 text-sm font-semibold text-gray-700">ประเภทเหตุฉุกเฉิน</label>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            <button v-for="type in emergencyTypes" :key="type.value" @click="selectedType = type.value"
                                :class="[
                                    'p-3 sm:p-4 rounded-xl border-2 transition-all text-center',
                                    selectedType === type.value
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                ]">
                                <div class="flex justify-center mb-1 sm:mb-2">
                                    <!-- Accident -->
                                    <svg v-if="type.value === 'ACCIDENT'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-8 sm:h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <!-- Medical -->
                                    <svg v-else-if="type.value === 'MEDICAL'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-8 sm:h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <!-- Threat -->
                                    <svg v-else-if="type.value === 'THREAT'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-8 sm:h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <!-- Vehicle Breakdown -->
                                    <svg v-else-if="type.value === 'VEHICLE_BREAKDOWN'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-8 sm:h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <!-- Other -->
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-8 sm:h-8" :class="selectedType === type.value ? 'text-red-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div class="text-sm font-medium">{{ type.label }}</div>
                            </button>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mb-4 sm:mb-6">
                        <label class="block mb-2 text-sm font-semibold text-gray-700">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                        <textarea v-model="description" rows="2"
                            class="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="อธิบายสถานการณ์..."></textarea>
                    </div>

                    <!-- Location Status -->
                    <div class="p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl" :class="locationStatus.bgClass">
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
                    <div class="p-3 sm:p-4 mb-4 sm:mb-6 border border-yellow-200 bg-yellow-50 rounded-xl">
                        <div class="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-5 h-5 mt-0.5 text-yellow-600"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-sm text-yellow-800">
                                การกด SOS จะแจ้งเตือนไปยังทีมงานทันที กรุณาใช้เฉพาะกรณีฉุกเฉินจริงเท่านั้น
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Actions: always visible at bottom (flex-shrink-0) -->
                <div class="flex-shrink-0 flex gap-2 sm:gap-3 px-4 sm:px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 bg-white border-t border-gray-100">
                    <button @click="closeModal"
                        class="flex-1 px-4 sm:px-6 py-3 text-sm font-semibold text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200">
                        ยกเลิก
                    </button>
                    <button @click="submitSOS" :disabled="!canSubmit || submitting"
                        class="flex-1 px-4 sm:px-6 py-3 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="submitting">กำลังส่ง...</span>
                        <span v-else>ส่ง SOS</span>
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
import { ref, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

const { $api } = useNuxtApp()
const { user } = useAuth()
const { toast } = useToast()

const showModal = ref(false)
const showSuccessModal = ref(false)
const selectedType = ref(null)
const description = ref('')
const location = ref(null)
const locationAddress = ref('')
const locationLoading = ref(false)
const submitting = ref(false)

const isDriver = computed(() => user.value?.role === 'DRIVER')

const emergencyTypes = [
    { value: 'ACCIDENT', label: 'อุบัติเหตุ' },
    { value: 'MEDICAL', label: 'เจ็บป่วย' },
    { value: 'THREAT', label: 'ถูกคุกคาม' },
    { value: 'VEHICLE_BREAKDOWN', label: 'รถเสีย' },
    { value: 'OTHER', label: 'อื่นๆ' }
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

const canSubmit = computed(() => selectedType.value && location.value)

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

                // Try to get address (optional) - use backend API to avoid CORS
                try {
                    const response = await $api(`/maps/reverse-geocode?lat=${location.value.latitude}&lng=${location.value.longitude}`)
                    // Response structure: { success: true, data: { formatted_address: "...", ... } }
                    if (response?.formatted_address) {
                        locationAddress.value = response.formatted_address
                    } else if (response?.data?.formatted_address) {
                        locationAddress.value = response.data.formatted_address
                    }
                } catch (e) {
                    console.log('Could not get address:', e)
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
    description.value = ''
}

const submitSOS = async () => {
    if (!canSubmit.value) return

    submitting.value = true
    try {
        await $api('/emergency', {
            method: 'POST',
            body: {
                type: selectedType.value,
                description: description.value || null,
                latitude: location.value.latitude,
                longitude: location.value.longitude,
                address: locationAddress.value || null
            }
        })

        closeModal()
        showSuccessModal.value = true
    } catch (error) {
        const msg = error.data?.message || error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
        if (msg.includes('active emergency') || msg.includes('active emergency request')) {
            toast.error('ไม่สามารถส่งได้', 'คุณมีคำขอฉุกเฉินที่ยังดำเนินการอยู่ กรุณารอทีมงานติดต่อกลับ')
        } else if (error.statusCode === 403) {
            toast.error('ไม่มีสิทธิ์', 'เฉพาะผู้ขับขี่ที่ยืนยันตัวตนแล้วเท่านั้นที่สามารถส่ง SOS ได้')
        } else {
            toast.error('ส่ง SOS ไม่สำเร็จ', msg)
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
