public class Property {
    private static int idCounter = 1;
    private int id;
    private String type;
    private String suburb;
    private double price;
    private String status;
    private String sellerId;
    private String sellerEmail;
    private String pendingBuyerId;

    public Property(String type, String suburb, double price, String status, String sellerId, String sellerEmail) {
        this.id = idCounter++;
        this.type = type;
        this.suburb = suburb;
        this.price = price;
        this.status = status;
        this.sellerId = sellerId;
        this.sellerEmail = sellerEmail;
        this.pendingBuyerId = "";
    }

    public int getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getSuburb() {
        return suburb;
    }

    public double getPrice() {
        return price;
    }

    public String getStatus() {
        return status;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getPendingBuyerId() {
        return pendingBuyerId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPendingBuyerId(String buyerId) {
        this.pendingBuyerId = buyerId;
    }

    @Override
    public String toString() {
        return "Property ID: " + id +
                ", Type: " + type +
                ", Suburb: " + suburb +
                ", Price: $" + price +
                ", Status: " + status +
                ", Seller ID: " + sellerId +
                ", Pending Buyer: " + (pendingBuyerId.isEmpty() ? "None" : pendingBuyerId);
    }
}
