from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Verify login prompt on initial screen
    page.goto("http://localhost:5173/")
    expect(page.locator("#comecar")).to_be_visible()
    page.click("#comecar")
    expect(page.locator(".login-prompt-overlay")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/initial_screen_login_prompt.png")
    page.click(".dismiss-btn")
    expect(page.locator(".login-prompt-overlay")).not_to_be_visible()

    # Verify updated contact info
    page.click("button:has-text('Contato')")
    expect(page.locator(".contact-info")).to_be_visible()
    expect(page.locator("a[href='mailto:contato@lyria.ai']")).to_be_visible()
    expect(page.locator("a[href='https://github.com/LyrIA-Project']")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/contact_info.png")
    page.click(".close-modal-btn")

    # Log in to test history panel
    page.goto("http://localhost:5173/RegistrationAndLogin")
    page.fill('input[placeholder="Nome de usuário"]', 'testuser')
    page.fill('input[placeholder="Senha"]', 'password')
    page.click('button:has-text("Entrar")')

    # This is a mock login, so we just navigate to the chat page
    page.goto("http://localhost:5173/chat")
    expect(page.locator(".galaxy-chat-area")).to_be_visible()

    # Verify history panel toggle
    history_button = page.locator('button[title="Novo Chat"] ~ div button:first-child')

    # Open history panel
    history_button.click()
    expect(page.locator(".history-panel.visible")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/history_panel_open.png")

    # Close history panel
    history_button.click()
    expect(page.locator(".history-panel.visible")).not_to_be_visible()
    page.screenshot(path="jules-scratch/verification/history_panel_closed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
