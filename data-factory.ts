export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ShippingAddress = {
  company: string;
  street: string;
  city: string;
  regionLabel: string;
  postcode: string;
  countryLabel: string;
  telephone: string;
};

export function createUser(): UserData {
  const id = Date.now();
  return {
    firstName: 'Veronica',
    lastName: `QA${id}`,
    email: `veronica.qa.${id}@mailinator.com`,
    password: 'Teste@12345'
  };
}

export function createShippingAddress(): ShippingAddress {
  return {
    company: 'Empresa QA',
    street: 'Av. Paulista, 1000',
    city: 'Sao Paulo',
    regionLabel: 'California',
    postcode: '90001',
    countryLabel: 'United States',
    telephone: '11999999999'
  };
}
