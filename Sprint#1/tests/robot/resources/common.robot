*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Library    DateTime

*** Variables ***
# เปลี่ยนเป็น production URL สำหรับทดสอบกับเว็บที่ deploy แล้ว
${BASE_URL}           https://painamnaewebapp-production.up.railway.app/api
${FRONTEND_URL}       https://csse4169.cpkku.com

# Test User Credentials (สำหรับทดสอบ)
${TEST_USERNAME}      testuser123
${TEST_EMAIL}         testuser@example.com
${TEST_PASSWORD}      123123aq
${TEST_FIRST_NAME}    Test
${TEST_LAST_NAME}     User
${TEST_PHONE}         0812345678

# Test Driver Credentials (สำหรับทดสอบ)
${TEST_DRIVER_USERNAME}    testdriver123
${TEST_DRIVER_EMAIL}       testdriver@example.com
${TEST_DRIVER_PASSWORD}    123123aq
${TEST_DRIVER_FIRST_NAME}  Test
${TEST_DRIVER_LAST_NAME}   Driver
${TEST_DRIVER_PHONE}       0822345678

# Admin Credentials
${ADMIN_EMAIL}        admin@csgroup41.cpkku.com
${ADMIN_PASSWORD}     123123aq

# Response Status
${STATUS_OK}          200
${STATUS_CREATED}     201
${STATUS_BAD_REQUEST}     400
${STATUS_UNAUTHORIZED}    401
${STATUS_FORBIDDEN}       403
${STATUS_NOT_FOUND}       404

*** Keywords ***
Create API Session
    [Documentation]    Create a session for API requests
    [Arguments]    ${verify_ssl}=${False}
    Create Session    api    ${BASE_URL}    verify=${verify_ssl}    disable_warnings=${True}

Login And Get Token
    [Documentation]    Login and return the auth token
    [Arguments]    ${email}    ${password}
    Create API Session
    ${body}=    Create Dictionary    email=${email}    password=${password}
    ${response}=    POST On Session    api    /auth/login    json=${body}
    Should Be Equal As Strings    ${response.status_code}    ${STATUS_OK}
    ${token}=    Set Variable    ${response.json()['data']['token']}
    RETURN    ${token}

Create Authorized Header
    [Documentation]    Create header with Bearer token
    [Arguments]    ${token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    RETURN    ${headers}

Validate Response Success
    [Documentation]    Validate that response has success: true
    [Arguments]    ${response}
    ${json}=    Set Variable    ${response.json()}
    Should Be True    ${json['success']}

Validate Response Has Data
    [Documentation]    Validate that response contains data field
    [Arguments]    ${response}
    ${json}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    data

Validate Pagination Response
    [Documentation]    Validate that response contains pagination fields
    [Arguments]    ${response}
    ${json}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    pagination
    ${pagination}=    Set Variable    ${json['pagination']}
    Dictionary Should Contain Key    ${pagination}    page
    Dictionary Should Contain Key    ${pagination}    limit
    Dictionary Should Contain Key    ${pagination}    total
    Dictionary Should Contain Key    ${pagination}    totalPages
