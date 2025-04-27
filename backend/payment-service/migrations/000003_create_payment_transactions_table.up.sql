CREATE TABLE IF NOT EXISTS payment_transactions (
  transaction_id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_status VARCHAR(20) NOT NULL,
  transaction_reference VARCHAR(100),
  gateway_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(transaction_status);