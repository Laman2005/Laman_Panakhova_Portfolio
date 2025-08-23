import java.math.BigDecimal;

abstract class Account {

    private String id;
    public BigDecimal balance = new BigDecimal(0);

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public BigDecimal deposit(BigDecimal amount) throws NegativeDepositException {

        System.out.print("The balance after deposit operation is: ");
        amount = new BigDecimal(155.0000);

        if (BigDecimal.ZERO.compareTo(amount) > 0)
            throw new NegativeDepositException("The deposit amount is negative!");

        balance = balance.add(amount);

        return balance;
    }

    public abstract BigDecimal withdraw(BigDecimal amount) throws OverWithdrawException, AmountBalanceException;
    // withdraws the amount from the balance in the main

}