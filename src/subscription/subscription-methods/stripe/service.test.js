import { logError } from '@edx/frontend-platform/logging';
import { subscriptionStripeCheckout } from './service';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('subscriptionStripeCheckout', () => {
  const programUuid = '123';
  const programTitle = 'Sample Program';
  const elements = { /* mock elements */ };
  const mockedBillingDetails = {
    address: '123 Main St',
    unit: 'Apt 4',
    city: 'City',
    country: 'Country',
    state: 'State',
    postalCode: '12345',
  };
  const context = { authenticatedUser: { email: 'test@example.com' } };
  const values = {
    firstName: 'John',
    lastName: 'Doe',
    ...mockedBillingDetails,
  };

  it('should return the expected post data', async () => {
    // Arrange
    const stripe = {
      createPaymentMethod: jest.fn().mockResolvedValue({
        paymentMethod: {
          id: 'payment-method-id',
          billing_details: mockedBillingDetails,
        },
        error: null,
      }),
    };

    // Act
    const postData = await subscriptionStripeCheckout({ programUuid, programTitle }, {
      elements, stripe, context, values,
    });

    // Assert
    expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
      elements,
      params: {
        billing_details: {
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            line2: values.unit || '',
            postal_code: values.postalCode || '',
            state: values.state || '',
          },
          email: context.authenticatedUser.email,
          name: `${values.firstName} ${values.lastName}`,
        },
      },
    });

    expect(postData).toEqual({
      program_uuid: programUuid,
      program_title: programTitle,
      payment_method_id: 'payment-method-id',
      billing_details: {
        ...mockedBillingDetails,
        firstname: values.firstName,
        lastname: values.lastName,
      },
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it('should throw an error and log it', async () => {
    // Arrange
    const stripe = { createPaymentMethod: jest.fn().mockResolvedValue({ paymentMethod: null, error: new Error('Stripe Error') }) };

    // Act & Assert
    await expect(subscriptionStripeCheckout({ programUuid, programTitle }, {
      elements, stripe, context, values,
    })).rejects.toThrow(Error);
    expect(logError).toHaveBeenCalledWith(new Error('Stripe Error'), {
      messagePrefix: 'Stripe Submit Error',
      paymentMethod: 'createPaymentMethod',
      paymentErrorType: 'createPaymentMethod Error',
      programUuid,
    });
  });
});
