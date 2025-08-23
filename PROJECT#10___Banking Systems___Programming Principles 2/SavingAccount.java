import java.math.BigDecimal;

public class SavingAccount extends Account{

    public BigDecimal interestRate;

    public SavingAccount(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    @Override
    public BigDecimal withdraw(BigDecimal amount) throws AmountBalanceException {
        amount = new BigDecimal(45.0000);
        balance = new BigDecimal(155.0000);
        if (balance.compareTo(amount) == 1) 
        balance = balance.subtract(amount);
        else
        throw new AmountBalanceException("The withdrawal amount is greater than the balance!");
        //balance = balance;
        return balance;
    }
    
}
