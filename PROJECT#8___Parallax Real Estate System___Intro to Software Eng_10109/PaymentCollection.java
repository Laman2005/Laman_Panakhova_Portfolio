public class PaymentCollection {
    private String collectionID;
    private String buyerID;
    private String propertyID;
    private double totalAmount;
    private double depositAmount;
    private double remainingBalance;
    private double monthlyInstallment;
    private String status;
    private String dueDate;

    // Constructor
    public PaymentCollection(String collectionID, String buyerID, String propertyID) {
        this.collectionID = collectionID;
        this.buyerID = buyerID;
        this.propertyID = propertyID;
        this.status = "Pending";
    }

    // Getters and Setters
    public String getCollectionID() {
        return collectionID;
    }

    public void setCollectionID(String collectionID) {
        this.collectionID = collectionID;
    }

    public String getBuyerID() {
        return buyerID;
    }

    public void setBuyerID(String buyerID) {
        this.buyerID = buyerID;
    }

    public String getPropertyID() {
        return propertyID;
    }

    public void setPropertyID(String propertyID) {
        this.propertyID = propertyID;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public double getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(double depositAmount) {
        this.depositAmount = depositAmount;
    }

    public double getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(double remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public double getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(double monthlyInstallment) {
        this.monthlyInstallment = monthlyInstallment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    // Methods
    public void initializePayment(double totalAmount) {
        this.totalAmount = totalAmount;
        this.depositAmount = totalAmount * 0.2;  // 20% deposit
        this.remainingBalance = totalAmount - depositAmount;
        this.monthlyInstallment = remainingBalance / 12;  // 12 months installment
        this.status = "Initialized";
    }

    public boolean processDeposit() {
        if (depositAmount > 0) {
            this.status = "Deposit Paid";
            return true;
        }
        return false;
    }

    public boolean scheduleInstallments() {
        if (status.equals("Deposit Paid")) {
            this.status = "Installments Scheduled";
            return true;
        }
        return false;
    }

    public void viewPaymentDetails() {
        System.out.println("Payment Collection Details:");
        System.out.println("Buyer ID: " + buyerID);
        System.out.println("Property ID: " + propertyID);
        System.out.println("Total Amount: " + totalAmount);
        System.out.println("Deposit Amount: " + depositAmount);
        System.out.println("Remaining Balance: " + remainingBalance);
        System.out.println("Monthly Installment: " + monthlyInstallment);
        System.out.println("Status: " + status);
        System.out.println("Due Date: " + dueDate);
    }

    public void markComplete() {
        this.status = "Completed";
        System.out.println("Payment is completed for Property ID: " + propertyID);
    }
}
