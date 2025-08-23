public class Contract {
    private static int contractCounter = 1;
    private int contractId;
    private int propertyId;
    private String buyerId;
    private String sellerId;
    private String status;

    public Contract(int propertyId, String buyerId, String sellerId) {
        this.contractId = contractCounter++;
        this.propertyId = propertyId;
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.status = "pending";
    }

    public int getContractId() {
        return contractId;
    }

    public int getPropertyId() {
        return propertyId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getStatus() {
        return status;
    }

    public void signContract() {
        this.status = "signed";
    }

    @Override
    public String toString() {
        return "Contract ID: " + contractId +
                "\nProperty ID: " + propertyId +
                "\nBuyer ID: " + buyerId +
                "\nSeller ID: " + sellerId +
                "\nStatus: " + status + "\n";
    }
}
