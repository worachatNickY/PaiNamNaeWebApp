<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Admin Header -->
        <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-16">
            <div class="flex items-center justify-between h-full px-4">
                <div class="flex items-center gap-4">
                    <NuxtLink to="/" class="text-xl font-bold text-blue-600">
                        ไปนำแหน่ Admin
                    </NuxtLink>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-600">{{ user?.firstName || 'Admin' }}</span>
                    <button @click="logout" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                        Logout
                    </button>
                </div>
            </div>
        </header>

        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main id="main-content" class="pt-16 transition-all duration-300" style="margin-left: 280px;">
            <div class="p-6">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { user, logout } = useAuth()

useHead({
    link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }
    ]
})
</script>

<style>
* {
    font-family: 'Kanit', sans-serif;
}

.sidebar {
    width: 280px;
    transition: width 0.3s ease;
}

.sidebar.collapsed {
    width: 80px;
}

.sidebar.collapsed .sidebar-text {
    display: none;
}

.sidebar.collapsed .sidebar-item {
    justify-content: center;
}
</style>
