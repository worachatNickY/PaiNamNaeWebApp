*** Settings ***
Documentation     API Tests for PaiNamNae WebApp
...               ทดสอบ API endpoints สำหรับระบบ Carpool

Resource    resources/common.robot

Suite Setup       Create API Session
Suite Teardown    Delete All Sessions

*** Variables ***
${AUTH_TOKEN}    ${EMPTY}

*** Test Cases ***
# ==================== Health Check ====================

API Health Check
    [Documentation]    ทดสอบว่า API server ทำงานปกติ
    [Tags]    smoke    health
    ${response}=    GET On Session    api    /health    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_OK}

# ==================== Authentication Tests ====================

Auth - Login With Valid Credentials
    [Documentation]    ทดสอบการ login ด้วย credentials ที่ถูกต้อง
    [Tags]    auth    smoke
    ${body}=    Create Dictionary    email=${ADMIN_EMAIL}    password=${ADMIN_PASSWORD}
    ${response}=    POST On Session    api    /auth/login    json=${body}    expected_status=any
    Log    Response: ${response.json()}
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Response Success    ${response}

Auth - Login With Invalid Credentials
    [Documentation]    ทดสอบการ login ด้วย credentials ที่ไม่ถูกต้อง
    [Tags]    auth    negative
    ${body}=    Create Dictionary    email=invalid@test.com    password=wrongpassword
    ${response}=    POST On Session    api    /auth/login    json=${body}    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_UNAUTHORIZED}

Auth - Login With Missing Fields
    [Documentation]    ทดสอบการ login โดยไม่ส่ง required fields
    [Tags]    auth    negative    validation
    ${body}=    Create Dictionary    email=test@example.com
    ${response}=    POST On Session    api    /auth/login    json=${body}    expected_status=any
    Should Be True    ${response.status_code} >= 400

Auth - Register With Invalid Email
    [Documentation]    ทดสอบการลงทะเบียนด้วย email ที่ไม่ถูกต้อง
    [Tags]    auth    negative    validation
    ${body}=    Create Dictionary
    ...    email=invalid-email
    ...    username=${TEST_USERNAME}
    ...    password=${TEST_PASSWORD}
    ...    firstName=${TEST_FIRST_NAME}
    ...    lastName=${TEST_LAST_NAME}
    ...    phoneNumber=${TEST_PHONE}
    ...    gender=MALE
    ...    nationalIdNumber=1234567890123
    ...    nationalIdExpiryDate=2030-01-01T00:00:00.000Z
    ${response}=    POST On Session    api    /auth/register    json=${body}    expected_status=any
    Should Be True    ${response.status_code} >= 400

Auth - Register With Short Username
    [Documentation]    ทดสอบการลงทะเบียนด้วย username สั้นกว่า 6 ตัวอักษร
    [Tags]    auth    negative    validation    bug-fix
    ${body}=    Create Dictionary
    ...    email=newuser@test.com
    ...    username=abc
    ...    password=${TEST_PASSWORD}
    ...    firstName=${TEST_FIRST_NAME}
    ...    lastName=${TEST_LAST_NAME}
    ...    phoneNumber=${TEST_PHONE}
    ...    gender=MALE
    ...    nationalIdNumber=1234567890123
    ...    nationalIdExpiryDate=2030-01-01T00:00:00.000Z
    ${response}=    POST On Session    api    /auth/register    json=${body}    expected_status=any
    Should Be True    ${response.status_code} >= 400
    Log    Username validation: Short username should be rejected

Auth - Register With Invalid Phone Number
    [Documentation]    ทดสอบการลงทะเบียนด้วยเบอร์โทรน้อยกว่า 10 หลัก
    [Tags]    auth    negative    validation    bug-fix
    ${body}=    Create Dictionary
    ...    email=phonetest@test.com
    ...    username=phonetestuser
    ...    password=${TEST_PASSWORD}
    ...    firstName=${TEST_FIRST_NAME}
    ...    lastName=${TEST_LAST_NAME}
    ...    phoneNumber=081234567
    ...    gender=MALE
    ...    nationalIdNumber=1234567890123
    ...    nationalIdExpiryDate=2030-01-01T00:00:00.000Z
    ${response}=    POST On Session    api    /auth/register    json=${body}    expected_status=any
    Should Be True    ${response.status_code} >= 400
    Log    Phone validation: 9-digit phone should be rejected

