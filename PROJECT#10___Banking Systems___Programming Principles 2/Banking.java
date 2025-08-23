import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Banking {
    public List<Customer> customers = new ArrayList<>();

    public void addCustomer(Customer customer) throws RetrieveCustomerException {

        if (customer == null)
        throw new RetrieveCustomerException("Retrieve the customer that does not exist");
        
        customers.add(customer);

    }

    public void removeCustomer(Customer customer) throws RemoveCustomerException {

        if (customer == null) 
            throw new RemoveCustomerException("There is no customer found!");
        
        customers.remove(customer);

    }

    public void removeCustomer(String customerId) {

        customers.remove(customerId);

    }
    
    public List<Customer> getCustomers() { 

        // if (customers == null)
        // throw new RetrieveAccountException("Retrieve the account that does not exist");
        return customers;
    }

    public String getCustomer(String customerId) {   // not complete & smth is missing! 

        // ...
        return customerId;
    }

    public void createCheckingAccount(Customer customer, BigDecimal balance, BigDecimal overDraftLimit) throws NegativeDepositException {

        CheckingAccount ca = new CheckingAccount(overDraftLimit);
        ca.deposit(balance);

    customer.addAccount(ca);
    }

    public void createSavingAccount(Customer customer, BigDecimal balance, BigDecimal interestRate) throws NegativeDepositException {

        SavingAccount sa = new SavingAccount(interestRate);
        sa.deposit(interestRate);

        customer.addAccount(sa);
        
        
    }
}
