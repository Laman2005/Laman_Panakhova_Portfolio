import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Customer {
    private String id;
    private String fullName;
    private List<Account> accounts;

    public Customer(String fullname) {
        this.fullName = fullname;
        this.id = Util.getRandomString();
        this.accounts = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public void addAccount(Account account) {

        accounts.add(account);
    }

    public void removeAccount(Account account) throws RemoveAccountException {

        if (account == null)
            throw new RemoveAccountException("The account is removed");

        accounts.remove(account);
    }

    public void removeAccount(String accountId) {

        // List accList = new ArrayList<>();
        accounts.remove(accountId);
        // return accounts;
    }

    public BigDecimal getTotalBalance() {
        BigDecimal balance = new BigDecimal(0.0000);

        for (var x : accounts) {
           balance = balance.add(x.getBalance());
        }
        return balance;
    }

    public List<Account> getAccounts(String type) {

        List<Account> res = new ArrayList<>();
        for (var acc : accounts) {
            if ("checking".equals(type) && (acc instanceof CheckingAccount))
                res.add(acc);
            else if ("saving".equals(type) && (acc instanceof SavingAccount))
                res.add(acc);

        }
        return res;

    }

}
