from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/")
    expect(page.locator("#comecar")).to_be_visible()
    page.click("#comecar")
    expect(page.locator(".login-prompt-overlay")).to_be_visible()
    page.screenshot(path="../jules-scratch/verification/guest_prompt.png")

    page.click("button:has-text('Continuar sem login')")
    expect(page.locator(".galaxy-chat-area")).to_be_visible()
    page.screenshot(path="../jules-scratch/verification/guest_chat_access.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
