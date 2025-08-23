import java.util.List;
import java.util.Scanner;

public class Buyer {
    private String buyerId;
    private String name;

    public Buyer(String buyerId, String name) {
        this.buyerId = buyerId;
        this.name = name;
    }  
  
    // getters and setters
    public String getBuyerId() {
        return buyerId;
    }

    public String getName() {
        return name;
    }

    // searching properties by buyer
    public void searchProperties(PropertyListing listing, Scanner scanner) {
        System.out.println("Search by: 1. Suburb 2. Property ID");
        int choice = scanner.nextInt();
        scanner.nextLine(); // consume newline

        if (choice == 1) {
            System.out.print("Enter suburb name: ");
            String suburb = scanner.nextLine();
            List<Property> results = listing.searchBySuburb(suburb);
            if (results.isEmpty()) {
                System.out.println("No properties found in that suburb.");
            } else {
                System.out.println("Properties found:");
                for (Property p : results) {
                    System.out.println(p);
                }
            }
        } else if (choice == 2) {
            System.out.print("Enter property ID: ");
            int id = scanner.nextInt();
            scanner.nextLine(); // consume newline
            Property property = listing.searchById(id);
            if (property != null) {
                System.out.println("Property found:");
                System.out.println(property);
            } else {
                System.out.println("Property not found.");
            }
        } else {
            System.out.println("Invalid choice.");
        }
    }

    // buyer shows interest by checking the property
    public void showInterest(PropertyListing listing, Scanner scanner) {
        System.out.print("Enter the Property ID to show interest: ");
        int propertyId = scanner.nextInt();
        scanner.nextLine();

        Property property = listing.searchById(propertyId);
        if (property != null && property.getStatus().equals("available")) {
            System.out.print("Enter your message for the seller: ");
            String content = scanner.nextLine();

            Message message = new Message(
                    this.buyerId,
                    property.getSellerId(),  // Ensure sellerId is correctly assigned
                    this.name,
                    property.getSellerId(),
                    content,
                    propertyId
            );
            listing.addMessage(message);
            System.out.println("Message sent to seller.");
        } else {
            System.out.println("Property not available or already sold.");
        }
    }

    // buyer contacts seller for any issues or requests
    public void contactSeller(PropertyListing listing, Scanner scanner) {
        System.out.print("Enter the Property ID you want to inquire about: ");
        int id = scanner.nextInt();
        scanner.nextLine(); // consume newline

        Property property = listing.searchById(id);
        if (property != null) {
            System.out.print("Enter your message for the seller: ");
            String content = scanner.nextLine();

            Message message = new Message(
                    this.buyerId,
                    property.getSellerId(),
                    this.name,
                    property.getSellerId(),
                    content,
                    id
            );
            listing.addMessage(message);
            System.out.println("Message sent successfully to seller ID: " + property.getSellerId());
        } else {
            System.out.println("Property not found.");
        }
    }

    // buyer views messages written by seller
    public void viewMessages(PropertyListing listing) {
        System.out.println("Messages for Buyer ID: " + this.buyerId);
        List<Message> messages = listing.getMessagesForBuyer(this.buyerId);
        if (messages.isEmpty()) {
            System.out.println("No messages found.");
        } else {
            for (Message m : messages) {
                System.out.println(m);
            }
        }
    }

    // buyer can view contracts 
    public void viewContracts(PropertyListing listing) {
        List<Contract> contracts = listing.getContractsForBuyer(this.buyerId);

        if (contracts.isEmpty()) {
            System.out.println("No contracts found.");
            return;
        }

        System.out.println("Contracts for Buyer ID: " + this.buyerId);
        for (Contract contract : contracts) {
            System.out.println(contract);
        }
    }

    // buyer pays for the property
    public void proceedWithPayment(PropertyListing listing, Scanner scanner) {
        List<Contract> contracts = listing.getContractsForBuyer(this.buyerId);

        // Filter for contracts that are signed
        List<Contract> signedContracts = contracts.stream()
                .filter(contract -> contract.getStatus().equals("signed"))
                .toList();

        if (signedContracts.isEmpty()) {
            System.out.println("No signed contracts available for payment.");
            return;
        }

        System.out.println("Signed Contracts Available for Payment:");
        for (Contract contract : signedContracts) {
            System.out.println(contract);
        }

        System.out.print("Enter Contract ID to proceed with payment: ");
        int contractId = scanner.nextInt();
        scanner.nextLine();

        Contract selectedContract = listing.getContractById(contractId);
        if (selectedContract != null && selectedContract.getStatus().equals("signed")) {
            Property property = listing.searchById(selectedContract.getPropertyId());

            if (property != null && property.getStatus().equals("available")) {
                System.out.println("Processing payment for Property ID: " + property.getId());
                property.setStatus("sold");
                System.out.println("Payment successful! The property is now sold.");
            } else {
                System.out.println("This property is no longer available.");
            }
        } else {
            System.out.println("Invalid contract or contract is not signed.");
        }
    }

}
