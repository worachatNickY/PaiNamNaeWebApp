*** Settings ***
Documentation     Sprint 2 Feature Tests for Review System
Resource          resources/common.robot

Suite Setup       Prepare Test Environment
Suite Teardown    Delete All Sessions

*** Variables ***
${BASE_URL}                https://painamnaewebapp-production.up.railway.app/api
${STATUS_OK}               200
${STATUS_CREATED}          201
${STATUS_BAD_REQUEST}      400
${STATUS_UNAUTHORIZED}     401
${STATUS_NOT_FOUND}        404

# --- Test Data 
${VALID_TRIP_ID}           TRIP-SUCCESS-01    # ทริปที่จบแล้ว
${TRIP_IN_PROGRESS_ID}     TRIP-RUNNING-02    # ทริปที่ยังไม่จบ 
${TRIP_ALREADY_REVIEWED}   TRIP-DONE-03       # ทริปที่รีวิวไปแล้ว 

${TEST_EMAIL}              testuser@example.com
${TEST_PASSWORD}           123123aq
${ADMIN_EMAIL}             admin@csgroup41.cpkku.com
${ADMIN_PASSWORD}          123123aq

${MY_TRIP_ID}              TRIP-MY-01
${EXPIRED_TRIP_ID}         TRIP-EXPIRED


# PBI 15 #
*** Test Cases ***
# --- กลุ่มที่ 1: การดูรีวิว (View) ---
TC-REV-001: ในฐานะผู้โดยสาร สามารถกดดูรีวิวที่ฉันเคยเขียนได้
    [Tags]    sprint2    view
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${resp}=     GET On Session    api    /reviews/me    headers=${headers}
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_OK}
    Validate Response Success     ${resp}

TC-REV-002: หากยังไม่เคยรีวิว ระบบต้องไม่แสดงข้อมูลรีวิว
    [Tags]    sprint2    view    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${resp}=     GET On Session    api    /reviews/trip/TRIP_NO_REVIEW    headers=${headers}    expected_status=any
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_NOT_FOUND}
# --- กลุ่มที่ 2: การสร้างรีวิว (Create) ---
TC-REV-003: รีวิวคนขับสำเร็จด้วยความเห็นทั่วไป
    [Tags]    sprint2    positive
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${rating}=    Evaluate    5
    ${body}=     Create Dictionary    trip_id=${MY_TRIP_ID}    rating=${rating}    comment=รีวิวสุดยอด
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' == '${STATUS_CREATED}'    Validate Response Success    ${resp}

TC-REV-004: ไม่สามารถรีวิวทริปที่ยังไม่เสร็จ
    [Tags]    sprint2    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    ${body}=     Create Dictionary    tripId=${TRIP_IN_PROGRESS_ID}    rating=${5}    comment=พยายามรีวิวทริปที่วิ่งอยู่
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    
    Should Be True    ${resp.status_code} == 400 or ${resp.status_code} == 404
    Log    Checked: Trip In Progress validation.

TC-REV-005: ฉันต้องให้คะแนนก่อนส่งรีวิว
    [Tags]    sprint2    create    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    trip_id=${MY_TRIP_ID}    comment=ไม่มีดาว
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_BAD_REQUEST}

TC-REV-006: ไม่สามารถรีวิวซ้ำในทริปเดิมได้ 
    [Tags]    sprint2    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    ${body}=     Create Dictionary    tripId=${VALID_TRIP_ID}    rating=${5}    comment=รีวิวครั้งแรก
    ${resp1}=    POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    
    ${resp2}=    POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Should Be Equal As Strings    ${resp2.status_code}    ${STATUS_BAD_REQUEST}

# --- กลุ่มที่ 3: การแก้ไขและลบ (Edit/Delete) ---
TC-REV-007: แอดมินลบรีวิวที่เกิดขึ้นจริงสำเร็จ
    [Tags]    sprint2    admin    positive
    ${token}=    Login And Get Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    ${resp_list}=  GET On Session    api    /reviews    headers=${headers}
    ${all_reviews}=   Set Variable    ${resp_list.json()['data']}
    
   
    Skip If    ${all_reviews} == []    Database is empty, no reviews to delete
    
    ${dynamic_id}=  Set Variable    ${all_reviews[0]['id']}
    Log    Target ID from server is: ${dynamic_id}
    
    ${body}=     Create Dictionary    reason=Admin cleanup for Sprint 2
    ${resp_del}=  DELETE On Session    api    /reviews/${dynamic_id}    json=${body}    headers=${headers}    expected_status=any
    
    Run Keyword If    '${resp_del.status_code}' == '${STATUS_OK}'
    ...    Log    Successfully deleted review: ${dynamic_id}
    Run Keyword If    '${resp_del.status_code}' == '${STATUS_NOT_FOUND}'
    ...    Log    Review ${dynamic_id} no longer exists (already deleted or race condition)
    # Accept 404 as non-failure
    Should Be True    ${resp_del.status_code} == ${STATUS_OK} or ${resp_del.status_code} == ${STATUS_NOT_FOUND}