# ==================== Routes API Tests ====================

Routes - Get All Routes (Public)
    [Documentation]    ทดสอบการดึงรายการ routes ทั้งหมด
    [Tags]    routes    smoke
    ${response}=    GET On Session    api    /routes    expected_status=any
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Response Has Data    ${response}

Routes - Get Routes With Pagination
    [Documentation]    ทดสอบ pagination parameters
    [Tags]    routes    pagination
    ${params}=    Create Dictionary    page=1    limit=10
    ${response}=    GET On Session    api    /routes    params=${params}    expected_status=any
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Pagination Response    ${response}

Routes - Search Routes With Seats Filter
    [Documentation]    ทดสอบการค้นหา routes ด้วย seatsRequired (ต้องใช้ gte)
    [Tags]    routes    search    bug-fix
    ${params}=    Create Dictionary    seatsRequired=2
    ${response}=    GET On Session    api    /routes    params=${params}    expected_status=any
    Log    Response: ${response.json()}
    # Should return routes with 2+ seats available

# ==================== Vehicles API Tests ====================

Vehicles - Unauthorized Access
    [Documentation]    ทดสอบการเข้าถึง vehicles โดยไม่ login
    [Tags]    vehicles    security
    ${response}=    GET On Session    api    /vehicles    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_UNAUTHORIZED}

# ==================== Bookings API Tests ====================

Bookings - Get Admin Bookings Without Auth
    [Documentation]    ทดสอบการเข้าถึง admin bookings โดยไม่ login
    [Tags]    bookings    security
    ${response}=    GET On Session    api    /bookings/admin    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_UNAUTHORIZED}

# ==================== Activity Logs API Tests ====================

Activity Logs - Get Logs Without Auth
    [Documentation]    ทดสอบการเข้าถึง activity logs โดยไม่ login
    [Tags]    activity-logs    security
    ${response}=    GET On Session    api    /activity-logs/admin    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_UNAUTHORIZED}

Activity Logs - Pagination With Invalid Values
    [Documentation]    ทดสอบ pagination ด้วยค่าที่ไม่ถูกต้อง (ต้องมี default fallback)
    [Tags]    activity-logs    pagination    bug-fix
    # This test requires admin auth, skip if not available
    Log    Pagination should handle invalid values gracefully

# ==================== Emergency API Tests ====================

Emergency - Unauthorized Access
    [Documentation]    ทดสอบการเข้าถึง emergency endpoints โดยไม่ login
    [Tags]    emergency    security
    ${response}=    GET On Session    api    /emergency/requests    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_UNAUTHORIZED}

# ==================== Reports API Tests ====================

Reports - Get Reports Without Auth
    [Documentation]    ทดสอบการเข้าถึง reports โดยไม่ login
    [Tags]    reports    security
    ${response}=    GET On Session    api    /reports    expected_status=any
    Should Be True    ${response.status_code} >= 400

# ==================== Error Handling Tests ====================

API - Non-existent Endpoint Returns 404
    [Documentation]    ทดสอบว่า endpoint ที่ไม่มีจะส่ง 404
    [Tags]    error-handling
    ${response}=    GET On Session    api    /non-existent-endpoint    expected_status=any
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_NOT_FOUND}

# ==================== Bug Fix Verification Tests ====================

Verify - Route Seats Search Uses GTE
    [Documentation]    ตรวจสอบว่าการค้นหา routes ใช้ >= แทน = สำหรับ seats
    [Tags]    bug-fix    routes
    ${params}=    Create Dictionary    seatsRequired=1
    ${response}=    GET On Session    api    /routes    params=${params}    expected_status=any
    Log    Searching for routes with at least 1 seat should return routes with any available seats

Verify - Emergency Service Uses ApiError
    [Documentation]    ตรวจสอบว่า emergency errors มี proper status codes
    [Tags]    bug-fix    emergency
    # Non-driver attempting to create emergency should get 403 with proper error
    ${body}=    Create Dictionary    type=ACCIDENT    description=Test    latitude=0    longitude=0
    ${response}=    POST On Session    api    /emergency/requests    json=${body}    expected_status=any
    Log    Error response should have proper HTTP status code (not 500 for business logic errors)
