import { expect, Page } from '@playwright/test';
import { ShippingAddress, UserData } from './data-factory';

export async function goToRegister(page: Page): Promise<void> {
  await page.goto('/customer/account/create/');
  await expect(page).toHaveURL(/customer\/account\/create/);
}

export async function registerUser(page: Page, user: UserData): Promise<void> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.goto(`/customer/account/create/?attempt=${attempt}`);
    await expect(page).toHaveURL(/customer\/account\/create/);

    await page.locator('#firstname').fill(user.firstName);
    await page.locator('#lastname').fill(user.lastName);
    await page.locator('#email_address').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('#password-confirmation').fill(user.password);
    await page.getByRole('button', { name: /create an account/i }).click();

    const invalidFormKey = page.getByText(/invalid form key/i);
    const hasInvalidFormKey = await invalidFormKey.isVisible({ timeout: 2500 }).catch(() => false);

    if (hasInvalidFormKey && attempt < maxAttempts) {
      continue;
    }

    if (hasInvalidFormKey && attempt === maxAttempts) {
      throw new Error('Falha ao cadastrar usuario: Invalid Form Key persistiu apos 3 tentativas.');
    }

    const accountTitle = page.locator('h1.page-title span.base');
    const isOnMyAccount = await accountTitle
      .filter({ hasText: /my account/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isOnMyAccount) {
      await expect(page).toHaveURL(/customer\/account(\/index)?\/?$/);
      return;
    }

    if (attempt < maxAttempts) {
      continue;
    }

    throw new Error('Falha ao cadastrar usuario: nao foi possivel confirmar acesso a pagina My Account.');
  }
}

export async function logoutUser(page: Page): Promise<void> {
  await page.goto('/customer/account/logout/');
  await expect(page).toHaveURL(
    /customer\/account\/(logoutSuccess|login)|^https:\/\/magento2-demo\.magebit\.com\/?$/
  );
}

export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/customer/account/login/');
  await expect(page).toHaveURL(/customer\/account\/login/);
}

export async function loginUser(page: Page, user: UserData): Promise<void> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.locator('#email').fill(user.email);
    await page.locator('#pass').fill(user.password);
    await page.locator('#send2').click();

    const accountTitle = page.locator('h1.page-title span.base');
    const isOnMyAccount = await accountTitle
      .filter({ hasText: /my account/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isOnMyAccount) {
      await expect(page).toHaveURL(/customer\/account(\/index)?\/?$/);
      return;
    }

    const loginError = page.getByText(/account sign-in was incorrect|account is disabled temporarily/i);
    const hasLoginError = await loginError.isVisible({ timeout: 1500 }).catch(() => false);

    if (attempt < maxAttempts && hasLoginError) {
      await page.waitForLoadState('networkidle');
      continue;
    }

    if (attempt < maxAttempts) {
      continue;
    }

    throw new Error(`Falha ao realizar login apos ${maxAttempts} tentativas. URL atual: ${page.url()}`);
  }
}

export async function addProductToCart(page: Page): Promise<void> {
  await page.goto('/fusion-backpack.html');
  await expect(page.locator('h1.page-title span')).toContainText(/fusion backpack/i);

  await page.locator('#product-addtocart-button').click();
  await expect(page.getByText(/you added fusion backpack to your shopping cart/i)).toBeVisible();
  await expect(page.locator('.counter-number')).toHaveText('1');
}

export async function proceedToCheckout(page: Page): Promise<void> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.locator('.showcart').click();

    const checkoutButton = page.locator('#top-cart-btn-checkout');
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });

    try {
      await Promise.all([
        page.waitForURL(/checkout/, { timeout: 15000 }),
        checkoutButton.click()
      ]);
      return;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error('Falha ao navegar para checkout apos 3 tentativas.');
      }
    }
  }
}

export async function fillShippingStep(page: Page, address: ShippingAddress): Promise<void> {
  await page.locator('input[name="company"]').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('input[name="company"]').fill(address.company);
  await page.locator('input[name="street[0]"]').fill(address.street);
  await page.locator('input[name="city"]').fill(address.city);
  await page.locator('select[name="region_id"]').selectOption({ label: address.regionLabel });
  await page.locator('input[name="postcode"]').fill(address.postcode);
  await page.locator('select[name="country_id"]').selectOption({ label: address.countryLabel });
  await page.locator('input[name="telephone"]').fill(address.telephone);

  const shippingMethod = page.locator('input[type="radio"][name^="ko_unique_"]').first();
  await shippingMethod.check();

  await page.getByRole('button', { name: /next/i }).click();
}

export async function placeOrder(page: Page): Promise<void> {
  const placeOrderButton = page.getByRole('button', { name: /place order/i });
  await expect(placeOrderButton).toBeVisible({ timeout: 30000 });
  await placeOrderButton.click();

  await expect(page.getByRole('heading', { name: /thank you for your purchase/i })).toBeVisible({ timeout: 40000 });
  await expect(page.getByText(/your order number is/i)).toBeVisible();
}
