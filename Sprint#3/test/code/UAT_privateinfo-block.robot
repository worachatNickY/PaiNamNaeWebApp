*** Settings ***
Library           SeleniumLibrary    run_on_failure=Nothing
Library           String
Library           Collections

Suite Setup         Prepare Browser and Login
Suite Teardown      Close Browser

*** Variables ***
${URL}              https://csse4169.cpkku.com/
${BROWSER}          Edge
${USER_PASSENGER}   user1111
${PASS_PASSWORD}    123123aq

${CHAT_TEXTAREA}     xpath=//textarea[contains(@placeholder,'พิมพ์ข้อความของคุณ')]
${SEND_BUTTON}       xpath=//button[contains(.,'ส่ง')]
${MY_TRIPS}          xpath=//a[contains(.,'การเดินทางของฉัน')]
${CONFIRM_TRIP_BTN}  xpath=//button[contains(.,'ยืนยันแล้ว')]
${CHAT_WITH_DRIVER}  xpath=//button[contains(.,'แชทกับผู้ขับ')]
${CONFIRM_SEND_BTN}  xpath=//button[contains(., 'ใช่ ฉันต้องการจะส่ง')]
${CANCEL_SEND_BTN}   xpath=//button[contains(., 'ยกเลิก')]

*** Keywords ***
Prepare Browser
    Set Selenium Speed    0.3s
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Go To Login Page
    Go To    ${URL}
    Wait Until Element Is Visible    xpath=//a[contains(text(),'เข้าสู่ระบบ')]    15s
    Click Link    xpath=//a[contains(text(),'เข้าสู่ระบบ')]

Login To System
    [Arguments]    ${username}    ${password}
    Wait Until Element Is Visible    id=identifier    5s
    Input Text      id=identifier    ${username}
    Input Password   id=password    ${password}
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Element Is Visible    ${MY_TRIPS}    10s

Prepare Browser and Login
    Prepare Browser
    Go To Login Page
    Login To System    ${USER_PASSENGER}    ${PASS_PASSWORD}
    Click Element    ${MY_TRIPS}
    Wait Until Page Contains    การเดินทางของฉัน    10s
    Wait Until Element Is Visible    ${CONFIRM_TRIP_BTN}    10s
    Click Button    ${CONFIRM_TRIP_BTN}
    Wait Until Element Is Visible    ${CHAT_WITH_DRIVER}    10s
    Click Button    ${CHAT_WITH_DRIVER}
    Wait Until Element Is Visible    ${CHAT_TEXTAREA}    10s

Validate And Send Message
    [Arguments]    ${message}    ${allow_personal}=${FALSE}
    Clear Element Text    ${CHAT_TEXTAREA}
    Input Text            ${CHAT_TEXTAREA}    ${message}
    Click Button          ${SEND_BUTTON}
    
    
    Wait Until Page Contains    ยืนยันการส่งเนื้อหาที่อาจเป็นข้อมูลส่วนบุคคล    10s
    Click Button    xpath=//button[contains(@class, 'bg-blue-600') and contains(., 'ใช่ ฉันต้องการจะส่ง')]
    Wait Until Page Contains    ${message}    10s
    Sleep    0.5s

*** Test Cases ***

SC-1.1: Block Phone Numbers
    [Tags]    Security
    Validate And Send Message    โทรมานะ 0812345678
    Validate And Send Message    ติดต่อที่ 66812345678
    
    # เริ่มทดสอบ Regex
    Validate And Send Message    โทรมานะ 0812345678
    Validate And Send Message    ติดต่อที่ 66812345678

SC-1.2: Block Social Media IDs
    [Tags]    Security
    Validate And Send Message    แอดไลน์มานะ id: myline123
    Validate And Send Message    facebook: taranon
    Validate And Send Message    ตามที่ @ig_name เลย

SC-1.3: Block Physical Address
    [Tags]    Security
    Validate And Send Message    ส่งของที่ หมู่บ้านแสนสุข ซอย 5 ถนนมิตรภาพ

SC-1.4: Allow Personal Info When Options Set
    [Tags]    Security
    Validate And Send Message    0812345678    allow_personal=${TRUE}