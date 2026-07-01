package com.property.platform.integration;

import java.math.BigDecimal;

// Abstraction layer for Stripe, Braintree, Auth.net, etc.
public interface PaymentGatewayClient {
    GatewayChargeResult charge(String gatewayToken, BigDecimal amount, String description) throws RuntimeException;
    
    record GatewayChargeResult(String transactionId, String status) {}
}