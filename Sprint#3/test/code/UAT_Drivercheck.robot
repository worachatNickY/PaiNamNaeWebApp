*** Settings ***
Library           SeleniumLibrary   run_on_failure=Nothing
Suite Teardown    Close All Browsers

*** Variables ***
${URL}               https://csse4169.cpkku.com/
${BROWSER}           Edge
${PASSENGER_USER}    user1111
${PASSWORD}          123123aq

# --- Selectors ---
${MENU_ALL_TRIPS}        xpath=//button[contains(.,'การเดินทางทั้งหมด')]
${BTN_VIEW_CHAT_LOG}  xpath=//button[contains(.,'ดูประวัติแชท')]
${LINK_MY_ROUTE_REQUESTS}  xpath=//a[@href='/myRoute' and contains(.,'คำขอจองเส้นทางของฉัน')]
${CHAT_TEXTAREA}     xpath=//textarea[contains(@placeholder,'พิมพ์ข้อความของคุณ')]
${SEND_BUTTON}       xpath=//button[contains(.,'ส่ง')]
${MY_TRIPS}          xpath=//a[contains(.,'การเดินทางของฉัน')]
${CONFIRM_TRIP_BTN}  xpath=//button[contains(.,'ยืนยันแล้ว')]
${CHAT_WITH_DRIVER}  xpath=//button[contains(.,'แชทกับผู้ขับ')]
${TAB_COMPLETED}         xpath=//button[contains(.,'สิ้นสุดการเดินทางแล้ว')]
${CHAT_CLOSED_TEXT}      แชทนี้ไม่สามารถใช้งานได้แล้ว เนื่องจากการเดินทางเสร็จสิ้น

*** Keywords ***
Login To System
    [Arguments]    ${username}    ${password}
    Go To    ${URL}/login
    Wait Until Element Is Visible    id=identifier    10s
    Input Text      id=identifier    ${username}
    Input Password   id=password    ${password}
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]

Go To Chat Room
    # ใส่ขั้นตอนการเข้าหน้าแชทของผู้โดยสารที่นี่
    Wait Until Element Is Visible    xpath=//a[contains(.,'การเดินทางของฉัน')]    10s
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    # ... (ขั้นตอนกดเข้าแชทเหมือนที่เคยเขียน)



*** Test Cases ***
SC-1.1: Verify Chat Status After Trip Completed
    [Documentation]    ตรวจสอบว่าทริปที่จบแล้วต้องพิมพ์แชทไม่ได้และมีข้อความเตือน
    [Tags]    Security
    
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Login To System    ${PASSENGER_USER}    ${PASSWORD}

    Wait Until Element Is Visible    ${MY_TRIPS}    10s
    Click Element    ${MY_TRIPS}

    Wait Until Element Is Visible    ${TAB_COMPLETED}    10s
    Click Button    ${TAB_COMPLETED}
    
    Wait Until Element Is Visible    ${BTN_VIEW_CHAT_LOG}    10s
    Click Button    ${BTN_VIEW_CHAT_LOG}
    
    Wait Until Page Contains    ${CHAT_CLOSED_TEXT}    10s
    
    Page Should Not Contain Element    ${CHAT_TEXTAREA}
    Log To Console    \n[SUCCESS] Chat is secured and read-only after trip completion.

