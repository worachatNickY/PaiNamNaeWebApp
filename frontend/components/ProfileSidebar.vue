<template>
    <aside class="w-80 bg-gray-50 p-6 border-r border-gray-200 hidden md:block">
        <div class="mb-8">
            <h1 class="text-xl font-bold text-gray-900 text-center mb-2">โปรไฟล์และการตั้งค่า</h1>
            <p class="text-sm text-gray-600 text-center">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี</p>
        </div>
        <nav class="space-y-4">
            <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2 px-4">การจัดการบัญชี</h3>
                <ul class="space-y-1">
                    <li>
                        <NuxtLink to="/profile" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            โปรไฟล์ของฉัน
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2 px-4">การยืนยันตัวตน</h3>
                <ul class="space-y-1">
                    <li>
                        <NuxtLink to="/profile/verification" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/verification') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            การยืนยันตัวตนขั้นพื้นฐาน
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/profile/driver-verification" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/driver-verification') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            การยืนยันตัวตนสำหรับผู้ขับขี่
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2 px-4">โหมดผู้ขับขี่</h3>
                <ul class="space-y-1">
                    <li>
                        <NuxtLink to="/profile/my-vehicle" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/my-vehicle') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            ข้อมูลรถยนต์ของฉัน
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/profile/emergency-contacts" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/emergency-contacts') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            ผู้ติดต่อฉุกเฉิน
                        </NuxtLink>
                    </li>
                    <li v-if="isDriver">
                        <NuxtLink to="/profile/driver-reports" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/driver-reports') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            รายงานเกี่ยวกับฉัน
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <!-- PBI #13: Report Driver -->
            <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2 px-4">ความช่วยเหลือ</h3>
                <ul class="space-y-1">
                    <li>
                        <NuxtLink to="/report-driver" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/report-driver') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            รายงานปัญหาคนขับ
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/profile/my-reports" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/my-reports') ? 'font-semibold text-blue-600 bg-blue-100' : 'text-gray-700 hover:bg-gray-100'">
                            รายงานของฉัน
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <!-- PBI #16: Account Deletion -->
            <div class="pt-4 mt-4 border-t border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900 mb-2 px-4">โซนอันตราย</h3>
                <ul class="space-y-1">
                    <li>
                        <NuxtLink to="/profile/delete-account" class="block px-4 py-2 text-sm rounded-md"
                            :class="isActive('/profile/delete-account') ? 'font-semibold text-red-600 bg-red-100' : 'text-red-600 hover:bg-red-50'">
                             ลบบัญชีของฉัน
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </nav>
    </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const { user } = useAuth();

// Check if user is a driver
const isDriver = computed(() => {
    return user.value?.role === 'DRIVER' || user.value?.role === 'ADMIN';
});

// Function to check if a menu item is active
const isActive = (path) => {
    return route.path === path;
};
</script>