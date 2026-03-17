<template>
    <div>
        <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">การเดินทางของฉัน</h2>
                <p class="mt-2 text-gray-600">จัดการและติดตามการเดินทางทั้งหมดของคุณ</p>
            </div>

            <!-- แถบแท็บด้านบน แยกตามสถานะการเดินทาง (มุมมองผู้โดยสาร) -->
            <div class="p-4 mb-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        v-for="tab in tabs"
                        :key="tab.status"
                        type="button"
                        @click="activeTab = tab.status"
                        :class="[
                            'tab-button inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                            activeTab === tab.status
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-800'
                        ]"
                    >
                        {{ tab.label }} ({{ getTripCount(tab.status) }})
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="lg:col-span-2">
                    <div class="bg-white border border-gray-300 rounded-lg shadow-md">
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">รายการการเดินทาง</h3>
                        </div>

                        <div v-if="isLoading" class="p-12 text-center text-gray-500">
                            <p>กำลังโหลดข้อมูลการเดินทาง...</p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div v-if="filteredTrips.length === 0" class="p-12 text-center text-gray-500">
                                <p>ไม่พบรายการเดินทางในหมวดหมู่นี้</p>
                            </div>

                            <div v-for="trip in filteredTrips" :key="trip.id"
                                class="p-6 transition-colors duration-200 cursor-pointer trip-card hover:bg-gray-50"
                                @click="toggleTripDetails(trip.id)">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <h4 class="text-lg font-semibold text-gray-900">
                                                {{ trip.origin }} → {{ trip.destination }}
                                            </h4>
                                            <span v-if="trip.status === 'pending'"
                                                class="status-badge status-pending">รอดำเนินการ</span>
                                            <span v-else-if="trip.status === 'confirmed'"
                                                class="status-badge status-confirmed">ยืนยันแล้ว</span>
                                            <span v-else-if="trip.status === 'driver_on_the_way'"
                                                class="status-badge status-driver-on-the-way">คนขับกำลังไปรับ</span>
                                            <span v-else-if="trip.status === 'passenger_picked_up'"
                                                class="status-badge status-passenger-picked-up">รับคุณแล้ว — กำลังเดินทาง</span>
                                            <span v-else-if="trip.status === 'completed'"
                                                class="status-badge status-completed">สิ้นสุดการเดินทางแล้ว</span>
                                            <span v-else-if="trip.status === 'rejected'"
                                                class="status-badge status-rejected">ปฏิเสธ</span>
                                            <span v-else-if="trip.status === 'cancelled'"
                                                class="status-badge status-cancelled">ยกเลิก</span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">จุดนัดพบ: {{ trip.pickupPoint }}</p>
                                        <p class="text-sm text-gray-600">
                                            วันที่: {{ trip.date }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            เวลา: {{ trip.time }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะเวลา: {{ trip.durationText }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะทาง: {{ trip.distanceText }}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center mb-4 space-x-4">
                                    <img :src="trip.driver.image" :alt="trip.driver.name"
                                        class="object-cover w-12 h-12 rounded-full" />
                                    <div class="flex-1">
                                        <h5 class="font-medium text-gray-900">{{ trip.driver.name }}</h5>
                                        <div class="flex items-center">
                                            <div class="flex text-sm text-yellow-400">
                                                <span>
                                                    {{ '★'.repeat(Math.round(trip.driver.rating)) }}{{ '☆'.repeat(5 -
                                                        Math.round(trip.driver.rating)) }}
                                                </span>
                                            </div>
                                            <span class="ml-2 text-sm text-gray-600">{{ trip.driver.rating }} ({{
                                                trip.driver.reviews }} รีวิว)</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-blue-600">{{ trip.price }} บาท</div>
                                        <div class="text-sm text-gray-600">จำนวน {{ trip.seats }} ที่นั่ง</div>
                                    </div>
                                </div>

                                <div v-if="selectedTripId === trip.id"
                                    class="pt-4 mt-4 mb-5 duration-300 border-t border-gray-300 animate-in slide-in-from-top">
                                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <h5 class="mb-2 font-medium text-gray-900">รายละเอียดเส้นทาง</h5>
                                            <ul class="space-y-1 text-sm text-gray-600">
                                                <li>
                                                    • จุดเริ่มต้น:
                                                    <span class="font-medium text-gray-900">{{ trip.origin }}</span>
                                                    <span v-if="trip.originAddress"> — {{ trip.originAddress }}</span>
                                                </li>

                                                <template v-if="trip.stops && trip.stops.length">
                                                    <li class="mt-2 text-gray-700">• จุดแวะระหว่างทาง ({{
                                                        trip.stops.length }} จุด):</li>
                                                    <li v-for="(stop, idx) in trip.stops" :key="idx">  - จุดแวะ {{ idx +
                                                        1 }}: {{ stop }}</li>
                                                </template>

                                                <li class="mt-1">
                                                    • จุดปลายทาง:
                                                    <span class="font-medium text-gray-900">{{ trip.destination
                                                    }}</span>
                                                    <span v-if="trip.destinationAddress"> — {{ trip.destinationAddress
                                                    }}</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 class="mb-2 font-medium text-gray-900">รายละเอียดรถ</h5>
                                            <ul class="space-y-1 text-sm text-gray-600">
                                                <li v-for="detail in trip.carDetails" :key="detail">• {{ detail }}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div class="mt-4 space-y-4">
                                        <div v-if="trip.conditions">
                                            <h5 class="mb-2 font-medium text-gray-900">เงื่อนไขการเดินทาง</h5>
                                            <p
                                                class="p-3 text-sm text-gray-700 border border-gray-300 rounded-md bg-gray-50">
                                                {{ trip.conditions }}
                                            </p>
                                        </div>

                                        <div v-if="trip.photos && trip.photos.length > 0">
                                            <h5 class="mb-2 font-medium text-gray-900">รูปภาพรถยนต์</h5>
                                            <div class="grid grid-cols-3 gap-2 mt-2">
                                                <div v-for="(photo, index) in trip.photos.slice(0, 3)" :key="index">
                                                    <img :src="photo" alt="Vehicle photo"
                                                        class="object-cover w-full transition-opacity rounded-lg shadow-sm cursor-pointer aspect-video hover:opacity-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-end space-x-3" :class="{ 'mt-4': selectedTripId !== trip.id }">
                                    <!-- PENDING: ยกเลิกได้ -->
                                    <button v-if="trip.status === 'pending'" @click.stop="openCancelModal(trip)"
                                        class="px-4 py-2 text-sm text-red-600 transition duration-200 border border-red-300 rounded-md hover:bg-red-50">
                                        ยกเลิกการจอง
                                    </button>

                                    <!-- CONFIRMED/IN-RIDE: เพิ่มปุ่มยกเลิก + คงปุ่มแชท -->
                                    <template v-else-if="trip.status === 'confirmed' || trip.status === 'driver_on_the_way' || trip.status === 'passenger_picked_up'">
                                        <button @click.stop="openCancelModal(trip)"
                                            class="px-4 py-2 text-sm text-red-600 transition duration-200 border border-red-300 rounded-md hover:bg-red-50">
                                            ยกเลิกการจอง
                                        </button>
                                        <button
                                            @click.stop="openChat(trip)"
                                            class="px-4 py-2 text-sm text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700">
                                            แชทกับผู้ขับ
                                        </button>
                                    </template>
                                    <!-- COMPLETED: ดูประวัติแชท (อ่านอย่างเดียว) -->
                                    <template v-else-if="trip.status === 'completed'">
                                        <button
                                            @click.stop="openChat(trip)"
                                            class="px-4 py-2 text-sm text-blue-700 transition duration-200 border border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100"
                                        >
                                            ดูประวัติแชท
                                        </button>
                                    </template>

                                    <!-- REJECTED / CANCELLED: ลบได้ -->
                                    <button v-else-if="['rejected', 'cancelled'].includes(trip.status)"
                                        @click.stop="openConfirmModal(trip, 'delete')"
                                        class="px-4 py-2 text-sm text-gray-600 transition duration-200 border border-gray-300 rounded-md hover:bg-gray-50">
                                        ลบรายการ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="sticky overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md top-8">
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">แผนที่เส้นทาง</h3>
                        </div>
                        <div ref="mapContainer" id="map" class="h-96"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: เลือกเหตุผลการยกเลิก -->
        <div v-if="isCancelModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            @click.self="closeCancelModal">
            <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                <h3 class="text-lg font-semibold text-gray-900">เลือกเหตุผลการยกเลิก</h3>
                <p class="mt-1 text-sm text-gray-600">โปรดเลือกเหตุผลตามตัวเลือกที่กำหนด</p>

                <div class="mt-4">
                    <label class="block mb-1 text-sm text-gray-700">เหตุผล</label>
                    <select v-model="selectedCancelReason" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="" disabled>-- เลือกเหตุผล --</option>
                        <option v-for="r in cancelReasonOptions" :key="r.value" :value="r.value">
                            {{ r.label }}
                        </option>
                    </select>
                    <p v-if="cancelReasonError" class="mt-2 text-sm text-red-600">
                        {{ cancelReasonError }}
                    </p>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button @click="closeCancelModal"
                        class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                        ปิด
                    </button>
                    <button @click="submitCancel" :disabled="!selectedCancelReason || isSubmittingCancel"
                        class="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                        {{ isSubmittingCancel ? 'กำลังส่ง...' : 'ยืนยันการยกเลิก' }}
                    </button>
                </div>
            </div>
        </div>

        <ConfirmModal :show="isModalVisible" :title="modalContent.title" :message="modalContent.message"
            :confirmText="modalContent.confirmText" :variant="modalContent.variant" @confirm="handleConfirmAction"
            @cancel="closeConfirmModal" />

        <!-- Chat Window (Passenger) -->
        <div
            v-if="isChatOpen && chatTrip"
            class="fixed bottom-4 left-4 z-50"
        >
            <div
                class="flex w-full max-w-md h-[75vh] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200"
            >
                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                            <img
                                :src="chatTrip.driver.image"
                                :alt="chatTrip.driver.name"
                                class="w-10 h-10 rounded-full object-cover"
                            />
                        </div>
                        <div class="min-w-0">
                            <p class="text-[11px] font-medium text-white/80">แชทระหว่างคุณกับผู้ขับ</p>
                            <p class="text-sm font-semibold text-white truncate">
                                {{ chatTrip.driver.name }}
                            </p>
                            <p class="text-[11px] text-blue-100 truncate">
                                {{ chatTrip.origin }} → {{ chatTrip.destination }} • {{ chatTrip.date }} {{ chatTrip.time }}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/20"
                        @click="closeChat"
                    >
                        ปิด
                    </button>
                </div>

                <!-- Messages -->
                <div class="flex-1 min-h-0 bg-gray-50 flex flex-col">
                    <div class="flex items-center justify-between px-3 py-1.5 text-[11px] text-gray-500 border-b border-gray-100 bg-white">
                        <span v-if="isChatDisabled">
                            แชทไม่สามารถใช้งานได้หลังจากการเดินทางเสร็จสิ้น
                        </span>
                        <span v-else>
                            แชทนี้ใช้สำหรับการประสานงานระหว่างการเดินทาง กรุณาอย่าแชร์ข้อมูลติดต่อส่วนตัว
                        </span>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                            @click="refreshChat"
                        >
                            <span v-if="isChatLoading">กำลังรีเฟรช...</span>
                            <span v-else>รีเฟรช</span>
                        </button>
                    </div>

                    <div
                        ref="chatScrollEl"
                        class="flex-1 overflow-y-auto px-3 py-3 space-y-2"
                    >
                        <div v-if="isChatLoading && chatMessages.length === 0" class="py-6 text-sm text-center text-gray-500">
                            กำลังโหลดประวัติการสนทนา...
                        </div>
                        <div v-else-if="chatMessages.length === 0" class="py-6 text-sm text-center text-gray-500">
                            ยังไม่มีข้อความในแชทนี้ เริ่มการสนทนาได้เลย
                        </div>

                        <div
                            v-for="msg in chatMessages"
                            :key="msg.id"
                            class="flex"
                            :class="msg.senderId === currentUserId ? 'justify-end' : 'justify-start'"
                        >
                            <div
                                class="max-w-[75%] rounded-2xl px-3 py-1.5 text-sm leading-relaxed shadow-sm"
                                :class="msg.senderId === currentUserId
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'"
                            >
                                <template v-if="!msg.type || msg.type === 'TEXT'">
                                    <p class="whitespace-pre-wrap break-words">
                                        {{ msg.text }}
                                    </p>
                                </template>
                                <template v-else-if="msg.type === 'IMAGE'">
                                    <div class="space-y-2">
                                        <img
                                            :src="toAbsoluteMediaUrl(msg.mediaUrl)"
                                            alt="image"
                                            class="max-h-56 w-full rounded-xl object-cover border border-white/20"
                                        />
                                        <a
                                            :href="toAbsoluteMediaUrl(msg.mediaUrl)"
                                            target="_blank"
                                            rel="noopener"
                                            class="inline-flex text-xs font-medium underline underline-offset-2"
                                            :class="msg.senderId === currentUserId ? 'text-blue-100' : 'text-blue-600'"
                                        >
                                            เปิดรูปภาพ
                                        </a>
                                    </div>
                                </template>
                                <template v-else-if="msg.type === 'LOCATION'">
                                    <div class="space-y-2">
                                        <p class="text-sm font-medium">
                                            แชร์ตำแหน่ง
                                        </p>
                                        <a
                                            :href="googleMapsLink(msg.latitude, msg.longitude)"
                                            target="_blank"
                                            rel="noopener"
                                            class="inline-flex text-xs font-medium underline underline-offset-2"
                                            :class="msg.senderId === currentUserId ? 'text-blue-100' : 'text-blue-600'"
                                        >
                                            เปิดใน Google Maps ({{ formatLatLng(msg.latitude, msg.longitude) }})
                                        </a>
                                    </div>
                                </template>
                                <p
                                    class="mt-1 text-[10px]"
                                    :class="msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'"
                                >
                                    {{ formatChatTime(msg.createdAt) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="border-t border-gray-200 bg-white p-2.5">
                    <div v-if="isChatDisabled" class="px-3 py-2 text-xs text-center text-gray-500 bg-gray-50 rounded-lg">
                        แชทนี้ไม่สามารถใช้งานได้แล้ว เนื่องจากการเดินทางเสร็จสิ้น
                    </div>
                    <div
                        v-else
                        class="flex items-end gap-1.5"
                    >
                        <input
                            ref="imageInputEl"
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="onPickImageFile"
                        />
                        <button
                            type="button"
                            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            title="แชร์ตำแหน่ง"
                            @click="onClickShareLocation"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
                                <path
                                    d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M12 13.25a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5z"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            title="ส่งรูปภาพ"
                            @click="onClickPickImage"
                        >
                            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
                                <path
                                    d="M4.75 6.75A2 2 0 016.75 4.75h10.5a2 2 0 012 2v10.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2V6.75z"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M8.25 10a1.25 1.25 0 102.5 0 1.25 1.25 0 00-2.5 0z"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M5.75 17.25l5.25-5.25 3.25 3.25 1.5-1.5 3.5 3.5"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                        <textarea
                            v-model="chatText"
                            rows="1"
                            class="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="พิมพ์ข้อความของคุณ (ห้ามใส่เบอร์โทรศัพท์หรืออีเมล)..."
                            @keydown.enter.exact.prevent="handleSend"
                        ></textarea>
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            :disabled="isSending || !chatText.trim()"
                            @click="handleSend"
                        >
                            <span v-if="isSending">กำลังส่ง...</span>
                            <span v-else>ส่ง</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirm sending personal info (Passenger) -->
        <div
            v-if="showPrivacyConfirm"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            @click.self="cancelPrivacyConfirm"
        >
            <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    ยืนยันการส่งเนื้อหาที่อาจเป็นข้อมูลส่วนบุคคล
                </h3>
                <p class="text-sm text-gray-600 mb-3">
                    การส่งข้อความ/สื่อของคุณอาจมีข้อมูลส่วนบุคคล (เช่น เบอร์โทร, อีเมล, ที่อยู่, รูปภาพ หรือพิกัด)
                    คุณยังยืนยันที่จะส่งหรือไม่?
                </p>
                <button
                    type="button"
                    class="mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                    @click="showPrivacyDetails = !showPrivacyDetails"
                >
                    <span>{{ showPrivacyDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด' }}</span>
                </button>

                <div v-if="showPrivacyDetails" class="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 space-y-1">
                    <p class="font-medium text-gray-800">ทำไมถึงมีการเตือนนี้?</p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>เพื่อช่วยลดการเปิดเผยข้อมูลติดต่อ/ข้อมูลระบุตัวตนในแชท</li>
                        <li>หากจำเป็นต้องแชร์ ให้ยืนยันก่อนส่งทุกครั้ง (หรือกดไม่ต้องเตือนในทริปนี้)</li>
                    </ul>
                </div>

                <div
                    v-if="privacyPreviewText"
                    class="max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 mb-3 whitespace-pre-wrap break-words"
                >
                    {{ privacyPreviewText }}
                </div>

                <label class="flex items-start gap-2 mb-4 select-none">
                    <input
                        v-model="dontWarnAgainThisTrip"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-xs text-gray-700">
                        ฉันเข้าใจแล้ว และจะไม่แจ้งเตือนอีกจนกว่าจะเข้าสู่การเดินทางใหม่
                    </span>
                </label>
                <div class="flex justify-end gap-2">
                    <button
                        type="button"
                        class="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        @click="cancelPrivacyConfirm"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        @click="confirmPrivacyAndSend"
                    >
                        ใช่ ฉันต้องการจะส่ง
                    </button>
                </div>
            </div>
        </div>

        <!-- Chat Floating Button (Passenger) -->
        <button
            v-if="!isChatOpen && chatTrip"
            type="button"
            class="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 shadow-lg text-sm font-medium text-white hover:bg-blue-700"
            @click="isChatOpen = true"
        >
            <span
                class="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase"
            >
                {{ chatTrip.driver.name?.charAt(0) || 'D' }}
            </span>
            <span class="truncate max-w-[120px]">แชทกับ {{ chatTrip.driver.name }}</span>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { useToast } from '~/composables/useToast'

// Setup dayjs for Thai locale
dayjs.locale('th')
dayjs.extend(buddhistEra)

const { $api } = useNuxtApp()
const { toast } = useToast()
import { useAuth } from '~/composables/useAuth'
const { user } = useAuth()
const currentUserId = computed(() => user.value?.id || null)
const config = useRuntimeConfig()

// --- State Management ---
const activeTab = ref('pending')
const selectedTripId = ref(null)
const isLoading = ref(false)
const mapContainer = ref(null)
let map = null
let currentPolyline = null
let currentMarkers = []
const allTrips = ref([])

let gmap = null // Google Map instance
let activePolyline = null
let startMarker = null
let endMarker = null
let geocoder = null
let placesService = null
const mapReady = ref(false)
let stopMarkers = []

const GMAPS_CB = '__gmapsReady__'

const tabs = [
    { status: 'pending', label: 'รอดำเนินการ' },
    { status: 'confirmed', label: 'ยืนยันแล้ว' },
    { status: 'driver_on_the_way', label: 'คนขับกำลังไปรับ' },
    { status: 'passenger_picked_up', label: 'รับคุณแล้ว — กำลังเดินทาง' },
    { status: 'completed', label: 'สิ้นสุดการเดินทางแล้ว' },
    { status: 'rejected', label: 'ปฏิเสธ' },
    { status: 'cancelled', label: 'ยกเลิก' },
    { status: 'all', label: 'ทั้งหมด' }
]

definePageMeta({ middleware: 'auth' })

const cancelReasonOptions = [
    { value: 'CHANGE_OF_PLAN', label: 'เปลี่ยนแผน/มีธุระกะทันหัน' },
    { value: 'FOUND_ALTERNATIVE', label: 'พบวิธีเดินทางอื่นแล้ว' },
    { value: 'DRIVER_DELAY', label: 'คนขับล่าช้าหรือเลื่อนเวลา' },
    { value: 'PRICE_ISSUE', label: 'ราคาหรือค่าใช้จ่ายไม่เหมาะสม' },
    { value: 'WRONG_LOCATION', label: 'เลือกจุดรับ–ส่งผิด' },
    { value: 'DUPLICATE_OR_WRONG_DATE', label: 'จองซ้ำหรือจองผิดวัน' },
    { value: 'SAFETY_CONCERN', label: 'กังวลด้านความปลอดภัย' },
    { value: 'WEATHER_OR_FORCE_MAJEURE', label: 'สภาพอากาศ/เหตุสุดวิสัย' },
    { value: 'COMMUNICATION_ISSUE', label: 'สื่อสารไม่สะดวก/ติดต่อไม่ได้' }
]

const isCancelModalVisible = ref(false)
const isSubmittingCancel = ref(false)
const selectedCancelReason = ref('')
const cancelReasonError = ref('')
const tripToCancel = ref(null)

// --- Chat state ---
const isChatOpen = ref(false)
const chatTrip = ref(null)
const chatMessages = ref([])
const chatText = ref('')
const isChatLoading = ref(false)
const isSending = ref(false)
const chatScrollEl = ref(null)
const chatBookingId = ref(null)
const isChatDisabled = ref(false)
const showPrivacyConfirm = ref(false)
const showPrivacyDetails = ref(false)
const privacyPreviewText = ref('')
const dontWarnAgainThisTrip = ref(false)
const pendingPrivacyAction = ref(null)
const confirmedContentKeys = ref(new Set())
const imageInputEl = ref(null)

function privacySuppressKey(bookingId) {
    return bookingId ? `chat_privacy_suppress:${bookingId}` : null
}
function privacyConfirmedKey(bookingId) {
    return bookingId ? `chat_privacy_confirmed:${bookingId}` : null
}
function makeContentKey(kind, content) {
    const input = `${kind}:${content ?? ''}`
    // djb2
    let hash = 5381
    for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
    return `k${(hash >>> 0).toString(36)}`
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

function hasPhoneLike(text) {
    if (!text) return false
    const digits = String(text).replace(/\D/g, '')
    if (digits.length < 9) return false
    // เบอร์ไทยเริ่มด้วย 0 และยาวรวม 9–10 หลัก (เช่น 02xxxxxxx, 081xxxxxxx)
    if (/0\d{8,9}/.test(digits)) return true
    // หรือเขียนแบบ +66 / 66 ตามด้วย 8–9 หลัก
    if (/66\d{8,9}/.test(digits)) return true
    return false
}

function loadPrivacyPrefsForTrip(bookingId) {
    if (!process.client || !bookingId) return
    try {
        const sup = sessionStorage.getItem(privacySuppressKey(bookingId))
        dontWarnAgainThisTrip.value = sup === '1'
        const raw = sessionStorage.getItem(privacyConfirmedKey(bookingId))
        const arr = raw ? JSON.parse(raw) : []
        confirmedContentKeys.value = new Set(Array.isArray(arr) ? arr : [])
    } catch {
        // ignore
    }
}

function persistPrivacyPrefsForTrip(bookingId) {
    if (!process.client || !bookingId) return
    try {
        sessionStorage.setItem(privacySuppressKey(bookingId), dontWarnAgainThisTrip.value ? '1' : '0')
        sessionStorage.setItem(privacyConfirmedKey(bookingId), JSON.stringify(Array.from(confirmedContentKeys.value)))
    } catch {
        // ignore
    }
}

// --- Computed Properties ---
const filteredTrips = computed(() => {
    if (activeTab.value === 'all') return allTrips.value
    return allTrips.value.filter((trip) => trip.status === activeTab.value)
})

const selectedTrip = computed(() => {
    return allTrips.value.find((trip) => trip.id === selectedTripId.value) || null
})

function cleanAddr(a) {
    return (a || '')
        .replace(/,?\s*(Thailand|ไทย|ประเทศ)\s*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
}

// --- Methods ---
async function fetchMyTrips() {
    isLoading.value = true
    try {
        const bookings = await $api('/bookings/me')

        // map ข้อมูลพื้นฐานก่อน (ตั้งชื่อชั่วคราวเป็นพิกัด แล้วไป reverse geocode ภายหลัง)
        const formatted = bookings.map((b) => {
            const driverData = {
                name: `${b.route.driver.firstName} ${b.route.driver.lastName}`.trim(),
                image:
                    b.route.driver.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(b.route.driver.firstName || 'U')}&background=random&size=64`,
                rating: b.route.driver.averageRating ?? 4.5,
                reviews: b.route.driver.reviewCount ?? 0
            }

            const carDetails = []
            if (b.route.vehicle) {
                carDetails.push(`${b.route.vehicle.vehicleModel} (${b.route.vehicle.vehicleType})`)
                if (Array.isArray(b.route.vehicle.amenities) && b.route.vehicle.amenities.length) {
                    carDetails.push(...b.route.vehicle.amenities)
                }
            } else {
                carDetails.push('ไม่มีข้อมูลรถ')
            }

            const start = b.route.startLocation
            const end = b.route.endLocation

            const wp = b.route.waypoints || {}
            const baseList =
                (Array.isArray(wp.used) && wp.used.length ? wp.used : Array.isArray(wp.requested) ? wp.requested : []) || []
            const orderedList =
                Array.isArray(wp.optimizedOrder) && wp.optimizedOrder.length === baseList.length
                    ? wp.optimizedOrder.map((i) => baseList[i])
                    : baseList

            const stops = orderedList
                .map((p) => {
                    const name = p?.name || ''
                    const address = cleanAddr(p?.address || '')
                    const fallback =
                        p?.lat != null && p?.lng != null ? `(${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)})` : ''
                    const title = name || fallback
                    return address ? `${title} — ${address}` : title
                })
                .filter(Boolean)

            const stopsCoords = orderedList
                .map((p) =>
                    p && typeof p.lat === 'number' && typeof p.lng === 'number'
                        ? { lat: Number(p.lat), lng: Number(p.lng), name: p.name || '', address: p.address || '' }
                        : null
                )
                .filter(Boolean)

            return {
                id: b.id,
                status: String(b.status || '').toLowerCase(),
                origin: start?.name || `(${Number(start.lat).toFixed(2)}, ${Number(start.lng).toFixed(2)})`,
                destination: end?.name || `(${Number(end.lat).toFixed(2)}, ${Number(end.lng).toFixed(2)})`,
                originAddress: start?.address ? cleanAddr(start.address) : null,
                destinationAddress: end?.address ? cleanAddr(end.address) : null,
                originHasName: !!start?.name,
                destinationHasName: !!end?.name,
                pickupPoint: b.pickupLocation?.name || '-',
                date: dayjs(b.route.departureTime).format('D MMMM BBBB'),
                time: dayjs(b.route.departureTime).format('HH:mm น.'),
                price: (b.route.pricePerSeat || 0) * (b.numberOfSeats || 1),
                seats: b.numberOfSeats || 1,
                driver: driverData,
                coords: [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ],
                polyline: b.route.routePolyline || null, // ใช้เมื่อมี
                stops,
                stopsCoords,
                carDetails,
                conditions: b.route.conditions,
                photos: b.route.vehicle?.photos || [],
                durationText:
                    (typeof b.route.duration === 'string' ? formatDuration(b.route.duration) : b.route.duration) ||
                    (typeof b.route.durationSeconds === 'number' ? `${Math.round(b.route.durationSeconds / 60)} นาที` : '-'),
                distanceText:
                    (typeof b.route.distance === 'string' ? formatDistance(b.route.distance) : b.route.distance) ||
                    (typeof b.route.distanceMeters === 'number' ? `${(b.route.distanceMeters / 1000).toFixed(1)} กม.` : '-')
            }
        })

        allTrips.value = formatted

        // รอให้แผนที่พร้อมก่อน แล้วค่อย reverse geocode เพื่อได้ "ชื่อสถานที่" สวยๆ
        await waitMapReady()

        const jobs = allTrips.value.map(async (t, idx) => {
            const [o, d] = await Promise.all([reverseGeocode(t.coords[0][0], t.coords[0][1]), reverseGeocode(t.coords[1][0], t.coords[1][1])])
            const oParts = await extractNameParts(o)
            const dParts = await extractNameParts(d)

            if (!allTrips.value[idx].originHasName && oParts.name) {
                allTrips.value[idx].origin = oParts.name
            }
            if (!allTrips.value[idx].destinationHasName && dParts.name) {
                allTrips.value[idx].destination = dParts.name
            }
        })

        await Promise.allSettled(jobs)
    } catch (error) {
        console.error('Failed to fetch my trips:', error)
        allTrips.value = []
    } finally {
        isLoading.value = false
    }
}

// --- Chat helpers ---
function openChat(trip) {
    chatTrip.value = trip
    chatBookingId.value = trip.id
    isChatOpen.value = true
    isChatDisabled.value = trip.status === 'completed'
    chatMessages.value = []
    chatText.value = ''
    showPrivacyConfirm.value = false
    pendingPrivacyAction.value = null
    showPrivacyDetails.value = false
    privacyPreviewText.value = ''
    loadPrivacyPrefsForTrip(trip.id)
    fetchChatMessages()
}

function closeChat() {
    isChatOpen.value = false
}

async function fetchChatMessages() {
    if (!chatBookingId.value) return
    isChatLoading.value = true
    try {
        const res = await $api(`/messages/${chatBookingId.value}`)
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        chatMessages.value = list
        await nextTick()
        scrollChatToBottom()
    } catch (err) {
        console.error('Failed to load messages:', err)
        toast.error('ไม่สามารถโหลดแชทได้', err?.data?.message || 'กรุณาลองใหม่อีกครั้ง')
    } finally {
        isChatLoading.value = false
    }
}

function scrollChatToBottom() {
    if (!chatScrollEl.value) return
    const el = chatScrollEl.value
    el.scrollTop = el.scrollHeight
}

async function handleSend(forceAllowPersonal = false) {
    if (!chatBookingId.value || !chatText.value.trim() || isSending.value || isChatDisabled.value) return

    const textToSend = chatText.value

    // เพื่อความปลอดภัยและกันหลุดทุกเคส: ให้ทุกข้อความถือว่า "อาจมีข้อมูลส่วนตัว"
    const hasPersonalInfo = true
    const contentKey = makeContentKey('text', textToSend)

    // รอบแรก: เจอข้อมูลส่วนตัว/เนื้อหาเสี่ยง และยังไม่ได้ยืนยัน -> เปิด modal ถามก่อน
    // ถ้าผู้ใช้ติ๊ก "ไม่ต้องเตือนในทริปนี้" หรือเคยยืนยัน content เดิมแล้ว -> ส่งได้เลย
    const shouldPrompt =
        !forceAllowPersonal &&
        hasPersonalInfo &&
        !dontWarnAgainThisTrip.value &&
        !confirmedContentKeys.value.has(contentKey)
    if (shouldPrompt) {
        privacyPreviewText.value = textToSend
        pendingPrivacyAction.value = { kind: 'text', text: textToSend, hasPersonalInfo }
        showPrivacyDetails.value = false
        showPrivacyConfirm.value = true
        return
    }

    isSending.value = true
    try {
        const payload = {
            text: textToSend,
            allowPersonalInfo: (forceAllowPersonal || dontWarnAgainThisTrip.value || confirmedContentKeys.value.has(contentKey)) && hasPersonalInfo
        }
        const res = await $api(`/messages/${chatBookingId.value}`, {
            method: 'POST',
            body: payload
        })
        const msg = res?.data || res
        chatMessages.value.push(msg)
        chatText.value = ''
        await nextTick()
        scrollChatToBottom()
    } catch (err) {
        console.error('Failed to send message:', err)
        const msg =
            err?.data?.message ||
            err?.message ||
            'ไม่สามารถส่งข้อความได้'

        if (typeof msg === 'string' && msg === 'MESSAGE_CONTAINS_PERSONAL_INFO' && !forceAllowPersonal) {
            // backend ตรวจเจอข้อมูลส่วนตัว: เปิด modal (เผื่อ frontend พลาด)
            privacyPreviewText.value = textToSend
            pendingPrivacyAction.value = { kind: 'text', text: textToSend, hasPersonalInfo: true }
            showPrivacyDetails.value = false
            showPrivacyConfirm.value = true
        } else {
            toast.error('ส่งข้อความไม่สำเร็จ', msg)
        }
        // ถ้า backend แจ้งว่า ride เสร็จสิ้นแล้ว ให้ปิด input
        if (typeof msg === 'string' && msg.includes('Chat is no longer available')) {
            isChatDisabled.value = true
        }
    } finally {
        isSending.value = false
    }
}

async function sendLocationNow({ latitude, longitude }) {
    if (!chatBookingId.value || isChatDisabled.value) return
    isSending.value = true
    try {
        const res = await $api(`/messages/${chatBookingId.value}/location`, {
            method: 'POST',
            body: { latitude, longitude }
        })
        const msg = res?.data || res
        chatMessages.value.push(msg)
        await nextTick()
        scrollChatToBottom()
    } catch (err) {
        console.error('Failed to send location:', err)
        const m = err?.data?.message || err?.message || 'ไม่สามารถส่งตำแหน่งได้'
        toast.error('ส่งตำแหน่งไม่สำเร็จ', m)
        if (typeof m === 'string' && m.includes('Chat is no longer available')) {
            isChatDisabled.value = true
        }
    } finally {
        isSending.value = false
    }
}

async function sendImageNow(file) {
    if (!chatBookingId.value || isChatDisabled.value || !file) return
    isSending.value = true
    try {
        const fd = new FormData()
        fd.append('image', file)
        const res = await $api(`/messages/${chatBookingId.value}/image`, {
            method: 'POST',
            body: fd
        })
        const msg = res?.data || res
        chatMessages.value.push(msg)
        await nextTick()
        scrollChatToBottom()
    } catch (err) {
        console.error('Failed to send image:', err)
        const m = err?.data?.message || err?.message || 'ไม่สามารถส่งรูปภาพได้'
        toast.error('ส่งรูปภาพไม่สำเร็จ', m)
        if (typeof m === 'string' && m.includes('Chat is no longer available')) {
            isChatDisabled.value = true
        }
    } finally {
        isSending.value = false
    }
}

function onClickPickImage() {
    if (isChatDisabled.value) return
    imageInputEl.value?.click?.()
}

function onPickImageFile(e) {
    const file = e?.target?.files?.[0]
    // reset input so selecting same file again triggers change
    if (e?.target) e.target.value = ''
    if (!file) return

    // รูปภาพ/ตำแหน่ง: ให้ถามทุกครั้ง ยกเว้นผู้ใช้ติ๊ก "ไม่ต้องเตือนในทริปนี้"
    const fingerprint = `${file.name}:${file.size}:${file.lastModified}`
    const key = makeContentKey('image', fingerprint)

    const shouldPrompt = !dontWarnAgainThisTrip.value
    if (shouldPrompt) {
        privacyPreviewText.value = `รูปภาพ: ${file.name} (${Math.round(file.size / 1024)} KB)`
        pendingPrivacyAction.value = { kind: 'image', file, contentKey: key }
        showPrivacyDetails.value = false
        showPrivacyConfirm.value = true
        return
    }

    sendImageNow(file)
}

function onClickShareLocation() {
    if (isChatDisabled.value) return
    if (!navigator?.geolocation) {
        toast.error('ไม่รองรับ', 'อุปกรณ์/เบราว์เซอร์นี้ไม่รองรับการแชร์ตำแหน่ง')
        return
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const latitude = Number(pos.coords.latitude)
            const longitude = Number(pos.coords.longitude)
            const rounded = `${latitude.toFixed(5)},${longitude.toFixed(5)}`
            const key = makeContentKey('location', rounded)

            const shouldPrompt = !dontWarnAgainThisTrip.value
            if (shouldPrompt) {
                privacyPreviewText.value = `ตำแหน่ง: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                pendingPrivacyAction.value = { kind: 'location', latitude, longitude, contentKey: key }
                showPrivacyDetails.value = false
                showPrivacyConfirm.value = true
                return
            }

            sendLocationNow({ latitude, longitude })
        },
        (err) => {
            const code = err?.code
            if (code === 1) toast.error('ส่งตำแหน่งไม่สำเร็จ', 'คุณปฏิเสธการอนุญาตตำแหน่ง')
            else toast.error('ส่งตำแหน่งไม่สำเร็จ', 'ไม่สามารถอ่านตำแหน่งได้ กรุณาลองใหม่')
        },
        { enableHighAccuracy: true, timeout: 10000 }
    )
}

async function refreshChat() {
    await fetchChatMessages()
}

function formatChatTime(iso) {
    if (!iso) return ''
    return dayjs(iso).format('HH:mm น.')
}

function cancelPrivacyConfirm() {
    showPrivacyConfirm.value = false
    pendingPrivacyAction.value = null
    privacyPreviewText.value = ''
    showPrivacyDetails.value = false
    if (chatBookingId.value) persistPrivacyPrefsForTrip(chatBookingId.value)
}

async function confirmPrivacyAndSend() {
    if (!pendingPrivacyAction.value) {
        cancelPrivacyConfirm()
        return
    }

    if (chatBookingId.value) {
        if (dontWarnAgainThisTrip.value) {
            // บันทึก preference ต่อทริป
            // (เก็บหลังจากปิด modal ด้วย)
        }

        // จำว่า content นี้เคยกดยืนยันแล้ว -> ส่งซ้ำได้โดยไม่เตือน
        // จำเฉพาะ "ข้อความ" ที่เคยยืนยันแล้วให้ส่งซ้ำได้ (รูป/ตำแหน่งจะถามทุกครั้ง ยกเว้นติ๊กไม่เตือน)
        if (pendingPrivacyAction.value.kind === 'text' && typeof pendingPrivacyAction.value.text === 'string') {
            const key = makeContentKey('text', pendingPrivacyAction.value.text)
            confirmedContentKeys.value.add(key)
        }
        persistPrivacyPrefsForTrip(chatBookingId.value)
    }

    const action = pendingPrivacyAction.value
    showPrivacyConfirm.value = false
    pendingPrivacyAction.value = null
    privacyPreviewText.value = ''
    showPrivacyDetails.value = false

    if (action.kind === 'text') {
        chatText.value = action.text
        await handleSend(true)
    } else if (action.kind === 'image') {
        await sendImageNow(action.file)
    } else if (action.kind === 'location') {
        await sendLocationNow({ latitude: action.latitude, longitude: action.longitude })
    }
}

function waitMapReady() {
    return new Promise((resolve) => {
        if (mapReady.value) return resolve(true)
        const t = setInterval(() => {
            if (mapReady.value) {
                clearInterval(t)
                resolve(true)
            }
        }, 50)
    })
}

function reverseGeocode(lat, lng) {
    return new Promise((resolve) => {
        if (!geocoder) return resolve(null)
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status !== 'OK' || !results?.length) return resolve(null)
            resolve(results[0])
        })
    })
}

async function extractNameParts(geocodeResult) {
    if (!geocodeResult) return { name: null, area: null }

    const comps = geocodeResult.address_components || []
    const byType = (t) => comps.find((c) => c.types.includes(t))?.long_name
    const byTypeShort = (t) => comps.find((c) => c.types.includes(t))?.short_name

    const types = geocodeResult.types || []
    const isPoi = types.includes('point_of_interest') || types.includes('establishment') || types.includes('premise')

    let name = null
    if (isPoi && geocodeResult.place_id) {
        const poiName = await getPlaceName(geocodeResult.place_id)
        if (poiName) name = poiName
    }
    if (!name) {
        const streetNumber = byType('street_number')
        const route = byType('route')
        name = streetNumber && route ? `${streetNumber} ${route}` : route || geocodeResult.formatted_address || null
    }

    const sublocality =
        byType('sublocality') || byType('neighborhood') || byType('locality') || byType('administrative_area_level_2')
    const province = byType('administrative_area_level_1') || byTypeShort('administrative_area_level_1')

    let area = null
    if (sublocality && province) area = `${sublocality}, ${province}`
    else if (province) area = province

    if (name) name = name.replace(/,?\s*(Thailand|ไทย)\s*$/i, '')
    return { name, area }
}

function getPlaceName(placeId) {
    return new Promise((resolve) => {
        if (!placesService || !placeId) return resolve(null)
        placesService.getDetails({ placeId, fields: ['name'] }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place?.name) resolve(place.name)
            else resolve(null)
        })
    })
}

const getTripCount = (status) => {
    if (status === 'all') return allTrips.value.length
    return allTrips.value.filter((trip) => trip.status === status).length
}

const toggleTripDetails = (tripId) => {
    const tripForMap = allTrips.value.find((trip) => trip.id === tripId)
    if (tripForMap) {
        updateMap(tripForMap)
    }

    if (selectedTripId.value === tripId) {
        selectedTripId.value = null
    } else {
        selectedTripId.value = tripId
    }
}

async function updateMap(trip) {
    if (!trip) return
    await waitMapReady()
    if (!gmap) return

    // cleanup ของเดิม
    if (activePolyline) {
        activePolyline.setMap(null)
        activePolyline = null
    }
    if (startMarker) {
        startMarker.setMap(null)
        startMarker = null
    }
    if (endMarker) {
        endMarker.setMap(null)
        endMarker = null
    }
    if (stopMarkers.length) {
        stopMarkers.forEach((m) => m.setMap(null))
        stopMarkers = []
    }

    const start = { lat: Number(trip.coords[0][0]), lng: Number(trip.coords[0][1]) }
    const end = { lat: Number(trip.coords[1][0]), lng: Number(trip.coords[1][1]) }

    // หมุด A/B
    startMarker = new google.maps.Marker({ position: start, map: gmap, label: 'A' })
    endMarker = new google.maps.Marker({ position: end, map: gmap, label: 'B' })

    if (Array.isArray(trip.stopsCoords) && trip.stopsCoords.length) {
        stopMarkers = trip.stopsCoords.map(
            (s, idx) =>
                new google.maps.Marker({
                    position: { lat: s.lat, lng: s.lng },
                    map: gmap,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    title: s.name || s.address || `จุดแวะ ${idx + 1}`
                })
        )
    }

    // เส้นทางจาก polyline ถ้ามี
    if (trip.polyline && google.maps.geometry?.encoding) {
        const path = google.maps.geometry.encoding.decodePath(trip.polyline)
        activePolyline = new google.maps.Polyline({
            path,
            map: gmap,
            strokeColor: '#2563eb',
            strokeOpacity: 0.9,
            strokeWeight: 5
        })
        const bounds = new google.maps.LatLngBounds()
        path.forEach((p) => bounds.extend(p))

        if (trip.stopsCoords?.length) {
            trip.stopsCoords.forEach((s) => bounds.extend(new google.maps.LatLng(s.lat, s.lng)))
        }

        gmap.fitBounds(bounds)
    } else {
        // ไม่มี polyline → fit จากจุด A-B + จุดแวะ
        const bounds = new google.maps.LatLngBounds()
        bounds.extend(start)
        bounds.extend(end)
        if (trip.stopsCoords?.length) {
            trip.stopsCoords.forEach((s) => bounds.extend(new google.maps.LatLng(s.lat, s.lng)))
        }
        gmap.fitBounds(bounds)
    }
}

// --- Modal Logic ---
const isModalVisible = ref(false)
const tripToAction = ref(null)
const modalContent = ref({
    title: '',
    message: '',
    confirmText: '',
    action: null,
    variant: 'danger'
})

const openConfirmModal = (trip, action) => {
    tripToAction.value = trip
    if (action === 'cancel') {
        // ตอนนี้ไม่ใช้ทางยืนยันตรง ๆ แล้ว แต่คงโครงไว้เผื่ออนาคต
        modalContent.value = {
            title: 'ยืนยันการยกเลิกการจอง',
            message: `คุณต้องการยกเลิกการเดินทางไปที่ "${trip.destination}" ใช่หรือไม่?`,
            confirmText: 'ใช่, ยกเลิกการจอง',
            action: 'cancel',
            variant: 'danger'
        }
    } else if (action === 'delete') {
        modalContent.value = {
            title: 'ยืนยันการลบรายการ',
            message: `คุณต้องการลบรายการเดินทางไปที่ "${trip.destination}" ออกจากประวัติใช่หรือไม่?`,
            confirmText: 'ใช่, ลบรายการ',
            action: 'delete',
            variant: 'danger'
        }
    }
    isModalVisible.value = true
}

const closeConfirmModal = () => {
    isModalVisible.value = false
    tripToAction.value = null
}

const handleConfirmAction = async () => {
    if (!tripToAction.value) return
    const action = modalContent.value.action
    const tripId = tripToAction.value.id
    try {
        if (action === 'cancel') {
            // ไม่ยิง PATCH ตรง ๆ — ต้องให้ผู้ใช้เลือกเหตุผลก่อน
            openCancelModal(tripToAction.value)
            closeConfirmModal()
            return
        } else if (action === 'delete') {
            await $api(`/bookings/${tripId}`, { method: 'DELETE' })
            toast.success('ลบรายการสำเร็จ', 'รายการได้ถูกลบออกจากประวัติแล้ว')
        }
        closeConfirmModal()
        await fetchMyTrips()
    } catch (error) {
        console.error(`Failed to ${action} booking:`, error)
        toast.error('เกิดข้อผิดพลาด', error.data?.message || 'ไม่สามารถดำเนินการได้')
        closeConfirmModal()
    }
}

function openCancelModal(trip) {
    tripToCancel.value = trip
    selectedCancelReason.value = ''
    cancelReasonError.value = ''
    isCancelModalVisible.value = true
}

function closeCancelModal() {
    isCancelModalVisible.value = false
    tripToCancel.value = null
}

async function submitCancel() {
    if (!selectedCancelReason.value) {
        cancelReasonError.value = 'กรุณาเลือกเหตุผล'
        return
    }
    if (!tripToCancel.value) return

    isSubmittingCancel.value = true
    try {
        await $api(`/bookings/${tripToCancel.value.id}/cancel`, {
            method: 'PATCH',
            body: { reason: selectedCancelReason.value } // ✅ ตรงกับ schema ฝั่ง backend
        })
        toast.success('ยกเลิกการจองสำเร็จ', 'ระบบบันทึกเหตุผลแล้ว')
        closeCancelModal()
        await fetchMyTrips()
    } catch (err) {
        console.error('Cancel booking failed:', err)
        toast.error('เกิดข้อผิดพลาด', err?.data?.message || 'ไม่สามารถยกเลิกได้')
    } finally {
        isSubmittingCancel.value = false
    }
}

function formatDistance(input) {
    if (typeof input !== 'string') return input
    const parts = input.split('+')
    if (parts.length <= 1) return input

    let meters = 0
    for (const seg of parts) {
        const n = parseFloat(seg.replace(/[^\d.]/g, ''))
        if (Number.isNaN(n)) continue
        if (/กม/.test(seg)) meters += n * 1000
        else if (/เมตร|ม\./.test(seg)) meters += n
        else meters += n // สมมติเป็นเมตรถ้าไม่พบหน่วย
    }

    if (meters >= 1000) {
        const km = Math.round((meters / 1000) * 10) / 10 // ปัดทศนิยม 1 ตำแหน่ง
        return `${(km % 1 === 0 ? km.toFixed(0) : km)} กม.`
    }
    return `${Math.round(meters)} ม.`
}

function formatDuration(input) {
    if (typeof input !== 'string') return input
    const parts = input.split('+')
    if (parts.length <= 1) return input

    let minutes = 0
    for (const seg of parts) {
        const n = parseFloat(seg.replace(/[^\d.]/g, ''))
        if (Number.isNaN(n)) continue
        if (/ชม/.test(seg)) minutes += n * 60
        else minutes += n // นาที
    }

    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return h ? (m ? `${h} ชม. ${m} นาที` : `${h} ชม.`) : `${m} นาที`
}

// --- Lifecycle and Watchers ---
useHead({
    title: 'การเดินทางของฉัน - ไปนำแหน่',
    link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap' }],
    script:
        process.client && !window.google?.maps
            ? [
                {
                    key: 'gmaps',
                    src: `https://maps.googleapis.com/maps/api/js?key=${useRuntimeConfig().public.googleMapsApiKey}&libraries=places,geometry&loading=async&callback=__gmapsReady__`,
                    async: true,
                    defer: true
                }
            ]
            : []
})

onMounted(() => {
    // ถ้า script โหลดแล้ว
    if (window.google?.maps) {
        initializeMap()
        fetchMyTrips().then(() => {
            // ถ้ามีข้อมูลแล้วและยังไม่ได้เลือก ให้โชว์แผนที่ของรายการแรกในแท็บปัจจุบัน
            if (filteredTrips.value.length) updateMap(filteredTrips.value[0])
        })
        return
    }

    // ยังไม่โหลดเสร็จ: ตั้ง callback
    window[GMAPS_CB] = () => {
        try {
            delete window[GMAPS_CB]
        } catch { }
        initializeMap()
        fetchMyTrips().then(() => {
            if (filteredTrips.value.length) updateMap(filteredTrips.value[0])
        })
    }
})

function initializeMap() {
    if (!mapContainer.value || gmap) return
    gmap = new google.maps.Map(mapContainer.value, {
        center: { lat: 13.7563, lng: 100.5018 },
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    })
    geocoder = new google.maps.Geocoder()
    placesService = new google.maps.places.PlacesService(gmap)
    mapReady.value = true
}
</script>

<style scoped>
.trip-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.trip-card:hover {
    /* transform: translateY(-2px); */
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
}

.tab-button {
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

#map {
    height: 100%;
    min-height: 600px;
    border-radius: 0 0 0.5rem 0.5rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-pending {
    background-color: #fef3c7;
    color: #d97706;
}

.status-confirmed {
    background-color: #d1fae5;
    color: #065f46;
}

.status-driver-on-the-way {
    background-color: #fef3c7;
    color: #b45309;
}

.status-passenger-picked-up {
    background-color: #d1fae5;
    color: #047857;
}

.status-completed {
    background-color: #e0e7ff;
    color: #3730a3;
}

.status-rejected {
    background-color: #fee2e2;
    color: #dc2626;
}

.status-cancelled {
    background-color: #f3f4f6;
    color: #6b7280;
}

@keyframes slide-in-from-top {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-in {
    animation-fill-mode: both;
}

.slide-in-from-top {
    animation-name: slide-in-from-top;
}

.duration-300 {
    animation-duration: 300ms;
}
</style>