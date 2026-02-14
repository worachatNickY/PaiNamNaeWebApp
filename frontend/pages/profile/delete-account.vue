<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">

                <ProfileSidebar />

                <main class="flex-1 p-8">
                    <!-- Banner แจ้งเตือนถ้าอยู่ในสถานะ Pending Deletion -->
                    <div v-if="deletionStatus?.isPendingDeletion" 
                        class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div class="flex items-start gap-3">
                            <div class="text-2xl">⚠️</div>
                            <div class="flex-1">
                                <h3 class="font-semibold text-amber-800">บัญชีของคุณอยู่ในคิวรอการลบ</h3>
                                <p class="text-sm text-amber-700 mt-1">
                                    บัญชีจะถูกลบถาวรใน <strong>{{ deletionStatus.daysRemaining }} วัน</strong>
                                    ({{ formatDate(deletionStatus.scheduledDeleteAt) }})
                                </p>
                                <button @click="handleCancelDelete" :disabled="isLoading"
                                    class="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50">
                                    {{ isLoading ? 'กำลังดำเนินการ...' : 'ยกเลิกการลบบัญชี' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: เลือกเหตุผล -->
                    <div v-if="currentStep === 1 && !deletionStatus?.isPendingDeletion">
                        <div class="mb-8 text-center">
                            <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
                                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                    </path>
                                </svg>
                            </div>
                            <h1 class="mb-2 text-3xl font-bold text-gray-800">ลบบัญชีของคุณ</h1>
                            <p class="max-w-md mx-auto text-gray-600">
                                เราเสียใจที่คุณต้องการจากไป กรุณาบอกเหตุผลเพื่อช่วยให้เราปรับปรุงบริการ
                            </p>
                        </div>

                        <!-- คำเตือน -->
                        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 class="font-semibold text-red-800 mb-2">⚠️ คำเตือนก่อนลบบัญชี</h3>
                            <ul class="text-sm text-red-700 space-y-1">
                                <li>• ข้อมูลส่วนตัวทั้งหมดจะถูกลบถาวร</li>
                                <li>• ประวัติการเดินทางจะหายไป</li>
                                <li>• ไม่สามารถกู้คืนได้หลัง 30 วัน</li>
                                <li>• หากมีการจองที่ยังไม่เสร็จสิ้น จะถูกยกเลิกทั้งหมด</li>
                            </ul>
                        </div>

                        <!-- เลือกเหตุผล -->
                        <div class="space-y-4">
                            <label class="block text-sm font-medium text-gray-700">
                                เหตุผลในการลบบัญชี <span class="text-red-500">*</span>
                            </label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button v-for="reason in deleteReasons" :key="reason.value"
                                    @click="selectedReason = reason.value"
                                    :class="[
                                        'p-4 text-left border rounded-lg transition-all',
                                        selectedReason === reason.value
                                            ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    ]">
                                    <span class="font-medium text-gray-800">{{ reason.label }}</span>
                                </button>
                            </div>

                            <!-- กรอกเหตุผลเพิ่มเติม (ถ้าเลือก OTHER) -->
                            <div v-if="selectedReason === 'OTHER'" class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    กรุณาระบุเหตุผล <span class="text-red-500">*</span>
                                </label>
                                <textarea v-model="otherReason" rows="3" placeholder="บอกเราว่าทำไมคุณถึงต้องการลบบัญชี..."
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                </textarea>
                            </div>
                        </div>

                        <!-- ปุ่มดำเนินการ -->
                        <div class="flex justify-end gap-4 mt-8 pt-6 border-t">
                            <NuxtLink to="/profile"
                                class="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                ยกเลิก
                            </NuxtLink>
                            <button @click="handleRequestDelete" :disabled="!canProceed || isLoading"
                                class="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {{ isLoading ? 'กำลังดำเนินการ...' : 'ดำเนินการต่อ' }}
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: ยืนยัน OTP -->
                    <div v-if="currentStep === 2">
                        <div class="max-w-md mx-auto">
                            <div class="mb-8 text-center">
                                <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
                                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                                        </path>
                                    </svg>
                                </div>
                                <h1 class="mb-2 text-2xl font-bold text-gray-800">ยืนยันตัวตน</h1>
                                <p class="text-gray-600">
                                    กรอกรหัส OTP 6 หลักที่ส่งไปยัง<br>
                                    <span class="font-semibold">{{ maskedPhone }}</span>
                                </p>
                            </div>

                            <!-- OTP Input -->
                            <div class="flex justify-center gap-2 mb-4">
                                <input v-for="(digit, index) in 6" :key="index"
                                    :ref="el => otpInputs[index] = el"
                                    v-model="otpDigits[index]"
                                    type="text" maxlength="1" inputmode="numeric"
                                    @input="handleOtpInput(index)"
                                    @keydown="handleOtpKeydown($event, index)"
                                    @paste="handleOtpPaste"
                                    class="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>

                            <!-- Countdown -->
                            <div class="text-center mb-6">
                                <p v-if="countdown > 0" class="text-gray-600">
                                    รหัสจะหมดอายุใน <span class="font-semibold text-red-600">{{ formatCountdown }}</span>
                                </p>
                                <p v-else class="text-red-600">รหัส OTP หมดอายุแล้ว</p>
                            </div>

                            <!-- Resend OTP -->
                            <div class="text-center mb-6">
                                <button @click="handleResendOTP" :disabled="isLoading || countdown > 240"
                                    class="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed">
                                    {{ countdown > 240 ? `ส่ง OTP ใหม่ได้ใน ${countdown - 240} วินาที` : 'ไม่ได้รับ OTP? ส่งใหม่' }}
                                </button>
                            </div>

                            <!-- DEV: แสดง OTP (ลบใน production) -->
                            <div v-if="devOtp" class="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                <p class="text-xs text-yellow-700"> DEV MODE - OTP: <span class="font-mono font-bold">{{ devOtp }}</span></p>
                            </div>

                            <!-- ปุ่ม -->
                            <div class="flex gap-4">
                                <button @click="currentStep = 1"
                                    class="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    ย้อนกลับ
                                </button>
                                <button @click="handleVerifyOTP" :disabled="otpCode.length !== 6 || isLoading"
                                    class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                                    {{ isLoading ? 'กำลังตรวจสอบ...' : 'ยืนยัน' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: ยืนยันการลบ -->
                    <div v-if="currentStep === 3">
                        <div class="max-w-md mx-auto text-center">
                            <div class="inline-flex items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full">
                                <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                                    </path>
                                </svg>
                            </div>
                            <h1 class="mb-4 text-2xl font-bold text-gray-800">ยืนยันการลบบัญชี</h1>
                            <p class="text-gray-600 mb-8">
                                คุณกำลังจะลบบัญชีของคุณ การดำเนินการนี้<br>
                                <span class="font-semibold text-red-600">ไม่สามารถย้อนกลับได้หลัง 30 วัน</span>
                            </p>

                            <div class="flex gap-4">
                                <button @click="currentStep = 1"
                                    class="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    ยกเลิก
                                </button>
                                <button @click="handleConfirmDelete" :disabled="isLoading"
                                    class="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                                    {{ isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันลบบัญชี' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 4: สำเร็จ -->
                    <div v-if="currentStep === 4">
                        <div class="max-w-md mx-auto text-center">
                            <div class="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
                                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h1 class="mb-4 text-2xl font-bold text-gray-800">ดำเนินการเรียบร้อย</h1>
                            <p class="text-gray-600 mb-2">บัญชีของคุณจะถูกลบถาวรในวันที่</p>
                            <p class="text-xl font-bold text-red-600 mb-6">{{ formatDate(deletionDate) }}</p>
                            <p class="text-sm text-gray-500 mb-8">
                                หากเปลี่ยนใจ สามารถ Login กลับมายกเลิกได้ก่อนวันดังกล่าว
                            </p>

                            <button @click="handleLogout"
                                class="w-full px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';
import ProfileSidebar from '~/components/ProfileSidebar.vue';
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

definePageMeta({
    middleware: 'auth'
});

const { $api } = useNuxtApp()
const { logout } = useAuth()
const { toast } = useToast();
const router = useRouter()

// State
const currentStep = ref(1)
const isLoading = ref(false)
const selectedReason = ref(null)
const otherReason = ref('')
const otpRef = ref('')
const maskedPhone = ref('')
const devOtp = ref('')
const deleteToken = ref('')
const deletionDate = ref(null)
const countdown = ref(0)
const deletionStatus = ref(null)

// OTP inputs
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])

const otpCode = computed(() => otpDigits.value.join(''))

const deleteReasons = [
    { value: 'NOT_USING_ANYMORE', label: 'ไม่ได้ใช้งานแล้ว' },
    { value: 'PRIVACY_CONCERN', label: 'กังวลเรื่องความเป็นส่วนตัว' },
    { value: 'FOUND_ALTERNATIVE', label: 'ใช้แอปอื่นแทน' },
    { value: 'BAD_EXPERIENCE', label: 'ประสบการณ์ไม่ดี' },
    { value: 'TOO_MANY_NOTIFICATIONS', label: 'แจ้งเตือนเยอะเกินไป' },
    { value: 'OTHER', label: 'เหตุผลอื่น' },
]

const canProceed = computed(() => {
    if (!selectedReason.value) return false
    if (selectedReason.value === 'OTHER' && !otherReason.value.trim()) return false
    return true
})

const formatCountdown = computed(() => {
    const minutes = Math.floor(countdown.value / 60)
    const seconds = countdown.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Countdown timer
let countdownInterval = null
const startCountdown = (seconds) => {
    countdown.value = seconds
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--
        } else {
            clearInterval(countdownInterval)
        }
    }, 1000)
}

