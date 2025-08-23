import java.util.ArrayList;
import java.util.List;

public class BidCollection {
    private String collectionID;
    private List<Bid> bids;

    // Constructor
    public BidCollection(String collectionID) {
        this.collectionID = collectionID;
        this.bids = new ArrayList<>();
    }

    // Getter for collectionID
    public String getCollectionID() {
        return collectionID;
    }

    public void setCollectionID(String collectionID) {
        this.collectionID = collectionID;
    }

    // Getter for bids
    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }

    // Method to add a bid to the collection
    public void addBid(Bid bid) {
        bids.add(bid);
        System.out.println("Bid " + bid.getBidID() + " has been added to the collection.");
    }

    // Method to remove a bid from the collection by its ID
    public void removeBid(String bidID) {
        for (Bid bid : bids) {
            if (bid.getBidID().equals(bidID)) {
                bids.remove(bid);
                System.out.println("Bid " + bidID + " has been removed from the collection.");
                return;
            }
        }
        System.out.println("Bid " + bidID + " not found in the collection.");
    }

    // Method to view all bids in the collection
    public List<Bid> viewBids() {
        return bids;
    }
}
