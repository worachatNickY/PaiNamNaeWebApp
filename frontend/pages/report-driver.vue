<template>
    <div>
        <div class="flex items-center justify-center min-h-screen py-8 bg-gray-50">
            <div class="flex w-full max-w-6xl mx-4 overflow-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                <ProfileSidebar />
                
                <main class="flex-1 p-8">
                    <!-- Header -->
                    <div class="mb-6">
                        <h1 class="text-2xl font-bold text-gray-900">รายงานพฤติกรรมคนขับ</h1>
                        <p class="mt-2 text-gray-600">กรุณาให้ข้อมูลที่เป็นความจริงเพื่อช่วยปรับปรุงคุณภาพบริการ</p>
                    </div>

                    <!-- Step Indicator -->
                    <div class="flex items-center justify-center gap-4 mb-8">
                        <div v-for="(step, idx) in steps" :key="idx"
                            class="flex items-center gap-2"
                            :class="currentStep >= idx ? 'text-blue-600' : 'text-gray-400'">
                            <div class="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full"
                                :class="currentStep >= idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'">
                                {{ idx + 1 }}
                            </div>
                            <span class="hidden text-sm font-medium sm:inline">{{ step }}</span>
                            <svg v-if="idx < steps.length - 1" xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4 ml-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    <!-- Form Card -->
                    <div class="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
                        <!-- Step 1: Select Category -->
                        <div v-if="currentStep === 0" class="p-6">
                            <h2 class="mb-6 text-lg font-semibold text-gray-900">เลือกหมวดหมู่ปัญหา</h2>
                            <div class="grid grid-cols-2 gap-3">
                                <button v-for="(label, key) in categories" :key="key"
                                    @click="selectCategory(key)"
                                    class="p-4 text-center transition-all border-2 rounded-xl hover:border-gray-300"
                                    :class="form.category === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                                    <div class="flex justify-center mb-2">
                                        <!-- DRIVING_BEHAVIOR - รถ -->
                                        <svg v-if="key === 'DRIVING_BEHAVIOR'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 17h.01M16 17h.01M3 11l1.5-5.5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 11M3 11h18M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6" />
                                        </svg>
                                        <!-- VEHICLE_CONDITION - เครื่องมือ -->
                                        <svg v-else-if="key === 'VEHICLE_CONDITION'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                        </svg>
                                        <!-- SERVICE_QUALITY - ดาว -->
                                        <svg v-else-if="key === 'SERVICE_QUALITY'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                        <!-- SAFETY_CONCERN - โล่ -->
                                        <svg v-else-if="key === 'SAFETY_CONCERN'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                                        </svg>
                                        <!-- PAYMENT_ISSUE - เงิน -->
                                        <svg v-else-if="key === 'PAYMENT_ISSUE'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                        </svg>
                                        <!-- OTHER - คำถาม -->
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.category === key ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div class="text-sm font-medium" :class="form.category === key ? 'text-blue-600' : 'text-gray-700'">{{ label }}</div>
                                </button>
                            </div>
                        </div>

                        <!-- Step 2: Select Type -->
                        <div v-else-if="currentStep === 1" class="p-6">
                            <h2 class="mb-2 text-lg font-semibold text-gray-900">ระบุปัญหาที่พบ</h2>
                            <p class="mb-6 text-sm text-gray-500">หมวดหมู่: {{ categories[form.category] }}</p>
                            <div class="grid grid-cols-2 gap-3">
                                <button v-for="typeKey in typesByCategory[form.category]" :key="typeKey"
                                    @click="selectType(typeKey)"
                                    class="p-4 text-center transition-all border-2 rounded-xl hover:border-gray-300"
                                    :class="form.type === typeKey ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                                    <div class="flex justify-center mb-2">
                                        <!-- Type Icons -->
                                        <svg v-if="typeKey === 'SPEEDING'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                        <svg v-else-if="typeKey === 'RECKLESS_DRIVING'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                        <svg v-else-if="typeKey === 'PHONE_WHILE_DRIVING'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                        </svg>
                                        <svg v-else-if="typeKey === 'LATE_ARRIVAL'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg v-else-if="typeKey === 'OVERCHARGING'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div class="text-sm font-medium" :class="form.type === typeKey ? 'text-blue-600' : 'text-gray-700'">{{ types[typeKey] }}</div>
                                </button>
                            </div>
                        </div>

                        <!-- Step 3: Details -->
                        <div v-else-if="currentStep === 2" class="p-6">
                            <h2 class="mb-6 text-lg font-semibold text-gray-900">รายละเอียดเพิ่มเติม</h2>
                            
                            <!-- Driver Search -->
                            <div class="mb-6" v-if="!driverId">
                                <label class="block mb-2 text-sm font-medium text-gray-700">ค้นหาคนขับ *</label>
                                <div class="relative">
                                    <input v-model="driverSearch" type="text"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="พิมพ์ชื่อหรือ username ของคนขับ..."
                                        @input="searchDrivers" />
                                    <div v-if="searchingDrivers" class="absolute right-3 top-3.5">
                                        <svg class="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <!-- Search Results -->
                                <div v-if="driverResults.length > 0" class="mt-2 overflow-hidden border border-gray-200 rounded-xl">
                                    <button v-for="driver in driverResults" :key="driver.id"
                                        @click="selectDriver(driver)"
                                        class="flex items-center w-full gap-3 p-3 text-left transition-colors hover:bg-gray-50">
                                        <img v-if="driver.profilePicture" :src="driver.profilePicture"
                                            class="object-cover w-10 h-10 rounded-full" />
                                        <div v-else class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900">{{ driver.firstName }} {{ driver.lastName }}</p>
                                            <p class="text-sm text-gray-500">@{{ driver.username }}</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <!-- Selected Driver -->
                            <div v-if="selectedDriver" class="p-4 mb-6 border border-blue-200 bg-blue-50 rounded-xl">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <img v-if="selectedDriver.profilePicture" :src="selectedDriver.profilePicture"
                                            class="object-cover w-12 h-12 rounded-full" />
                                        <div v-else class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-semibold text-gray-900">{{ selectedDriver.firstName }} {{ selectedDriver.lastName }}</p>
                                            <p class="text-sm text-gray-600">คนขับที่จะรายงาน</p>
                                        </div>
                                    </div>
                                    <button v-if="!driverId" @click="clearDriver"
                                        class="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="mb-6">
                                <label class="block mb-2 text-sm font-medium text-gray-700">
                                    อธิบายรายละเอียด * <span class="text-gray-400">(อย่างน้อย 10 ตัวอักษร)</span>
                                </label>
                                <textarea v-model="form.description" rows="4"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="กรุณาอธิบายสิ่งที่เกิดขึ้นอย่างละเอียด เช่น เวลา สถานที่ พฤติกรรมที่พบ..."></textarea>
                                <p class="mt-1 text-sm text-gray-500">{{ form.description.length }}/1000</p>
                            </div>

                            <!-- Warning -->
                            <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                                <div class="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-5 h-5 mt-0.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div class="text-sm text-yellow-800">
                                        <p class="font-medium">ข้อมูลที่ให้มาจะถูกส่งไปยังทีมงานเพื่อตรวจสอบ</p>
                                        <p class="mt-1">กรุณาให้ข้อมูลที่เป็นความจริง การให้ข้อมูลเท็จอาจส่งผลต่อบัญชีของคุณ</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Confirm -->
                        <div v-else-if="currentStep === 3" class="p-6">
                            <h2 class="mb-6 text-lg font-semibold text-gray-900">ตรวจสอบข้อมูล</h2>
                            
                            <div class="space-y-4">
                                <div class="p-4 rounded-xl bg-gray-50">
                                    <p class="text-sm text-gray-500">หมวดหมู่</p>
                                    <p class="font-medium text-gray-900">{{ categories[form.category] }}</p>
                                </div>
                                <div class="p-4 rounded-xl bg-gray-50">
                                    <p class="text-sm text-gray-500">ประเภทปัญหา</p>
                                    <p class="font-medium text-gray-900">{{ types[form.type] }}</p>
                                </div>
                                <div class="p-4 rounded-xl bg-gray-50">
                                    <p class="text-sm text-gray-500">คนขับที่รายงาน</p>
                                    <p class="font-medium text-gray-900">{{ selectedDriver?.firstName }} {{ selectedDriver?.lastName }}</p>
                                </div>
                                <div class="p-4 rounded-xl bg-gray-50">
                                    <p class="text-sm text-gray-500">รายละเอียด</p>
                                    <p class="font-medium text-gray-900 whitespace-pre-wrap">{{ form.description }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation Buttons -->
                        <div class="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <button v-if="currentStep > 0" @click="prevStep"
                                class="px-6 py-3 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                                ย้อนกลับ
                            </button>
                            <div class="flex-1"></div>
                            <button v-if="currentStep < 3" @click="nextStep" :disabled="!canProceed"
                                class="px-6 py-3 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                ถัดไป
                            </button>
                            <button v-else @click="submitReport" :disabled="submitting"
                                class="px-6 py-3 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
                                {{ submitting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Success Modal -->
        <Teleport to="body">
            <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div class="w-full max-w-sm p-8 mx-4 text-center bg-white shadow-2xl rounded-2xl">
                    <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 class="mb-2 text-xl font-bold text-gray-900">ส่งรายงานสำเร็จ</h3>
                    <p class="mb-6 text-gray-600">ขอบคุณสำหรับข้อมูล ทีมงานจะตรวจสอบและดำเนินการต่อไป</p>
                    <NuxtLink to="/"
                        class="inline-block w-full px-6 py-3 font-semibold text-white transition-colors bg-green-600 rounded-xl hover:bg-green-700">
                        กลับหน้าหลัก
                    </NuxtLink>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const { $api } = useNuxtApp()

// Get driverId from query params (if coming from booking)
const driverId = route.query.driverId
const bookingId = route.query.bookingId

const steps = ['หมวดหมู่', 'ประเภท', 'รายละเอียด', 'ยืนยัน']
const currentStep = ref(0)
const submitting = ref(false)
const showSuccess = ref(false)

const form = ref({
    category: '',
    type: '',
    description: '',
    driverId: driverId || '',
    bookingId: bookingId || null
})

const categories = {
    DRIVING_BEHAVIOR: 'พฤติกรรมการขับขี่',
    VEHICLE_CONDITION: 'สภาพรถ',
    SERVICE_QUALITY: 'คุณภาพบริการ',
    SAFETY_CONCERN: 'ความปลอดภัย',
    PAYMENT_ISSUE: 'ปัญหาการเงิน',
    OTHER: 'อื่นๆ'
}

const types = {
    SPEEDING: 'ขับรถเร็วเกินไป',
    RECKLESS_DRIVING: 'ขับรถประมาท',
    PHONE_WHILE_DRIVING: 'ใช้โทรศัพท์ขณะขับรถ',
    DIRTY_VEHICLE: 'รถไม่สะอาด',
    VEHICLE_MALFUNCTION: 'รถมีปัญหา/ชำรุด',
    BAD_SMELL: 'รถมีกลิ่นไม่พึงประสงค์',
    RUDE_BEHAVIOR: 'พูดจาไม่สุภาพ',
    UNPROFESSIONAL: 'ไม่เป็นมืออาชีพ',
    LATE_ARRIVAL: 'มาสาย',
    WRONG_ROUTE: 'ไม่ตามเส้นทาง',
    UNSAFE_FEELING: 'รู้สึกไม่ปลอดภัย',
    HARASSMENT: 'ถูกคุกคาม',
    INTOXICATED: 'สงสัยว่าเมา',
    OVERCHARGING: 'เรียกเก็บเงินเกิน',
    REFUSED_PAYMENT_METHOD: 'ไม่รับวิธีชำระเงิน',
    NO_SHOW: 'ไม่มารับ',
    OTHER: 'อื่นๆ'
}

const typesByCategory = {
    DRIVING_BEHAVIOR: ['SPEEDING', 'RECKLESS_DRIVING', 'PHONE_WHILE_DRIVING'],
    VEHICLE_CONDITION: ['DIRTY_VEHICLE', 'VEHICLE_MALFUNCTION', 'BAD_SMELL'],
    SERVICE_QUALITY: ['RUDE_BEHAVIOR', 'UNPROFESSIONAL', 'LATE_ARRIVAL', 'WRONG_ROUTE'],
    SAFETY_CONCERN: ['UNSAFE_FEELING', 'HARASSMENT', 'INTOXICATED'],
    PAYMENT_ISSUE: ['OVERCHARGING', 'REFUSED_PAYMENT_METHOD'],
    OTHER: ['NO_SHOW', 'OTHER']
}

// Driver search
const driverSearch = ref('')
const driverResults = ref([])
const searchingDrivers = ref(false)
const selectedDriver = ref(null)
let searchTimeout = null

const canProceed = computed(() => {
    switch (currentStep.value) {
        case 0: return !!form.value.category
        case 1: return !!form.value.type
        case 2: return !!selectedDriver.value && form.value.description.length >= 10
        default: return true
    }
})

const selectCategory = (key) => {
    form.value.category = key
    form.value.type = '' // Reset type when category changes
}

const selectType = (key) => {
    form.value.type = key
}

const nextStep = () => {
    if (canProceed.value && currentStep.value < 3) {
        currentStep.value++
    }
}

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--
    }
}

const searchDrivers = async () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    
    if (driverSearch.value.length < 2) {
        driverResults.value = []
        return
    }

    searchTimeout = setTimeout(async () => {
        searchingDrivers.value = true
        try {
            const response = await $api(`/users/search?q=${encodeURIComponent(driverSearch.value)}&role=DRIVER`)
            driverResults.value = response || []
        } catch (error) {
            console.error('Search error:', error)
            driverResults.value = []
        } finally {
            searchingDrivers.value = false
        }
    }, 300)
}

const selectDriver = (driver) => {
    selectedDriver.value = driver
    form.value.driverId = driver.id
    driverResults.value = []
    driverSearch.value = ''
}

const clearDriver = () => {
    selectedDriver.value = null
    form.value.driverId = ''
}

const submitReport = async () => {
    submitting.value = true
    try {
        await $api('/reports', {
            method: 'POST',
            body: {
                driverId: form.value.driverId,
                bookingId: form.value.bookingId || null,
                category: form.value.category,
                type: form.value.type,
                description: form.value.description
            }
        })
        showSuccess.value = true
    } catch (error) {
        alert(error.data?.message || error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
        submitting.value = false
    }
}

// If driverId is provided, fetch driver info
onMounted(async () => {
    if (driverId) {
        try {
            const driver = await $api(`/users/${driverId}`)
            selectedDriver.value = driver
            form.value.driverId = driver.id
        } catch (error) {
            console.error('Failed to fetch driver:', error)
        }
    }
})
</script>