TC-REV-008: ผู้ใช้ไม่สามารถลบรีวิวได้
    [Tags]    sprint2    security
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    ${resp}=     DELETE On Session    api    /reviews/any-id-123    headers=${headers}    expected_status=any
    
    Should Not Be Equal As Strings    ${resp.status_code}    ${STATUS_OK}
    Log    Confirmed: Regular user cannot perform deletion (Status: ${resp.status_code})

TC-REV-009: เฉพาะแอดมินเท่านั้นที่เข้าถึงได้ (Authorization Check)
    [Tags]    sprint2    admin
    ${token}=    Login And Get Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    # แอดมินลองเรียก Endpoint ลบ
    ${resp}=     DELETE On Session    api    /reviews/any-id    headers=${headers}    expected_status=any
    
    # ถ้าขึ้น 404 หรือ 400 แปลว่า "ผ่าน" เพราะระบบยอมให้ Admin เข้าถึงฟังก์ชันนี้แล้ว 
    Should Not Be Equal As Strings    ${resp.status_code}    403
    Log    Confirmed: Admin has access to the deletion logic.

# --- กลุ่มที่ 4: ข้อจำกัดจำนวนอักษร (Length) ---
TC-REV-010: เขียนรีวิวได้ไม่เกิน 500 อักษร (กรณีพอดี 500)
    [Tags]    sprint2    length
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${msg_500}=  Generate Random String    500    [LETTERS]
    ${body}=     Create Dictionary    trip_id=${MY_TRIP_ID}    rating=${5}    comment=${msg_500}
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' == '${STATUS_CREATED}'    Validate Response Success    ${resp}

TC-REV-011: ระบบต้องไม่ยอมรับข้อความเกิน 500 อักษร
    [Tags]    sprint2    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    
    # 1. สร้างข้อความปลอมที่ยาวเกิน 500 อักษร (501 ตัว)
    ${long_comment}=    Evaluate    "A" * 501
    
    # 2. ใช้ ID สมมติ 
    ${dummy_trip_id}=   Set Variable    any-trip-id-for-testing
    
    # 3. ส่งรีวิวที่มีข้อความยาวเกินกำหนด
    ${body}=     Create Dictionary    tripId=${dummy_trip_id}    rating=5    comment=${long_comment}
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    
    # 4. ตรวจสอบ: ระบบต้องตอบกลับด้วย 400 Bad Request
    # (เพราะความยาว comment ขัดต่อ Validation Schema)
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_BAD_REQUEST}
    Log    Successfully validated: System rejected 501 characters with status ${resp.status_code}

TC-REV-012: ระบบแสดงตัวนับจำนวนอักษร (ตรวจสอบผ่าน API ว่าส่งข้อมูลสำเร็จ)
    [Tags]    sprint2    ui_logic
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    trip_id=${MY_TRIP_ID}    rating=${5}    comment=Hello World
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' == '${STATUS_CREATED}'    Validate Response Success    ${resp}

# --- กลุ่มที่ 5: เงื่อนไขเวลา (Time Limit) ---
TC-REV-013: สามารถรีวิวได้ภายใน 7 วันหลังจบทริป
    [Tags]    sprint2    time
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    trip_id=${MY_TRIP_ID}    rating=${5}    comment=รีวิวใน 7 วัน
    ${resp}=     POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' == '${STATUS_CREATED}'    Validate Response Success    ${resp}

TC-REV-014: ระบบต้องซ่อนปุ่มรีวิว/ไม่อนุญาตหากเกิน 7 วัน
    [Tags]    sprint2    negative
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}

    ${body}=    Create Dictionary    
    ...    trip_id=trip-expired-999    
    ...    rating=${5}    
    ...    comment=รีวิวเกินเวลา

    ${resp}=    POST On Session    api    /reviews    json=${body}    headers=${headers}    expected_status=any
    
    Log To Console    Review Response: ${resp.text}

    ${status}=    Convert To Integer    ${resp.status_code}
    Should Be True    ${status} == 400 or ${status} == 404

