import asyncio
from playwright.async_api import async_playwright, expect
import sys

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # 1. Navigate to the initial screen
            await page.goto("http://localhost:5173/", wait_until="load")

            # 2. Confirm the page title has been updated to "LyrIA"
            await expect(page).to_have_title("LyrIA")
            print("Verification successful: Page title is 'LyrIA'.")

            # 3. Click the "Contato" button and verify that the modal opens
            contact_button = page.get_by_role("button", name="Contato")
            await expect(contact_button).to_be_visible()
            await contact_button.click()

            contact_modal = page.locator(".info-modal-content")
            await expect(contact_modal).to_be_visible()
            await expect(contact_modal.get_by_role("heading", name="Nossa Equipe")).to_be_visible()
            print("Verification successful: Contact modal opened.")

            # 4. Check that the modal correctly displays the team members
            gabriel_entry = contact_modal.get_by_text("👨‍💻 Gabriel Cardoso")
            await expect(gabriel_entry).to_be_visible()

            # 5. Verify the WhatsApp link for "Gabriel Cardoso" is correct
            whatsapp_link = gabriel_entry.locator("xpath=./following-sibling::a")
            await expect(whatsapp_link).to_have_attribute("href", "https://wa.me/5516993463038")
            print("Verification successful: WhatsApp link is correct.")

            # 6. Take a screenshot of the open modal for visual confirmation
            await page.screenshot(path="jules-scratch/verification/contact_modal.png")
            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}", file=sys.stderr)
            await page.screenshot(path="jules-scratch/verification/contact_modal_failure.png")
            sys.exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
