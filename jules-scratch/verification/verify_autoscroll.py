from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173", wait_until="networkidle")

    # Use a more robust selector and wait for the button to be visible
    comecar_button = page.locator("#comecar")
    comecar_button.wait_for(state="visible", timeout=10000)
    comecar_button.click()

    # Wait for the login prompt and click "Continue as Guest"
    guest_button = page.locator(".login-prompt-actions > button:nth-child(2)")
    guest_button.wait_for(state="visible", timeout=10000)
    guest_button.click()

    # Wait for the chat page to load and the textarea to be visible
    chat_input = page.locator("textarea")
    chat_input.wait_for(state="visible", timeout=10000)
    chat_input.fill("Hello, this is a test message to verify the auto-scrolling feature.")
    chat_input.press("Enter")

    # Wait for the bot's response to ensure scrolling has occurred
    page.wait_for_timeout(5000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
