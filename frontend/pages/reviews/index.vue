<template>
  <div class="min-h-screen pb-12 bg-gray-50 text-gray-800">
    <div class="px-4 py-8 mx-auto max-w-5xl sm:px-6 lg:px-8 md:py-12">
      <!-- Header -->
      <div class="p-6 mb-8 bg-white rounded-lg shadow-md section-card">
        <div class="flex items-center mb-1">
          <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <h1 class="text-2xl font-bold text-gray-900">รีวิวการเดินทาง</h1>
        </div>
        <p class="mt-1 text-base text-gray-600 ml-9">
          รีวิวได้ภายใน 7 วันหลังเดินทางสำเร็จ และทุกคนจะสามารถเห็นรีวิวของคุณได้
        </p>
      </div>

      <!-- Not logged in -->
      <div
        v-if="!token"
        class="p-5 mb-8 border-l-4 rounded-r-lg shadow-sm bg-amber-50 border-amber-400"
      >
        <div class="flex items-start">
          <svg
            class="w-5 h-5 mr-3 text-amber-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 class="mb-1 text-base font-semibold text-amber-900">
              ต้องการเขียนรีวิวใช่ไหม?
            </h3>
            <p class="mb-4 text-sm text-gray-700">
              กรุณาเข้าสู่ระบบเพื่อเขียนรีวิวและดูทริปที่รอรีวิวของคุณ
            </p>
            <NuxtLink
              to="/login"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            >
              เข้าสู่ระบบเลย
              <svg
                class="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Logged in -->
      <template v-else>
        <!-- Trips waiting for review -->
        <section class="p-6 mb-8 bg-white rounded-lg shadow-md section-card content-section">
          <div class="mb-5 border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-gray-900">ทริปที่รอรีวิว</h2>
            <p class="mt-1 text-sm text-gray-600">
              ทริปที่เดินทางสำเร็จแล้วแต่ยังไม่ได้รีวิว
              <span class="block text-xs text-gray-500">
                สามารถเขียนรีวิวได้ภายใน 7 วันหลังเดินทางสำเร็จ หากเกินกำหนดจะไม่สามารถเขียนรีวิวได้
              </span>
            </p>
          </div>

          <div
            v-if="loadingReviewable"
            class="p-4 text-sm text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"
          >
            กำลังโหลดข้อมูลทริป...
          </div>
          <div
            v-else-if="!reviewableTrips.length"
            class="p-6 text-sm text-center text-gray-500 bg-gray-50 border border-gray-100 rounded-lg"
          >
            <svg
              class="w-10 h-10 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            ไม่มีทริปที่รอรีวิวในขณะนี้
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="trip in reviewableTrips"
              :key="trip.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-all bg-blue-50/30 border border-blue-100 rounded-xl hover:shadow-md hover:bg-white"
            >
              <div>
                <div class="flex items-center mb-1 text-base font-semibold text-gray-900">
                  <svg
                    class="w-4 h-4 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {{ tripOrigin(trip) }} <span class="mx-2 text-gray-400">→</span>
                  {{ tripDest(trip) }}
                </div>
                <div
                  class="flex flex-wrap items-center pl-6 text-xs text-gray-600 gap-x-4 gap-y-1"
                >
                  <span class="flex items-center">
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    คนขับ: {{ trip.route.driver.firstName }} {{ trip.route.driver.lastName }}
                  </span>
                  <span class="hidden text-gray-300 sm:inline">•</span>
                  <span class="flex items-center">
                    <svg
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {{ formatDate(trip.route.departureTime) }}
                  </span>
                </div>
                <p
                  class="mt-1 text-xs"
                  :class="trip.canReview ? 'text-green-700' : 'text-gray-500'"
                >
                  {{
                    trip.canReview
                      ? 'อยู่ในช่วงเวลาที่สามารถเขียนรีวิวได้ (ภายใน 7 วันหลังเดินทางสำเร็จ)'
                      : 'เลยกำหนด 7 วันสำหรับการเขียนรีวิวแล้ว ไม่สามารถเขียนรีวิวทริปนี้ได้'
                  }}
                </p>
              </div>
              <button
                type="button"
                :disabled="trip.canReview === false"
                :class="[
                  'w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg shrink-0 shadow-sm transition-colors',
                  trip.canReview !== false
                    ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                ]"
                @click="openReviewForm(trip)"
              >
                {{ trip.canReview !== false ? 'เขียนรีวิว' : 'หมดเขตรีวิว' }}
              </button>
            </li>
          </ul>
        </section>

        <!-- My reviews -->
        <section class="p-6 mb-8 bg-white rounded-lg shadow-md section-card content-section">
          <div class="mb-5 border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-gray-900">รีวิวของคุณ</h2>
            <p class="mt-1 text-sm text-gray-600">
              ประวัติการรีวิวที่คุณเคยมอบให้ผู้อื่น
            </p>
          </div>

          <div
            v-if="loadingMy"
            class="p-4 text-sm text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"
          >
            กำลังโหลด...
          </div>
          <div
            v-else-if="!myReviews.length"
            class="p-6 text-sm text-center text-gray-500 bg-gray-50 border border-gray-100 rounded-lg"
          >
            ยังไม่มีรีวิวที่คุณเขียน
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="r in myReviews"
              :key="r.id"
              class="p-4 transition-all bg-gray-50 border border-gray-100 rounded-xl hover:shadow-sm"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex gap-1 text-amber-400">
                  <svg
                    v-for="i in 5"
                    :key="i"
                    class="w-4 h-4"
                    :class="i <= r.rating ? 'fill-current' : 'text-gray-300'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <span class="text-xs text-gray-500">{{ formatDate(r.createdAt) }}</span>
              </div>
              <p v-if="r.comment" class="mt-1 text-sm leading-relaxed text-gray-800">
                {{ r.comment }}
              </p>
              <p
                v-if="r.tags && formatTags(r.tags)"
                class="mt-1 text-xs font-medium text-blue-800"
              >
                แท็ก: {{ formatTags(r.tags) }}
              </p>
              <div
                class="mt-2 inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
              >
                รีวิวให้คนขับ: {{ r.driver.firstName }} {{ r.driver.lastName }}
              </div>
            </li>
          </ul>
        </section>
      </template>

      <!-- Recent community reviews -->
      <section class="p-6 bg-white rounded-lg shadow-md section-card content-section">
        <div class="mb-5 border-b border-gray-100 pb-3">
          <h2 class="text-xl font-bold text-gray-900">รีวิวล่าสุดจากชุมชน</h2>
          <p class="mt-1 text-sm text-gray-600">รีวิวล่าสุดจากผู้โดยสารท่านอื่นๆ</p>
        </div>

        <div
          v-if="loadingRecent"
          class="p-4 text-sm text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"
        >
          กำลังโหลด...
        </div>
        <div
          v-else-if="!recentReviews.length"
          class="p-6 text-sm text-center text-gray-500 bg-gray-50 border border-gray-100 rounded-lg"
        >
          ยังไม่มีรีวิวในระบบ
        </div>
        <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <li
            v-for="r in recentReviews"
            :key="r.id"
            class="p-4 transition-all bg-gray-50 border border-gray-100 rounded-xl hover:shadow-sm"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex gap-1 text-amber-400">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-4 h-4"
                  :class="i <= r.rating ? 'fill-current' : 'text-gray-300'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <span
                class="px-2 py-0.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-md"
              >
                {{ formatDate(r.createdAt) }}
              </span>
            </div>
            <p v-if="r.comment" class="mt-2 text-sm italic text-gray-700">
              "{{ r.comment }}"
            </p>
            <p
              v-if="r.tags && formatTags(r.tags)"
              class="mt-1 text-xs font-medium text-blue-800"
            >
              แท็ก: {{ formatTags(r.tags) }}
            </p>
            <div class="mt-3 pt-2 text-xs text-gray-500 border-t border-gray-200">
              <div>
                <strong class="font-medium text-gray-700">คนขับ:</strong>
                {{ r.driver.firstName }} {{ r.driver.lastName }}
              </div>
              <div class="mt-0.5">
                <strong class="font-medium text-gray-700">ผู้โดยสาร:</strong>
                <span v-if="r.isAnonymous" class="text-gray-400">ไม่แสดงชื่อ</span>
                <span v-else>{{ r.passenger?.firstName }} {{ r.passenger?.lastName }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Review modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          @click.self="closeModal"
        >
          <div
            class="w-full max-w-lg overflow-hidden transition-all transform bg-white rounded-2xl shadow-2xl"
          >
            <div class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h3 class="flex items-center text-lg font-bold text-gray-900">
                <svg
                  class="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                เขียนรีวิวทริป
              </h3>
              <button
                @click="closeModal"
                class="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="px-5 py-2 bg-blue-50/50 border-b border-blue-100">
              <p
                v-if="selectedTrip"
                class="text-sm font-medium text-blue-900 flex items-center"
              >
                <span class="truncate">{{ tripOrigin(selectedTrip) }}</span>
                <span class="mx-2 text-blue-400">→</span>
                <span class="truncate">{{ tripDest(selectedTrip) }}</span>
              </p>
              <p v-if="selectedTrip" class="mt-0.5 text-xs text-blue-700">
                คนขับ: {{ selectedTrip.route.driver.firstName }}
                {{ selectedTrip.route.driver.lastName }}
              </p>
            </div>

            <form class="p-5 space-y-5" @submit.prevent="submitReview">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-800">
                  ให้คะแนนความพึงพอใจ <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                      rating >= i
                        ? 'text-amber-500 bg-amber-50 border-2 border-amber-200 shadow-sm'
                        : 'text-gray-300 bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    ]"
                    @click="rating = i"
                  >
                    <svg
                      class="w-6 h-6"
                      :class="rating >= i ? 'fill-current' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-800">
                  จุดเด่นของทริปนี้ (เลือกได้มากกว่า 1)
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in tagOptions"
                    :key="tag.value"
                    type="button"
                    :class="[
                      'px-3 py-1.5 rounded-full text-xs transition-all border',
                      tags.includes(tag.value)
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    ]"
                    @click="toggleTag(tag.value)"
                  >
                    {{ tags.includes(tag.value) ? '✓ ' : '' }}{{ tag.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-800">
                  ความคิดเห็นเพิ่มเติม
                </label>
                <textarea
                  v-model="comment"
                  rows="3"
                  class="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="เล่าประสบการณ์การเดินทางให้เราฟังหน่อย..."
                ></textarea>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
              >
                <input
                  id="anon"
                  v-model="isAnonymous"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  for="anon"
                  class="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  ซ่อนชื่อของฉัน (รีวิวแบบไม่ระบุตัวตน)
                </label>
              </div>

              <div class="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                  @click="closeModal"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300 shadow-md transition-all flex justify-center items-center"
                  :disabled="submitting || !rating"
                >
                  <svg
                    v-if="submitting"
                    class="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ submitting ? 'กำลังส่งข้อมูล...' : 'ส่งรีวิวเลย' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
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
  { value: 'comfortable', label: 'นั่งสบาย' }
]

const tagLabels = tagOptions.reduce((acc, t) => {
  acc[t.value] = t.label
  return acc
}, /** @type {Record<string, string>} */ ({}))

function tripOrigin(trip) {
  const s = trip.route?.startLocation
  return s?.name || s?.address || '-'
}

function tripDest(trip) {
  const e = trip.route?.endLocation
  return e?.name || e?.address || '-'
}

function formatDate(d) {
  return d ? dayjs(d).format('D MMM BBBB') : '-'
}

function formatTags(val) {
  if (!val) return ''
  const arr = Array.isArray(val) ? val : Object.values(val)
  return arr.map((t) => tagLabels[t] || t).join(', ')
}

function toggleTag(v) {
  if (tags.value.includes(v)) {
    tags.value = tags.value.filter((t) => t !== v)
  } else {
    tags.value = [...tags.value, v]
  }
}

function openReviewForm(trip) {
  if (trip.canReview === false) {
    toast.error('ไม่สามารถเขียนรีวิวได้', 'ทริปนี้เลยกำหนด 7 วันสำหรับการเขียนรีวิวแล้ว')
    return
  }
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
        isAnonymous: isAnonymous.value
      }
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
    reviewableTrips.value = Array.isArray(res) ? res : res?.data || []
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

<style scoped>
.section-card {
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.12);
}

/* Modal Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>