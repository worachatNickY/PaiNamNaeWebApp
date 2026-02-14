<template>
    <div>
        <main class="min-h-screen pt-20 pb-10 bg-gray-50">
            <div class="max-w-3xl px-4 mx-auto">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-2xl font-bold text-gray-800">การแจ้งเตือนทั้งหมด</h1>
                    <button v-if="notifications.length > 0" @click="markAllAsRead" :disabled="isLoading"
                        class="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50">
                        อ่านทั้งหมด
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="isLoading && notifications.length === 0" class="py-12 text-center">
                    <div class="w-8 h-8 mx-auto border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <p class="mt-4 text-gray-500">กำลังโหลด...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="notifications.length === 0" class="py-12 text-center bg-white rounded-lg shadow-sm">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                        </path>
                    </svg>
                    <p class="mt-4 text-gray-500">ไม่มีการแจ้งเตือน</p>
                </div>

                <!-- Notifications List -->
                <div v-else class="space-y-3">
                    <div v-for="notification in notifications" :key="notification.id"
                        :class="[
                            'bg-white rounded-lg shadow-sm border transition-all',
                            notification.readAt ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                        ]">
                        <!-- Header (คลิกเพื่อขยาย/ย่อ) -->
                        <div @click="toggleExpand(notification)" 
                            class="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg">
                            <!-- Icon -->
                            <div :class="[
                                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                getNotificationIconClass(notification.type)
                            ]">
                                <i :class="getNotificationIcon(notification.type)"></i>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between">
                                    <h3 :class="[
                                        'font-medium',
                                        notification.readAt ? 'text-gray-800' : 'text-gray-900'
                                    ]">
                                        {{ notification.title }}
                                    </h3>
                                    <div class="flex items-center gap-2 ml-2">
                                        <span class="text-xs text-gray-400 whitespace-nowrap">
                                            {{ formatTime(notification.createdAt) }}
                                        </span>
                                        <i :class="[
                                            'fas text-gray-400 text-xs transition-transform',
                                            expandedId === notification.id ? 'fa-chevron-up' : 'fa-chevron-down'
                                        ]"></i>
                                    </div>
                                </div>
                                <p v-if="expandedId !== notification.id" class="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {{ notification.body }}
                                </p>
                                <div v-if="!notification.readAt && expandedId !== notification.id" class="mt-2">
                                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                        ยังไม่ได้อ่าน
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Expanded Content -->
                        <div v-if="expandedId === notification.id" 
                            class="px-4 pb-4 border-t border-gray-100">
                            <div class="pt-4 pl-14">
                                <!-- Full Body -->
                                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ notification.body }}</p>
                                
                                <!-- Metadata -->
                                <div class="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-500">
                                    <span>
                                        <i class="mr-1 fas fa-clock"></i>
                                        {{ formatDateTime(notification.createdAt) }}
                                    </span>
                                    <span v-if="notification.readAt">
                                        <i class="mr-1 fas fa-check-double text-green-500"></i>
                                        อ่านแล้ว
                                    </span>
                                    <span v-else class="text-blue-600">
                                        <i class="mr-1 fas fa-circle text-xs"></i>
                                        ยังไม่ได้อ่าน
                                    </span>
                                </div>

                                <!-- Actions -->
                                <div class="flex gap-2 mt-4">
                                    <button v-if="notification.link" @click.stop="goToLink(notification)"
                                        class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                        <i class="mr-1 fas fa-external-link-alt"></i>
                                        ดูรายละเอียด
                                    </button>
                                    <button v-if="!notification.readAt" @click.stop="markAsRead(notification.id)"
                                        class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <i class="mr-1 fas fa-check"></i>
                                        ทำเครื่องหมายว่าอ่านแล้ว
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Load More -->
                    <div v-if="hasMore" class="pt-4 text-center">
                        <button @click="loadMore" :disabled="isLoading"
                            class="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50">
                            {{ isLoading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม' }}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/th'

dayjs.extend(relativeTime)
dayjs.locale('th')

definePageMeta({
    middleware: 'auth'
})

const config = useRuntimeConfig()
const router = useRouter()

// State
const notifications = ref([])
const isLoading = ref(false)
const page = ref(1)
const hasMore = ref(false)
const expandedId = ref(null)

// Fetch notifications
const fetchNotifications = async (loadMore = false) => {
    isLoading.value = true
    try {
        const token = useCookie('token').value
        const response = await $fetch(`${config.public.apiBase}notifications?page=${page.value}&limit=20`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (loadMore) {
            notifications.value = [...notifications.value, ...response.data]
        } else {
            notifications.value = response.data
        }

        hasMore.value = response.pagination?.page < response.pagination?.totalPages
    } catch (error) {
        console.error('Failed to fetch notifications:', error)
    } finally {
        isLoading.value = false
    }
}

// Load more
const loadMore = () => {
    page.value++
    fetchNotifications(true)
}

// Mark as read
const markAsRead = async (notificationId) => {
    try {
        const token = useCookie('token').value
        await $fetch(`${config.public.apiBase}notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        })

        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
            notification.readAt = new Date().toISOString()
        }
    } catch (error) {
        console.error('Failed to mark as read:', error)
    }
}

// Mark all as read
const markAllAsRead = async () => {
    isLoading.value = true
    try {
        const token = useCookie('token').value
        await $fetch(`${config.public.apiBase}notifications/read-all`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        })

        notifications.value.forEach(n => {
            n.readAt = new Date().toISOString()
        })
    } catch (error) {
        console.error('Failed to mark all as read:', error)
    } finally {
        isLoading.value = false
    }
}

// Toggle expand
const toggleExpand = async (notification) => {
    if (expandedId.value === notification.id) {
        expandedId.value = null
    } else {
        expandedId.value = notification.id
        // Mark as read when expanded
        if (!notification.readAt) {
            await markAsRead(notification.id)
        }
    }
}

// Go to link
const goToLink = (notification) => {
    if (notification.link) {
        router.push(notification.link)
    }
}

// Helpers
const formatTime = (dateString) => {
    return dayjs(dateString).fromNow()
}

const formatDateTime = (dateString) => {
    return dayjs(dateString).format('D MMMM YYYY เวลา HH:mm น.')
}

const getNotificationIcon = (type) => {
    const icons = {
        SYSTEM: 'fas fa-bell',
        VERIFICATION: 'fas fa-id-card',
        BOOKING: 'fas fa-calendar-check',
        ROUTE: 'fas fa-route'
    }
    return icons[type] || 'fas fa-bell'
}

const getNotificationIconClass = (type) => {
    const classes = {
        SYSTEM: 'bg-blue-100 text-blue-600',
        VERIFICATION: 'bg-green-100 text-green-600',
        BOOKING: 'bg-purple-100 text-purple-600',
        ROUTE: 'bg-orange-100 text-orange-600'
    }
    return classes[type] || 'bg-gray-100 text-gray-600'
}

// Init
onMounted(() => {
    fetchNotifications()
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
