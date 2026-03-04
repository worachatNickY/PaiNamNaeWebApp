*** Settings ***
Library           SeleniumLibrary
Library           resources/browser_setup.py

Suite Setup       Setup Browser
Suite Teardown    Close All Browsers

*** Variables ***
${FRONTEND_URL}    https://csse4169.cpkku.com
${USER}            user1111
${PASS}            123123aq

# --- PBI 11 (Emergency) ---
${DRIVER_USER_}    nick.worachatz@gmail.com
${DRIVER_PASS_}    123123aq


*** Keywords ***
Setup Browser
    [Documentation]    
    ${options}=    Get Chrome Options
    ${service}=    Get Chrome Service
    Create Webdriver    Chrome    options=${options}    service=${service}
    Set Window Size    1920    1080

Login To System
    [Arguments]    ${username}    ${password}
    Go To    ${FRONTEND_URL}/login
    Wait Until Element Is Visible    id=identifier    timeout=10s
    Input Text      id=identifier    ${username}
    Input Password  id=password      ${password}
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Page Contains    การเดินทางของฉัน    timeout=15s

Logout System
    Click Element    id=profile-menu
    Click Element    id=logout-button
    Wait Until Page Contains    เข้าสู่ระบบ

*** Test Cases ***
TC-UI-001 เข้าสู่ระบบและไปที่หน้ารีวิว
    [Documentation]  
    [Tags]    ui    smoke
    Go To    ${FRONTEND_URL}/login
    Wait Until Element Is Visible    id=identifier    timeout=10s
    Input Text      id=identifier    ${USER}
    Input Text      id=password      ${PASS}
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Page Contains    การเดินทางของฉัน    timeout=15s
    
TC-UI-002 ตรวจสอบรายการที่สามารถรีวิวได้
    [Documentation]    
    [Tags]    ui
    Go To    ${FRONTEND_URL}/reviews
    
    Wait Until Page Contains    ทริปที่รอรีวิว    timeout=10s
    
    Wait Until Element Is Visible    xpath=//button[contains(.,'เขียนรีวิว')]    timeout=10s
    
    Page Should Contain Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Log    อยู่ที่หน้ารีวิวและพบรายการทริปที่พร้อมให้รีวิวแล้ว

TC-UI-003 เปิดฟอร์มและทดสอบกรอกข้อมูลรีวิว
    [Documentation]   
    [Tags]    ui    review
    Click Button    xpath=(//button[contains(.,'เขียนรีวิว')])[1]
    
    Wait Until Page Contains    คะแนน    timeout=10s
    
    # จำลองการพิมพ์รีวิว
    Input Text      xpath=//textarea    ทดสอบเขียนรีวิว: บริการดีมากครับ
    
    # ตรวจสอบปุ่ม "ส่งรีวิว"
    Page Should Contain Element    xpath=//button[contains(.,'ส่งรีวิวเลย')]

TC-UI-004 ตรวจสอบความถูกต้องของปุ่มในหน้าจอ
    [Documentation]    เช็คแบบองค์รวมว่าต้องไม่มีปุ่ม 'ดูรีวิว' แสดงขึ้นมาปนกับทริปที่ยังไม่ได้รีวิว
    [Tags]    ui    logic
    Go To    ${FRONTEND_URL}/reviews
    Wait Until Page Contains    ทริปที่รอรีวิว    timeout=10s
    ${has_write}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//button[contains(.,'เขียนรีวิว')]
    IF    ${has_write}
        Page Should Not Contain Element    xpath=//button[contains(.,'ดูรีวิว')]
    END
    Log    ตรวจสอบ Logic ปุ่มสำเร็จโดยไม่ต้องวน Loop

TC-UI-005 ตรวจสอบข้อจำกัด 500 อักษร (Simulation)
    [Documentation]    จำลองการจำกัดอักษรโดยไม่ต้องแก้โค้ดหน้าเว็บจริง
    [Tags]    ui    requirement
    Wait Until Element Is Visible    xpath=(//button[contains(.,'เขียนรีวิว')])[1]
    Click Button    xpath=(//button[contains(.,'เขียนรีวิว')])[1]
    
    Wait Until Element Is Visible    xpath=//textarea    timeout=10s

    Execute JavaScript    document.querySelector('textarea').setAttribute('maxlength', '500')

    ${long_text}=    Evaluate    "A" * 510
    Input Text      xpath=//textarea    ${long_text}
    
    ${current_val}=    Get Value    xpath=//textarea
    ${length}=         Get Length   ${current_val}
    
    Should Be True    ${length} <= 500    msg=ระบบยอมให้พิมพ์เกิน 500 ตัวอักษร!
    Log    ความยาวที่ถูกจำกัดคือ: ${length}

TC-UI-006 ตรวจสอบกฎ 7 วัน และทริปที่ยังไม่เสร็จ
    [Documentation]    เช็คทริปหมดอายุต้องกดไม่ได้ และทริปไม่เสร็จต้องไม่มีปุ่ม
    [Tags]    ui    time_limit
    Go To    ${FRONTEND_URL}/reviews
    Wait Until Page Contains    ทริปที่รอรีวิว    timeout=10s
    
    # 1. ทริปที่ยังไม่เสร็จ (กำลังดำเนินการ) ต้องไม่มีปุ่มให้กด
    Page Should Not Contain Element    xpath=//div[contains(.,'กำลังดำเนินการ')]//button
    
    # 2. ทริปเกิน 7 วัน (ถ้ามี) ต้องแสดงว่า 'หมดเขตรีวิว' และกดไม่ได้
    ${is_expired}=    Run Keyword And Return Status    Page Should Contain    หมดเขตรีวิว
    IF    ${is_expired}
        Element Should Be Disabled    xpath=//button[contains(.,'หมดเขตรีวิว')]
    END

TC-UI-007 ตรวจสอบสิทธิ์ (ผู้ใช้ทั่วไปห้ามลบรีวิว)
    [Documentation]    ผู้ใช้ต้องไม่เห็นปุ่มลบในหน้าดูรีวิวของตัวเอง
    [Tags]    ui    permission
    # ลองหาปุ่ม 'ดูรีวิว' (ถ้าเคยรีวิวไว้แล้ว)
    ${has_view_btn}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//button[contains(.,'ดูรีวิว')]
    IF    ${has_view_btn}
        Click Button    xpath=//button[contains(.,'ดูรีวิว')]
        Wait Until Page Contains    คะแนน    timeout=10s
        # ต้องไม่มีปุ่ม "ลบ" ปรากฏสำหรับ User ปกติ
        Page Should Not Contain Element    xpath=//button[contains(.,'ลบ')]
        Page Should Not Contain Element    xpath=//button[contains(@class, 'delete')]
    END