// Fetch deletion status on mount
onMounted(async () => {
    try {
        // $api plugin จะ unwrap response.data อัตโนมัติ
        const response = await $api('/account/deletion-status')
        deletionStatus.value = response
    } catch (error) {
        console.error('Failed to fetch deletion status:', error)
    }
})

// Format date
const formatDate = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).format('D MMMM YYYY')
}

// Step 1: Request Delete
const handleRequestDelete = async () => {
    isLoading.value = true
    try {
        const response = await $api('/account/request-delete', {
            method: 'POST',
            body: {
                reason: selectedReason.value,
                otherReason: selectedReason.value === 'OTHER' ? otherReason.value : undefined
            }
        })

        otpRef.value = response.otpRef
        maskedPhone.value = response.maskedPhone
        devOtp.value = response.devOtp || ''
        startCountdown(response.expiresIn)
        currentStep.value = 2
        toast.success('ส่ง OTP แล้ว', 'กรุณาตรวจสอบ SMS ของคุณ')
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถส่งคำขอได้')
    } finally {
        isLoading.value = false
    }
}

// Step 2: Verify OTP
const handleVerifyOTP = async () => {
    isLoading.value = true
    try {
        const response = await $api('/account/verify-delete', {
            method: 'POST',
            body: {
                otp: otpCode.value,
                otpRef: otpRef.value
            }
        })

        deleteToken.value = response.deleteToken
        currentStep.value = 3
        toast.success('ยืนยัน OTP สำเร็จ', '')
    } catch (error) {
        toast.error('OTP ไม่ถูกต้อง', error.data?.message || 'กรุณาลองใหม่')
        otpDigits.value = ['', '', '', '', '', '']
        otpInputs.value[0]?.focus()
    } finally {
        isLoading.value = false
    }
}

