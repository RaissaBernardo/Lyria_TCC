from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/")
    page.screenshot(path="../jules-scratch/verification/initial_page_load.png")

    # Wait for the main chat area to be visible
    expect(page.locator("h1")).to_have_text("LyrIA", timeout=10000)

    # Click the new chat button
    page.click('button[title="Novo Chat"]')
    expect(page.locator(".login-prompt-overlay")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/login_prompt_new_chat.png")
    page.click(".dismiss-btn")
    expect(page.locator(".login-prompt-overlay")).not_to_be_visible()

    # Click the history button
    page.click('button:has(svg[stroke="currentColor"])')
    expect(page.locator(".login-prompt-overlay")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/login_prompt_history.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
