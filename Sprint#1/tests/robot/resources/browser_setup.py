"""
Browser Setup Helper for Robot Framework
ใช้สำหรับจัดการ WebDriver โดยอัตโนมัติ
"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager


def get_chrome_driver(headless=True):
    """
    สร้าง Chrome WebDriver พร้อม options ที่เหมาะสม
    
    Args:
        headless: รัน browser แบบ headless หรือไม่
    
    Returns:
        WebDriver instance
    """
    options = ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    
    if headless:
        options.add_argument('--headless=new')
    
    # ใช้ webdriver-manager ดาวน์โหลด ChromeDriver ที่ตรงกับ Chrome version
    service = ChromeService(ChromeDriverManager().install())
    
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def get_chrome_options(headless=True):
    """
    สร้าง Chrome Options
    """
    options = ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    
    if headless:
        options.add_argument('--headless=new')
    
    return options


def get_chrome_service():
    """
    สร้าง Chrome Service พร้อม ChromeDriver ที่ถูกต้อง
    """
    return ChromeService(ChromeDriverManager().install())
