<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8 bg-gray-50">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProfileSidebar />
                
                <main class="flex-1 p-8">
                    <!-- Header -->
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                        <p class="mt-2 text-gray-600">เบอร์ติดต่อฉุกเฉินของคุณ เพื่อใช้ในกรณีเกิดเหตุการณ์ไม่คาดฝัน</p>
                    </div>

                    <!-- Add Contact Form -->
                    <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
                        <h3 class="mb-4 text-lg font-semibold text-gray-900">
                            {{ editingContact ? 'แก้ไขผู้ติดต่อ' : 'เพิ่มผู้ติดต่อใหม่' }}
                        </h3>
                        <form @submit.prevent="saveContact" class="space-y-4">
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label class="block mb-1 text-sm font-medium text-gray-700">ชื่อ</label>
                                    <input v-model="form.name" type="text" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="ชื่อผู้ติดต่อ" />
                                </div>
                                <div>
                                    <label class="block mb-1 text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                    <input v-model="form.phone" type="tel" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="08x-xxx-xxxx" />
                                </div>
                            </div>
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label class="block mb-1 text-sm font-medium text-gray-700">ความสัมพันธ์</label>
                                    <select v-model="form.relationship"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">เลือกความสัมพันธ์</option>
                                        <option value="พ่อ">พ่อ</option>
                                        <option value="แม่">แม่</option>
                                        <option value="พี่/น้อง">พี่/น้อง</option>
                                        <option value="คู่สมรส">คู่สมรส</option>
                                        <option value="เพื่อน">เพื่อน</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                                <div class="flex items-center mt-6">
                                    <input v-model="form.isPrimary" type="checkbox" id="isPrimary"
                                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <label for="isPrimary" class="ml-2 text-sm text-gray-700">ตั้งเป็นผู้ติดต่อหลัก</label>
                                </div>
                            </div>
                            <div class="flex justify-end gap-3 pt-4">
                                <button v-if="editingContact" type="button" @click="cancelEdit"
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    ยกเลิก
                                </button>
                                <button type="submit" :disabled="saving"
                                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {{ saving ? 'กำลังบันทึก...' : (editingContact ? 'อัพเดท' : 'เพิ่มผู้ติดต่อ') }}
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Contacts List -->
                    <div class="bg-white border border-gray-300 rounded-lg shadow-md">
                        <div class="p-6 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900">รายชื่อผู้ติดต่อฉุกเฉิน</h3>
                        </div>

                        <div v-if="loading" class="p-12 text-center text-gray-500">
                            กำลังโหลด...
                        </div>

                        <div v-else-if="contacts.length === 0" class="p-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p class="text-gray-500">ยังไม่มีผู้ติดต่อฉุกเฉิน</p>
                            <p class="mt-1 text-sm text-gray-400">เพิ่มผู้ติดต่อเพื่อใช้ในกรณีฉุกเฉิน</p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div v-for="contact in contacts" :key="contact.id"
                                class="flex items-center justify-between p-6 transition-colors hover:bg-gray-50">
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 text-blue-600 bg-blue-100 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium text-gray-900">{{ contact.name }}</span>
                                            <span v-if="contact.isPrimary"
                                                class="px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                                                หลัก
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-600">{{ contact.phone }}</p>
                                        <p v-if="contact.relationship" class="text-xs text-gray-400">{{ contact.relationship }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <a :href="`tel:${contact.phone}`"
                                        class="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </a>
                                    <button @click="editContact(contact)"
                                        class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button @click="deleteContact(contact.id)"
                                        class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Emergency Info -->
                    <div class="p-6 mt-8 border border-red-200 bg-red-50 rounded-xl">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold text-red-800">เบอร์ฉุกเฉินประเทศไทย</h4>
                                <ul class="mt-2 space-y-1 text-sm text-red-700">
                                    <li><strong>1669</strong> - สายด่วนการแพทย์ฉุกเฉิน</li>
                                    <li><strong>191</strong> - ตำรวจ</li>
                                    <li><strong>199</strong> - ดับเพลิง</li>
                                    <li><strong>1554</strong> - กรมทางหลวง (เรื่องถนน)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'

definePageMeta({
    middleware: 'auth'
})

const { toast } = useToast()
const { $api } = useNuxtApp()

const contacts = ref([])
const loading = ref(true)
const saving = ref(false)
const editingContact = ref(null)

const form = ref({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false
})

const fetchContacts = async () => {
    loading.value = true
    try {
        const response = await $api('/emergency/contacts')
        contacts.value = response.data || []
    } catch (error) {
        console.error('Failed to fetch contacts:', error)
    } finally {
        loading.value = false
    }
}

const saveContact = async () => {
    saving.value = true
    try {
        const payload = {
            ...form.value,
            id: editingContact.value?.id
        }
        await $api('/emergency/contacts', {
            method: 'POST',
            body: payload
        })
        await fetchContacts()
        resetForm()
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถดำเนินการได้')
    } finally {
        saving.value = false
    }
}

const editContact = (contact) => {
    editingContact.value = contact
    form.value = {
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || '',
        isPrimary: contact.isPrimary
    }
}

const cancelEdit = () => {
    editingContact.value = null
    resetForm()
}

const deleteContact = async (id) => {
    if (!confirm('คุณต้องการลบผู้ติดต่อนี้หรือไม่?')) return

    try {
        await $api(`/emergency/contacts/${id}`, { method: 'DELETE' })
        await fetchContacts()
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถดำเนินการได้')
    }
}

const resetForm = () => {
    form.value = { name: '', phone: '', relationship: '', isPrimary: false }
    editingContact.value = null
}

onMounted(fetchContacts)
</script>
