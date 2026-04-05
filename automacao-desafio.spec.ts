import { expect, Page, test } from '@playwright/test';
import { createShippingAddress, createUser } from '../fixture/data-factory';
import {
  addProductToCart,
  fillShippingStep,
  goToLogin,
  goToRegister,
  loginUser,
  logoutUser,
  placeOrder,
  proceedToCheckout,
  registerUser
} from '../fixture/test-helpers';

async function registerAndLoginWithNewUser(page: Page) {
  const user = createUser();

  await goToRegister(page);
  await registerUser(page, user);

  await logoutUser(page);
  await goToLogin(page);
  await loginUser(page, user);

  return user;
}

test.describe('Fluxo Web Magento', () => {
  test.describe('Cenarios isolados', () => {
    test('Cadastro de usuario com sucesso', async ({ page }) => {
      const user = createUser();

      await test.step('Cadastrar novo usuario', async () => {
        await goToRegister(page);
        await registerUser(page, user);
      });

      await test.step('Validar acesso a area da conta', async () => {
        await expect(page).toHaveURL(/customer\/account(\/login)?\/?/);
        await expect(page.locator('h1.page-title span.base')).toContainText(/my account/i);
      });
    });

    test('Login com sucesso', async ({ page }) => {
      await test.step('Preparar usuario cadastrando uma conta nova', async () => {
        await registerAndLoginWithNewUser(page);
      });

      await test.step('Validar login concluido', async () => {
        await expect(page).toHaveURL(/customer\/account/);
        await expect(page.locator('h1.page-title span.base')).toContainText(/my account/i);
      });
    });

    test('Adicionar produto ao carrinho com sucesso', async ({ page }) => {
      await test.step('Preparar sessao autenticada', async () => {
        await registerAndLoginWithNewUser(page);
      });

      await test.step('Adicionar produto ao carrinho', async () => {
        await addProductToCart(page);
      });

      await test.step('Validar item no carrinho', async () => {
        await expect(page.locator('.counter-number')).toHaveText('1');
      });
    });

    test('Checkout com sucesso', async ({ page }) => {
      const shippingAddress = createShippingAddress();

      await test.step('Preparar sessao autenticada e carrinho com item', async () => {
        await registerAndLoginWithNewUser(page);
        await addProductToCart(page);
      });

      await test.step('Finalizar checkout', async () => {
        await proceedToCheckout(page);
        await fillShippingStep(page, shippingAddress);
        await placeOrder(page);
      });

      await test.step('Validar pagina de sucesso do pedido', async () => {
        await expect(page).toHaveURL(/checkout\/onepage\/success/);
      });
    });
  });

  test.describe('Fluxo completo', () => {
    test('Fluxo E2E completo: cadastro, login, carrinho e checkout', async ({ page }) => {
      const user = createUser();
      const shippingAddress = createShippingAddress();

      await test.step('Cadastrar novo usuario', async () => {
        await goToRegister(page);
        await registerUser(page, user);
      });

      await test.step('Encerrar sessao para validar login', async () => {
        await logoutUser(page);
      });

      await test.step('Realizar login', async () => {
        await goToLogin(page);
        await loginUser(page, user);
      });

      await test.step('Adicionar produto ao carrinho', async () => {
        await addProductToCart(page);
      });

      await test.step('Finalizar checkout', async () => {
        await proceedToCheckout(page);
        await fillShippingStep(page, shippingAddress);
        await placeOrder(page);
      });

      await test.step('Validar pagina de sucesso do pedido', async () => {
        await expect(page).toHaveURL(/checkout\/onepage\/success/);
      });
    });
  });
});
