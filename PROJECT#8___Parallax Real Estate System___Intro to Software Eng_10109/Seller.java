import java.util.List;
import java.util.Scanner;

public class Seller {
    private String sellerId;
    private String name;

    public Seller(String sellerId, String name) {
        this.sellerId = sellerId;
        this.name = name;
    }
     
// getters and setters
    public String getSellerId() {
        return sellerId;
    }

    public String getName() {
        return name;
    }
    
// Creating the properties by Seller
    public void createProperty(PropertyListing listing, Scanner scanner) {
        System.out.print("Enter property type (apartment/villa/townhouse): ");
        String type = scanner.nextLine();
        System.out.print("Enter suburb: ");
        String suburb = scanner.nextLine();
        System.out.print("Enter price: ");
        double price = scanner.nextDouble();
        scanner.nextLine(); // consume newline

        Property newProperty = new Property(type, suburb, price, "available", this.sellerId, "");
        listing.addProperty(newProperty);
        System.out.println("Property created successfully!");
        System.out.println(newProperty);
    }

    // Message scanning by Seller
    public void viewMessages(PropertyListing listing, Scanner scanner) {
        System.out.print("Enter the Property ID to view messages: ");
        int propertyId = scanner.nextInt();
        scanner.nextLine(); // consume newline

        List<Message> messages = listing.getMessagesForSeller(this.sellerId, propertyId);
        if (messages.isEmpty()) {
            System.out.println("No messages found for this property.");
        } else {
            System.out.println("Messages for property ID " + propertyId + ":");
            for (Message msg : messages) {
                System.out.println(msg);
            }
        }
    }

    // Reply Messages by Seller
    public void replyToBuyer(PropertyListing listing, Scanner scanner) {
        System.out.print("Enter the Property ID to view messages and reply: ");
        int propertyId = scanner.nextInt();
        scanner.nextLine();

        List<Message> messages = listing.getMessagesForSeller(this.sellerId, propertyId);
        if (messages.isEmpty()) {
            System.out.println("No messages found for this property.");
            return;
        }

        for (int i = 0; i < messages.size(); i++) {
            System.out.println((i + 1) + ". " + messages.get(i));
        }

        System.out.print("Enter the number of the message you want to reply to: ");
        int choice = scanner.nextInt();
        scanner.nextLine();

        if (choice < 1 || choice > messages.size()) {
            System.out.println("Invalid selection.");
            return;
        }

        Message buyerMessage = messages.get(choice - 1);
        System.out.println("Replying to Buyer ID: " + buyerMessage.getBuyerId());
        System.out.print("Enter your reply (type 'approve' to create a contract): ");
        String replyContent = scanner.nextLine();

        // Send reply to buyer
        Message reply = new Message(
                this.sellerId,
                buyerMessage.getBuyerId(),
                this.name,
                buyerMessage.getBuyerId(),
                replyContent,
                propertyId
        );
        listing.addMessage(reply);
        System.out.println("Reply sent to Buyer ID: " + buyerMessage.getBuyerId());

        // Contract creation upon approval
        if (replyContent.equalsIgnoreCase("approve")) {
            listing.createContract(propertyId, buyerMessage.getBuyerId(), this.sellerId);
            System.out.println("Contract created for Property ID: " + propertyId);
        }
    }
    
    // Contract Revision by Seller
    public void reviewContracts(PropertyListing listing, Scanner scanner) {
        List<Contract> contracts = listing.getContractsForSeller(this.sellerId);

        if (contracts.isEmpty()) {
            System.out.println("No contracts available.");
            return;
        }

        System.out.println("Contracts for Seller ID: " + this.sellerId);
        for (Contract contract : contracts) {
            System.out.println(contract);
        }

        System.out.print("Enter Contract ID to sign (or 0 to exit): ");
        int contractId = scanner.nextInt();
        scanner.nextLine();

        if (contractId == 0) return;

        Contract selectedContract = listing.getContractById(contractId);
        if (selectedContract != null && selectedContract.getStatus().equals("pending")) {
            selectedContract.signContract();
            System.out.println("Contract signed successfully.");
        } else {
            System.out.println("Invalid contract ID or already signed.");
        }
    }

    // Payment Revision by Seller
    public void reviewPayments(PropertyListing listing, Scanner scanner) {
        List<Property> pendingProperties = listing.getPendingPaymentsForSeller(this.sellerId);

        if (pendingProperties.isEmpty()) {
            System.out.println("No pending payments for approval.");
            return;
        }

        System.out.println("Pending Payment Requests:");
        for (Property property : pendingProperties) {
            System.out.println(property + " | Buyer: " + property.getPendingBuyerId());
        }

        System.out.print("Enter the Property ID to approve payment: ");
        int propertyId = scanner.nextInt();
        scanner.nextLine();

        Property property = listing.searchById(propertyId);
        if (property != null && property.getStatus().equals("pending")) {
            System.out.print("Approve payment for Buyer ID " + property.getPendingBuyerId() + "? (yes/no): ");
            String decision = scanner.nextLine();

            if (decision.equalsIgnoreCase("yes")) {
                property.setStatus("sold");
                property.setPendingBuyerId("");
                System.out.println("Payment approved. Property is now sold.");
            } else {
                property.setStatus("available");
                property.setPendingBuyerId("");  // Reset buyer info
                System.out.println("Payment request rejected. Property is back on the market.");
            }
            listing.savePropertiesToCSV("properties.csv");
        } else {
            System.out.println("No pending payment found for that property.");
        }
    }
}
