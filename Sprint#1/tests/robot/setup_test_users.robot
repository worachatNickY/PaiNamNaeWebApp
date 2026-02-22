*** Settings ***
Documentation    Script สำหรับสร้าง test users ใน production database
...               รัน script นี้ก่อนรัน tests เพื่อสร้าง users ที่จำเป็น
Library    RequestsLibrary
Library    Collections

Resource    resources/common.robot

*** Variables ***
# BASE_URL จะใช้จาก common.robot
# Test User Credentials (ใช้ชื่อเดียวกับ pbi_features_tests.robot)
${TEST_USERNAME}         testuser123
${TEST_USER_EMAIL}       testuser@example.com
${TEST_USER_PASSWORD}    123123aq
${TEST_FIRST_NAME}       Test
${TEST_LAST_NAME}        User
${TEST_PHONE}            0812345678

# Test Driver Credentials
${TEST_DRIVER_USERNAME}    testdriver123
${TEST_DRIVER_EMAIL}       testdriver@example.com
${TEST_DRIVER_PASSWORD}    123123aq
${TEST_DRIVER_FIRST_NAME}    Test
${TEST_DRIVER_LAST_NAME}    Driver
${TEST_DRIVER_PHONE}        0822345678

*** Test Cases ***
Setup Test Users
    [Documentation]    สร้าง test users สำหรับการทดสอบ
    Create API Session
    Create Test Passenger User
    Create Test Driver User
    Verify Admin User
    Log To Console    Test users setup completed!

*** Keywords ***
Create API Session
    Create Session    api    ${BASE_URL}    verify=${False}

Create Test Passenger User
    [Documentation]    สร้าง test passenger user
    # ลอง login ก่อน (ถ้ามีอยู่แล้วจะ skip)
    ${login_body}=    Create Dictionary    email=${TEST_USER_EMAIL}    password=${TEST_USER_PASSWORD}
    ${login_response}=    POST On Session    api    /auth/login    json=${login_body}    expected_status=any
    
    Return From Keyword If    ${login_response.status_code} == 200
    
    # สร้าง user ใหม่ (ต้องมีข้อมูลครบตาม validation)
    ${register_body}=    Create Dictionary
    ...    username=${TEST_USERNAME}
    ...    email=${TEST_USER_EMAIL}
    ...    password=${TEST_USER_PASSWORD}
    ...    firstName=${TEST_FIRST_NAME}
    ...    lastName=${TEST_LAST_NAME}
    ...    phoneNumber=${TEST_PHONE}
    ...    gender=MALE
    ...    nationalIdNumber=1234567890123
    ...    nationalIdExpiryDate=2030-12-31T00:00:00.000Z
    
    ${register_response}=    POST On Session    api    /users    json=${register_body}    expected_status=any
    
    IF    ${register_response.status_code} == 201
        Log To Console    Created test passenger user: ${TEST_USER_EMAIL}
    ELSE
        Log To Console    Failed to create test passenger user: ${register_response.status_code} - ${register_response.text}
    END

Create Test Driver User
    [Documentation]    สร้าง test driver user
    # ลอง login ก่อน (ถ้ามีอยู่แล้วจะ skip)
    ${login_body}=    Create Dictionary    email=${TEST_DRIVER_EMAIL}    password=${TEST_DRIVER_PASSWORD}
    ${login_response}=    POST On Session    api    /auth/login    json=${login_body}    expected_status=any
    
    Return From Keyword If    ${login_response.status_code} == 200
    
    # สร้าง driver user ใหม่ (ต้องมีข้อมูลครบตาม validation)
    ${register_body}=    Create Dictionary
    ...    username=${TEST_DRIVER_USERNAME}
    ...    email=${TEST_DRIVER_EMAIL}
    ...    password=${TEST_DRIVER_PASSWORD}
    ...    firstName=${TEST_DRIVER_FIRST_NAME}
    ...    lastName=${TEST_DRIVER_LAST_NAME}
    ...    phoneNumber=${TEST_DRIVER_PHONE}
    ...    gender=MALE
    ...    nationalIdNumber=9876543210987
    ...    nationalIdExpiryDate=2030-12-31T00:00:00.000Z
    
    ${register_response}=    POST On Session    api    /users    json=${register_body}    expected_status=any
    
    IF    ${register_response.status_code} == 201
        Log To Console    Created test driver user: ${TEST_DRIVER_EMAIL}
    ELSE
        Log To Console    Failed to create test driver user: ${register_response.status_code} - ${register_response.text}
    END
    
    # Note: Driver user จะต้อง verify เป็น driver ผ่าน driver verification flow
    # แต่สำหรับ test พื้นฐาน (PBI08-007) อาจไม่จำเป็นต้อง verify ก็ได้

Verify Admin User
    [Documentation]    ตรวจสอบว่า admin user มีอยู่และ login ได้
    ${login_body}=    Create Dictionary    email=${ADMIN_EMAIL}    password=${ADMIN_PASSWORD}
    ${login_response}=    POST On Session    api    /auth/login    json=${login_body}    expected_status=any
    
    IF    ${login_response.status_code} == 200
        Log To Console    Admin user exists and can login: ${ADMIN_EMAIL}
    ELSE
        Log To Console    Admin user not available: ${ADMIN_EMAIL} - Status: ${login_response.status_code}
        Log To Console    Please set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME in Railway Variables
    END