// Step 3: Confirm Delete
const handleConfirmDelete = async () => {
    isLoading.value = true
    try {
        const response = await $api('/account/confirm', {
            method: 'DELETE',
            body: {
                deleteToken: deleteToken.value
            }
        })

        deletionDate.value = response.deletionDate
        currentStep.value = 4
        toast.success('ดำเนินการสำเร็จ', 'บัญชีของคุณถูกกำหนดให้ลบแล้ว')
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถดำเนินการได้')
    } finally {
        isLoading.value = false
    }
}

// Cancel Delete
const handleCancelDelete = async () => {
    isLoading.value = true
    try {
        await $api('/account/cancel-delete', {
            method: 'POST'
        })

        deletionStatus.value = { isPendingDeletion: false }
        toast.success('ยกเลิกสำเร็จ', 'บัญชีของคุณจะไม่ถูกลบแล้ว')
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถยกเลิกได้')
    } finally {
        isLoading.value = false
    }
}

// Resend OTP
const handleResendOTP = async () => {
    isLoading.value = true
    try {
        const response = await $api('/account/resend-otp', {
            method: 'POST'
        })

        otpRef.value = response.otpRef
        devOtp.value = response.devOtp || ''
        startCountdown(response.expiresIn)
        otpDigits.value = ['', '', '', '', '', '']
        toast.success('ส่ง OTP ใหม่แล้ว', '')
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถส่ง OTP ได้')
    } finally {
        isLoading.value = false
    }
}

// Logout
const handleLogout = () => {
    logout()
    router.push('/')
}

// OTP Input handlers
const handleOtpInput = (index) => {
    const value = otpDigits.value[index]
    if (value && index < 5) {
        otpInputs.value[index + 1]?.focus()
    }
}

const handleOtpKeydown = (event, index) => {
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        otpInputs.value[index - 1]?.focus()
    }
}

const handleOtpPaste = (event) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    pastedData.split('').forEach((char, index) => {
        if (index < 6) {
            otpDigits.value[index] = char
        }
    })
}

// Cleanup
onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style scoped>
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
