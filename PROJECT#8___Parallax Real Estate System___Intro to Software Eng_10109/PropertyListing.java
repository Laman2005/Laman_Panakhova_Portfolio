import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PropertyListing {
    private List<Property> properties;
    private List<Message> messages;
    private List<Contract> contracts;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public PropertyListing() {
        this.properties = new ArrayList<>();
        this.messages = new ArrayList<>();
        this.contracts = new ArrayList<>();
        loadMessagesFromCSV("messages.csv");  // Load messages from CSV when the listing is initialized
    }

    // Property Management
    public void addProperty(Property property) {
        properties.add(property);
        savePropertiesToCSV("properties.csv");
    }

    public Property searchById(int id) {
        for (Property property : properties) {
            if (property.getId() == id) {
                return property;
            }
        }
        return null;
    }

    public List<Property> searchBySuburb(String suburb) {
        List<Property> results = new ArrayList<>();
        for (Property property : properties) {
            if (property.getSuburb().equalsIgnoreCase(suburb) && property.getStatus().equals("available")) {
                results.add(property);
            }
        }
        return results;
    }

    // Contract Management
    public void createContract(int propertyId, String buyerId, String sellerId) {
        Contract contract = new Contract(propertyId, buyerId, sellerId);
        contracts.add(contract);
        System.out.println("Contract created: \n" + contract);
    }

    public List<Contract> getContractsForSeller(String sellerId) {
        List<Contract> results = new ArrayList<>();
        for (Contract contract : contracts) {
            if (contract.getSellerId().equals(sellerId)) {
                results.add(contract);
            }
        }
        System.out.println("Contracts found for Seller ID " + sellerId + ": " + results.size());
        return results;
    }

    public List<Contract> getContractsForBuyer(String buyerId) {
        List<Contract> results = new ArrayList<>();
        for (Contract contract : contracts) {
            if (contract.getBuyerId().equals(buyerId)) {
                results.add(contract);
            }
        }
        System.out.println("Contracts found for Buyer ID " + buyerId + ": " + results.size());
        return results;
    }

    public List<Property> getPendingPaymentsForSeller(String sellerId) {
        List<Property> pendingPayments = new ArrayList<>();
        for (Property property : properties) {
            if (property.getSellerId().equals(sellerId) && property.getStatus().equals("pending")) {
                pendingPayments.add(property);
            }
        }
        return pendingPayments;
    }

    public Contract getContractById(int contractId) {
        for (Contract contract : contracts) {
            if (contract.getContractId() == contractId) {
                return contract;
            }
        }
        return null;
    }

    // Messaging - Add and Persist
    public void addMessage(Message message) {
        messages.add(message);
        System.out.println("Message added: " + message);  // Debugging: Verify message is being added
        saveMessagesToCSV("messages.csv");  // Persist messages to CSV
    }

    // Save messages to CSV
    private void saveMessagesToCSV(String filename) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (Message message : messages) {
                writer.write(message.getBuyerId() + "," +
                        message.getSellerId() + "," +
                        message.getSender() + "," +
                        message.getReceiver() + "," +
                        message.getPropertyId() + "," +
                        message.getContent() + "," +
                        message.getTimestampAsString());
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error saving messages: " + e.getMessage());
        }
    }

    // Load messages from CSV file
    private void loadMessagesFromCSV(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");  // Handle commas in message content

                if (fields.length == 7) {
                    String buyerId = fields[0].trim();
                    String sellerId = fields[1].trim();
                    String sender = fields[2].trim();
                    String receiver = fields[3].trim();
                    int propertyId = Integer.parseInt(fields[4].trim());
                    String content = fields[5].trim();
                    LocalDateTime timestamp = LocalDateTime.parse(fields[6].trim(), FORMATTER);

                    Message message = new Message(buyerId, sellerId, sender, receiver, content, propertyId, timestamp);
                    messages.add(message);
                }
            }
            System.out.println("Messages loaded from CSV: " + messages.size());
        } catch (IOException e) {
            System.out.println("Error loading messages from CSV: " + e.getMessage());
        }
    }

    // Retrieve messages for the buyer (messages where buyer is the receiver)
    public List<Message> getMessagesForBuyer(String buyerId) {
        List<Message> results = new ArrayList<>();
        for (Message message : messages) {
            if (message.getReceiver().equals(buyerId)) {
                results.add(message);
            }
        }
        System.out.println("Messages found for Buyer ID " + buyerId + ": " + results.size());
        return results;
    }

    // Retrieve messages for the seller (messages where seller is the receiver)
    public List<Message> getMessagesForSeller(String sellerId, int propertyId) {
        List<Message> results = new ArrayList<>();
        for (Message message : messages) {
            if (message.getReceiver().equals(sellerId) && message.getPropertyId() == propertyId) {
                results.add(message);
            }
        }
        System.out.println("Messages found for Seller ID " + sellerId + ": " + results.size());  // Debugging
        return results;
    }

    // CSV Management for saving properties
    public void savePropertiesToCSV(String filename) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (Property property : properties) {
                writer.write(property.getId() + "," +
                        property.getType() + "," +
                        property.getSuburb() + "," +
                        property.getPrice() + "," +
                        property.getStatus() + "," +
                        property.getSellerId() + "," +
                        (property.getPendingBuyerId().isEmpty() ? "none" : property.getPendingBuyerId()));
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error saving properties: " + e.getMessage());
        }
    }
}
