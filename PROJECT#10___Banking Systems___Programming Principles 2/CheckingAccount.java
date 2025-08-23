import java.math.BigDecimal;

public class CheckingAccount extends Account {

  public BigDecimal overDraftLimit = new BigDecimal(7.0000);

  public CheckingAccount(BigDecimal overDraftLimit) {

    this.overDraftLimit = overDraftLimit;
  }

  @Override
  public BigDecimal withdraw(BigDecimal amount) throws OverWithdrawException {

    BigDecimal overDraft = new BigDecimal(7.0000);
    amount = new BigDecimal(25.0000);
    balance = new BigDecimal(155.0000);
    // balance = balance.subtract(amount);

    if (overDraft.compareTo(overDraftLimit) == 0 || overDraft.compareTo(overDraftLimit) == -1)
      balance = balance.subtract(amount.add(overDraft));
    else
      throw new OverWithdrawException("Withdrawing more than allowed!");
    balance = balance.subtract(amount);
    return balance;
  }

}
