*** Settings ***
Library    SeleniumLibrary    run_on_failure=Nothing

Suite Setup     Prepare Browser
Suite Teardown  Close Browser

*** Variables ***
${URL}              https://csse4169.cpkku.com/
${BROWSER}          Edge
${USER_PASSENGER}   user1111
${PASS_PASSWORD}    123123aq


# Selectors (ย้ายมาเก็บตรงนี้เพื่อให้แก้ที่เดียวจบ)
${SEND_BUTTON_SPAN}    xpath=//button[.//span[contains(text(),'ส่ง')]]
${CHAT_TEXTAREA}    xpath=//textarea[contains(@placeholder,'พิมพ์ข้อความของคุณ')]
${SEND_BUTTON}      xpath=//button[contains(.,'ส่ง')]
${MY_TRIPS}         xpath=//a[contains(.,'การเดินทางของฉัน')]
${CONFIRM_TRIP_BTN}    xpath=//button[contains(.,'ยืนยันแล้ว')]
${CHAT_WITH_DRIVER}     xpath=//button[contains(.,'แชทกับผู้ขับ')]
${SHARE_LOC_ICON}    xpath=//*[local-name()='svg' and .//*[contains(@d, 'M12 13.25a3.25')]]
${CONFIRM_SEND_BTN}  xpath=//button[contains(., 'ใช่ ฉันต้องการจะส่ง')]
${UPLOAD_ICON}      xpath=//button[.//svg[contains(@class, 'h-5 w-5')]]/preceding-sibling::button[1]
${FILE_INPUT}       xpath=//input[@type='file']
${IMAGE_PATH}       ${CURDIR}${/}test-image.png
${OPEN_IMAGE_TEXT}   xpath=//*[contains(text(),'เปิดรูปภาพ')]

*** Keywords ***
Prepare Browser
    Set Selenium Speed    0.5s
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Go To Login Page
    Go To    ${URL}login
    Wait Until Element Is Visible    xpath=//a[contains(text(),'เข้าสู่ระบบ')]    15s
    Click Link    xpath=//a[contains(text(),'เข้าสู่ระบบ')]

Login To System
    [Arguments]    ${username}    ${password}
    Go To    ${URL}login
    Wait Until Element Is Visible    id=identifier    10s
    Input Text      id=identifier    ${username}
    Input Password   id=password    ${password}
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Element Is Visible    ${MY_TRIPS}    5s

Go To My Trips
    Click Element    ${MY_TRIPS}
    Wait Until Page Contains    การเดินทางของฉัน    15s

Chat With Driver
    Click Button    ${CHAT_WITH_DRIVER}
    Wait Until Element Is Visible    ${CHAT_INPUT}    10s
    Input Text      ${CHAT_INPUT}    สวัสดีครับ
    Click Element    ${CHAT_TEXTAREA}

Open Chat Popup
    Wait Until Element Is Visible    ${CONFIRM_TRIP_BTN}    10s
    Click Button    ${CONFIRM_TRIP_BTN}
    Wait Until Element Is Visible    ${CHAT_WITH_DRIVER}    15s
    Click Button    ${CHAT_WITH_DRIVER}
    Wait Until Element Is Visible    ${CHAT_TEXTAREA}    10s

Share Location And Confirm
    Wait Until Element Is Visible    ${SHARE_LOC_ICON}    10s
    Click Element    ${SHARE_LOC_ICON}
    Wait Until Page Contains    ยืนยันการส่งเนื้อหาที่อาจเป็นข้อมูลส่วนบุคคล    10s
    Wait Until Element Is Visible    ${CONFIRM_SEND_BTN}    10s
    Click Button    ${CONFIRM_SEND_BTN}
    Sleep    2s
    Wait Until Page Contains    แชร์ตำแหน่ง   10s

Upload Image And Verify
    [Documentation]    เลือกรูปภาพจากเครื่องและตรวจสอบว่าปรากฏในแชท
    Choose File    ${FILE_INPUT}    ${IMAGE_PATH}
    
    Wait Until Element Is Visible    ${CONFIRM_SEND_BTN}    10s
    Click Button    ${CONFIRM_SEND_BTN}
    
    Wait Until Element Is Visible    ${OPEN_IMAGE_TEXT}    30s
    Log To Console    ส่งรูปภาพสำเร็จและปรากฏปุ่มเปิดรูปภาพแล้ว!

*** Test Cases ***

SC-CHAT-01: การใช้งานพื้นฐาน (Basic Messaging)
    [Documentation]    ทดสอบการส่งข้อความและแชร์ตำแหน่ง
    Login To System    ${USER_PASSENGER}    ${PASS_PASSWORD}
    Go To My Trips
    Open Chat Popup    

    Input Text      ${CHAT_TEXTAREA}    สวัสดีครับ
    Click Button    ${SEND_BUTTON}
    Wait Until Page Contains    สวัสดีครับ

    
    Share Location And Confirm

    Input Text      ${CHAT_TEXTAREA}    ทดสอบส่งรูปครับ
    Click Button    ${SEND_BUTTON}

    Upload Image And Verify
    Wait Until Page Contains    เปิดรูปภาพ

SC-CHAT-02: ไม่สามารถส่งข้อความว่างได้ (Empty Message Validation)
    [Documentation]    ตรวจสอบว่าปุ่มส่งจะไม่ทำงานหรือถูกล็อคหากไม่มีการพิมพ์ข้อความ
    Clear Element Text    ${CHAT_TEXTAREA}

    Element Should Be Disabled    ${SEND_BUTTON_SPAN}
    
    Input Text      ${CHAT_TEXTAREA}    ${SPACE}${SPACE}
    Element Should Be Disabled    ${SEND_BUTTON_SPAN}
    
    Log To Console    \n[SUCCESS] Empty message validation passed: Send button is disabled.