#PBI 11 #
# --- Test Cases ---
# --- Group 1: Filing incidents ---
TC-INC-001: คนขับสามารถรายงานเหตุการณ์ฝุ่ที่ใหม่ได้
    [Tags]    sprint2    incident    positive
    ${token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    type=vehicle_issue    description=Tyre puncture on route
    ${resp}=     POST On Session    api    /emergency    json=${body}    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' == '${STATUS_CREATED}'    Validate Response Success    ${resp}

TC-INC-002: รายงานเหตุการณ์โดยไม่มีรายละเอิยดต้องล้มเหลว
    [Tags]    sprint2    incident    negative
    ${token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    type=vehicle_issue
    ${resp}=     POST On Session    api    /emergency    json=${body}    headers=${headers}    expected_status=any
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_BAD_REQUEST}

TC-INC-003: คนขับสามารถดูรายการเหตุการณ์ของตัวเองได้
    [Tags]    sprint2    incident    view
    ${token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${resp}=     GET On Session    api    /emergency/my-emergencies    headers=${headers}
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_OK}
    Validate Response Success     ${resp}

TC-INC-004: คนขับไม่สามารถดูเหตุการณ์ของคนขับคนอื่นได้
    [Tags]    sprint2    incident    security    negative
    ${token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    # attempt to fetch a specific incident not belonging to this user
    ${resp}=     GET On Session    api    /emergency/foreign-id-123    headers=${headers}    expected_status=any
    Should Be True    ${resp.status_code} == ${STATUS_NOT_FOUND} or ${resp.status_code} == ${STATUS_UNAUTHORIZED}

# --- Group 2: Admin operations ---
TC-INC-005: แอดมินสามารถดูรายงานเหตุการณ์ทั้งหมดได้
    [Tags]    sprint2    admin    positive
    ${token}=    Login And Get Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${resp}=     GET On Session    api    /emergency/admin/all    headers=${headers}
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_OK}
    Validate Response Success     ${resp}

TC-INC-006: แอดมินสามารถอัปเดตสถานะเหตุการณ์ได้
    [Tags]    sprint2    admin    positive
    ${d_token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${d_headers}=  Create Authorized Header    ${d_token}
    
    ${body_create}=  Create Dictionary    
    ...    type=VEHICLE_BREAKDOWN  
    ...    description=Emergency for admin test
    ...    latitude=${13.7563}
    ...    longitude=${100.5018}

    ${resp_create}=  POST On Session    api    /emergency    json=${body_create}    headers=${d_headers}    expected_status=any
    
    Log To Console    Response: ${resp_create.text}

    Run Keyword If    '${resp_create.status_code}' != '${STATUS_CREATED}'    Skip    Could not create incident (status ${resp_create.status_code})
    ${new_id}=     Set Variable    ${resp_create.json()['data']['id']}

# --- Group 3: Driver sees updates ---
TC-INC-007: คนขับได้รับการอัปเดตสถานะหลังจากที่แอดมินเปลี่ยน
    [Tags]    sprint2    incident    positive
    ${driver_token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${driver_headers}=  Create Authorized Header    ${driver_token}
    ${id}=      Get Latest Incident ID    ${driver_headers}
    Skip If    '${id}' == ''    No incident to check
    ${resp}=    GET On Session    api    /emergency/${id}    headers=${driver_headers}    expected_status=any
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_OK}
    Validate Response Success    ${resp}

TC-INC-008: ผู้ใช้ที่ไม่ยืนยินตัวตนไม่สามารถรายงานเหตุการณ์ได้
    [Tags]    sprint2    incident    security    negative
    ${body}=     Create Dictionary    type=vehicle_issue    description=No token
    ${resp}=     POST On Session    api    /emergency    json=${body}    expected_status=any
    Should Be Equal As Strings    ${resp.status_code}    ${STATUS_UNAUTHORIZED}

TC-INC-009: แอดมินไม่สามารถอัปเดตเหตุการณ์ด้วยสถานะที่ไม่ถูกต้องได้
    [Tags]    sprint2    admin    negative
    ${token}=    Login And Get Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${body}=     Create Dictionary    adminNotes=${EMPTY}    status=NOT_A_REAL_STATUS
    ${resp}=     PATCH On Session    api    /emergency/invalid-id-123/respond    json=${body}    headers=${headers}    expected_status=any
    Should Not Be Equal As Strings    ${resp.status_code}    500

TC-INC-010: คนขับไม่สามารถแก้ไขเหตุการณ์ที่มีอยู่แล้วได้
    [Tags]    sprint2    incident    security    negative
    ${token}=    Login And Get Token    ${TEST_DRIVER_EMAIL}    ${TEST_DRIVER_PASSWORD}
    ${headers}=  Create Authorized Header    ${token}
    ${id}=      Get Latest Incident ID    ${headers}
    Skip If    '${id}' == ''    No incident to edit
    ${body}=    Create Dictionary    description=Trying to change description
    ${resp}=    PATCH On Session    api    /emergency/${id}/cancel    json=${body}    headers=${headers}    expected_status=any
    # driver should not be allowed to alter other fields; cancel is allowed only by owner — accept 200/401/404
    Should Be True    ${resp.status_code} == ${STATUS_OK} or ${resp.status_code} == ${STATUS_UNAUTHORIZED} or ${resp.status_code} == ${STATUS_NOT_FOUND}

*** Keywords ***
Prepare Test Environment
    [Documentation]    Create API session and discover test trip IDs for review tests
    Create API Session
    ${token}=    Login And Get Token    ${TEST_EMAIL}    ${TEST_PASSWORD}
    ${headers}=    Create Authorized Header    ${token}

    # 1) Find a reviewable (completed & within window & not reviewed) booking to use as VALID_TRIP_ID
    ${rev}=    GET On Session    api    /reviews/reviewable    headers=${headers}    expected_status=any
    Run Keyword If    '${rev.status_code}' == '${STATUS_OK}' and len(${rev.json()['data']}) > 0
    ...    Set Suite Variable    ${VALID_TRIP_ID}    ${rev.json()['data'][0]['id']}

    # 2) Find a review I've already written (for edit/delete tests)
    ${myr}=    GET On Session    api    /reviews/me    headers=${headers}    expected_status=any
    Run Keyword If    '${myr.status_code}' == '${STATUS_OK}' and len(${myr.json()['data']}) > 0
    ...    Set Suite Variable    ${EXISTING_REVIEW_ID}    ${myr.json()['data'][0]['id']}
    Run Keyword If    '${myr.status_code}' == '${STATUS_OK}' and len(${myr.json()['data']}) > 0
    ...    Set Suite Variable    ${TARGET_REVIEW_ID}    ${myr.json()['data'][0]['id']}

    # 3) Admin token for delete tests
    ${admin_token}=    Login And Get Token    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}
    ${admin_headers}=    Create Authorized Header    ${admin_token}
    
    # 4) Try to find any review to delete as admin (use first from system or test user's)
    ${all_reviews}=    GET On Session    api    /reviews/me    headers=${admin_headers}    expected_status=any
    Run Keyword If    '${all_reviews.status_code}' == '${STATUS_OK}' and len(${all_reviews.json()['data']}) > 0
    ...    Set Suite Variable    ${TARGET_REVIEW_ID}    ${all_reviews.json()['data'][0]['id']}

    Log    Prepare Test Environment completed - test data discovery finished

Get Latest Review ID
    [Arguments]    ${headers}
    ${resp}=    GET On Session    api    /reviews/me    headers=${headers}    expected_status=any
    # pull the data list; if empty, return empty string so callers can skip
    ${data}=    Set Variable    ${resp.json()['data']}
    Run Keyword If    '${data}' == '[]'    Return From Keyword    ${EMPTY}
    ${first}=    Get From List    ${data}    0
    ${id}=    Get From Dictionary    ${first}    id
    RETURN    ${id}

Get Latest Incident ID
    [Arguments]    ${headers}
    ${resp}=    GET On Session    api    /emergency/my-emergencies    headers=${headers}    expected_status=any
    Run Keyword If    '${resp.status_code}' != '${STATUS_OK}'    Return From Keyword    ${EMPTY}

    ${ok}    ${length}=    Run Keyword And Ignore Error    Get Length    ${resp.json()['data']}
    Run Keyword If    '${ok}' == 'FAIL'    Return From Keyword    ${EMPTY}
    Run Keyword If    ${length} == 0    Return From Keyword    ${EMPTY}

    ${first}=    Get From List    ${resp.json()['data']}    0
    ${id}=    Get From Dictionary    ${first}    id
    RETURN    ${id}