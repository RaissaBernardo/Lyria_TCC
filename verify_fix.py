from playwright.sync_api import sync_playwright, Page, expect
import bcrypt

def verify_history_ux(page: Page):
    """
    This script verifies that the history panel opens correctly.
    """
    # 1. Navigate to the login page and log in
    page.goto("http://localhost:5173/RegistrationAndLogin")
    page.get_by_placeholder("Email").fill("testuser@example.com")
    page.get_by_placeholder("Senha").fill("password123")
    page.get_by_role("button", name="ENTRAR").click()

    # Wait for navigation to the main page after login
    expect(page).to_have_url("http://localhost:5173/")

    # 2. Go to the chat page
    page.goto("http://localhost:5173/chat")

    # 3. Open the history panel
    history_button_enabled = page.locator('button[title="Histórico"]')
    expect(history_button_enabled).to_be_enabled()
    history_button_enabled.click()

    # Give the animation time to complete
    page.wait_for_timeout(1000) # 1 second

    # 4. Take a screenshot of the open history panel
    page.screenshot(path="history_panel_open.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Need to create a dummy user for login to work
        import sqlite3
        conn = sqlite3.connect('../backEnd/banco/lyria.db')
        cursor = conn.cursor()
        try:
            # Using IGNORE to avoid errors if the user already exists
            # The password is 'password123'
            password = b'password123'
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            cursor.execute("INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, persona_escolhida) VALUES (?, ?, ?, ?)",
                           ('testuser', 'testuser@example.com', hashed_password.decode('utf-8'), 'professor'))
            conn.commit()
        finally:
            conn.close()

        verify_history_ux(page)
        browser.close()

if __name__ == "__main__":
    main()
