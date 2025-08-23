import java.math.BigDecimal;
import java.util.UUID;

public class BankingDemo {
    public static void main(String[] args) throws NegativeDepositException,
            RemoveAccountException, RetrieveCustomerException, RemoveCustomerException {

        CheckingAccount check = new CheckingAccount(new BigDecimal(7.00));
        SavingAccount sav = new SavingAccount(new BigDecimal(45.00));

        Account acc = new Account() {

            @Override
            public BigDecimal withdraw(BigDecimal amount) {
                System.out.print("The balance after withdraw operation is: ");

                amount = new BigDecimal(50.0000);
                balance = balance.subtract(amount);

                return balance;
            }
        };

        System.out.println("FOR ANY CUSTOMER ACCOUNT AS A SAMPLE: --->");
        System.out.println();
        System.out.println();
        System.out.print("The initial balance is: ");
        System.out.println(acc.getBalance());

        try {
            System.out.println(acc.deposit(new BigDecimal(155.0000)));
        } catch (NegativeDepositException nde) {
            System.out.println("The operation has failed!");
            System.out.println(nde.getMessage());
        }

        try {
            System.out.println(acc.withdraw(new BigDecimal(50.00)));
        } catch (OverWithdrawException e) {
            System.out.println("The operation has failed for acc!");
            e.printStackTrace();
        } catch (AmountBalanceException abe) {
            System.out.println("Withdrawing amount from balance had failed!");
        }

        System.out.println();
        System.out.print("The balance after overDraft is: ");

        try {
            System.out.println(check.withdraw(new BigDecimal(7.00)));
        } catch (OverWithdrawException owe) {
            System.out.println("The owe operation has failed!");
        }

        System.out.println();
        System.out.print("The balance after considering the amount equals: ");

        try {
            System.out.println(sav.withdraw(new BigDecimal(45.00)));
        } catch (AmountBalanceException abe) {
            System.out.println("Withdrawing amount from balance had failed!");
        }

        Customer cus = new Customer("Laman Panakhova");
        Customer cus1 = new Customer("Vasila Aliyeva");
        Customer cus2 = new Customer("Rasul Panakhov");

        cus.addAccount(new CheckingAccount(new BigDecimal(100.0000)));
        cus.addAccount(new CheckingAccount(new BigDecimal(50.0000)));
        cus.addAccount(new CheckingAccount(new BigDecimal(1500.0000)));

        cus.addAccount(new SavingAccount(new BigDecimal(0.05)));
        cus.addAccount(new SavingAccount(new BigDecimal(0.07)));
        cus.addAccount(new SavingAccount(new BigDecimal(0.03)));

        System.out.println(cus.getFullName());
        System.out.println(cus.getId());
        System.out.println(cus.getAccounts());
        System.out.println(cus.getAccounts("saving"));
        System.out.println(cus.getAccounts("checking"));
        System.out.print("The Id for the given Customer: ");
        System.out.println(cus.getId());

        try {
            cus.removeAccount(new CheckingAccount(new BigDecimal(50.0000)));

        } catch (RemoveAccountException nae) {
            System.out.println(nae.getMessage());
        }

        var res = cus.getAccounts("checking");
        System.out.println(res);

        var res1 = cus.getAccounts("saving");
        System.out.println(res1);

        cus1.addAccount(new CheckingAccount(new BigDecimal(200.0000)));
        cus1.addAccount(new CheckingAccount(new BigDecimal(250.0000)));
        cus1.addAccount(new CheckingAccount(new BigDecimal(300.0000)));

        cus1.addAccount(new SavingAccount(new BigDecimal(0.01)));
        cus1.addAccount(new SavingAccount(new BigDecimal(0.02)));
        cus1.addAccount(new SavingAccount(new BigDecimal(0.04)));

        System.out.println(cus1.getFullName());
        System.out.println(cus1.getId());
        System.out.println(cus1.getAccounts());
        System.out.println(cus1.getAccounts("saving"));
        System.out.println(cus1.getAccounts("checking"));
        System.out.print("The Id for the given Customer: ");
        System.out.println(cus1.getId());

        cus2.addAccount(new CheckingAccount(new BigDecimal(400.0000)));
        cus2.addAccount(new CheckingAccount(new BigDecimal(450.0000)));
        cus2.addAccount(new CheckingAccount(new BigDecimal(500.0000)));

        cus2.addAccount(new SavingAccount(new BigDecimal(0.06)));
        cus2.addAccount(new SavingAccount(new BigDecimal(0.08)));
        cus2.addAccount(new SavingAccount(new BigDecimal(0.09)));

        System.out.println(cus2.getFullName().toString());
        System.out.println(cus2.getId().toString());
        System.out.println(cus2.getAccounts().toString());
        System.out.println(cus2.getAccounts("saving").toString());
        System.out.println(cus2.getAccounts("checking").toString());
        System.out.print("The Id for the given Customer: ");
        System.out.println(cus2.getId().toString());

        Banking b = new Banking();
        b.createCheckingAccount(cus, new BigDecimal(120.0000), new BigDecimal(100.0000));

        Banking c = new Banking();
        c.createSavingAccount(cus, new BigDecimal(1500.0000), new BigDecimal(0.3));

        c.addCustomer(cus);
        c.addCustomer(cus1);
        c.addCustomer(cus2);
        c.removeCustomer(cus2);
        c.removeCustomer(UUID.randomUUID().toString());
        c.getCustomer(UUID.randomUUID().toString());
        System.out.println(c.getCustomers().toString());

        try {
            Banking d = new Banking();
            d.addCustomer(cus1);
        } catch (RetrieveCustomerException rae) {
            System.out.println(rae.getMessage());
        }

        try {
            Banking f = new Banking();
            f.removeCustomer(cus1);
        } catch (RemoveCustomerException rae1) {
            System.out.println(rae1.getMessage());
        }

        System.out.println(b.getCustomer(UUID.randomUUID().toString()));

        System.out.println(cus1.getTotalBalance().toString());
        System.out.println();
    }
}


 // 1) System.out.println(cus1.getTotalBalance()); // why not working???

        // 2) cus.account.deposit(new BigDecimal(155.0000));
        // how to access the account's deposit???