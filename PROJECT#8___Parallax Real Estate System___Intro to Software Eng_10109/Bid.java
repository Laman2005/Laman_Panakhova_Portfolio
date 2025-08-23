public class Bid {
    private String bidID;
    private String buyerID;
    private String propertyID;
    private double bidAmount;
    private String status; // Status can be "Pending", "Accepted", or "Rejected"

    // Getters and Setters
    public String getBidID() {
        return bidID;
    }

    public void setBidID(String bidID) {
        this.bidID = bidID;
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

    public double getBidAmount() {
        return bidAmount;
    }

    public void setBidAmount(double bidAmount) {
        this.bidAmount = bidAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Method to accept the bid
    public void acceptBid() {
        if ("Pending".equals(this.status)) {
            this.status = "Accepted";
            System.out.println("Bid " + bidID + " has been accepted.");
        } else {
            System.out.println("Bid " + bidID + " cannot be accepted as it is not pending.");
        }
    }

    // Method to reject the bid
    public void rejectBid() {
        if ("Pending".equals(this.status)) {
            this.status = "Rejected";
            System.out.println("Bid " + bidID + " has been rejected.");
        } else {
            System.out.println("Bid " + bidID + " cannot be rejected as it is not pending.");
        }
    }
}
