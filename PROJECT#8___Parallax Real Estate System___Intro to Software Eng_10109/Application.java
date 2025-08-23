import java.util.*;

public class Application {
    private static Scanner scanner = new Scanner(System.in);
    private static List<Property> propertyList = new ArrayList<>();
    private static List<Contract> contractList = new ArrayList<>();

    public static void main(String[] args) {
        Seller seller = new Seller("seller1", "Jane Doe", "password123");
        Buyer buyer = new Buyer("buyer1", "John Smith", "password456");
        Agent agent = new Agent("agent1", "Alice Brown", "password789");

        while (true) {
            System.out.println("\n--- Parallax Real Estate System ---");
            System.out.println("1. Login as Seller");
            System.out.println("2. Login as Buyer");
            System.out.println("3. Login as Agent");
            System.out.println("4. Exit");
            System.out.print("Select an option: ");

            int choice = getIntInput();

            switch (choice) {
                case 1:
                    if (manualLogin(seller.getSellerID(), seller.getPassword())) {
                        runSellerMenu(seller);
                    }
                    break;
                case 2:
                    if (manualLogin(buyer.getBuyerID(), buyer.getPassword())) {
                        runBuyerMenu(buyer);
                    }
                    break;
                case 3:
                    if (manualLogin(agent.getAgentID(), agent.getPassword())) {
                        runAgentMenu(agent);
                    }
                    break;
                case 4:
                    System.out.println("Exiting... Goodbye!");
                    System.exit(0);
                    break;
                default:
                    System.out.println("Invalid option. Try again.");
            }
        }
    }

    private static boolean manualLogin(String userID, String password) {
        System.out.print("Enter User ID: ");
        String inputID = scanner.nextLine();
        System.out.print("Enter Password: ");
        String inputPassword = scanner.nextLine();

        if (inputID.equals(userID) && inputPassword.equals(password)) {
            System.out.println("Login successful!");
            return true;
        } else {
            System.out.println("Invalid credentials. Please try again.");
            return false;
        }
    }

    private static void runSellerMenu(Seller seller) {
        while (true) {
            System.out.println("\n--- Seller Menu ---");
            System.out.println("1. Create Property");
            System.out.println("2. Edit Property");
            System.out.println("3. Archive Property");
            System.out.println("4. Sign Contract");
            System.out.println("5. Logout");
            System.out.print("Select an option: ");

            int choice = getIntInput();

            switch (choice) {
                case 1:
                    createProperty(seller);
                    break;
                case 2:
                    editProperty();
                    break;
                case 3:
                    archiveProperty();
                    break;
                case 4:
                    System.out.println("Signing contract...");
                    break;
                case 5:
                    System.out.println("Logging out...");
                    return;
                default:
                    System.out.println("Invalid option. Try again.");
            }
        }
    }

    private static void runBuyerMenu(Buyer buyer) {
        while (true) {
            System.out.println("\n--- Buyer Menu ---");
            System.out.println("1. Search Properties");
            System.out.println("2. Contact Seller/Agent");
            System.out.println("3. Make Payment");
            System.out.println("4. Logout");
            System.out.print("Select an option: ");

            int choice = getIntInput();

            switch (choice) {
                case 1:
                    searchProperties();
                    break;
                case 2:
                    contactSellerOrAgent();
                    break;
                case 3:
                    makePayment();
                    break;
                case 4:
                    System.out.println("Logging out...");
                    return;
                default:
                    System.out.println("Invalid option. Try again.");
            }
        }
    }

    private static void runAgentMenu(Agent agent) {
        System.out.println("\n--- Agent Menu ---");
        System.out.println("1. Manage Contracts");
        System.out.println("2. Logout");
        System.out.print("Select an option: ");

        int choice = getIntInput();

        if (choice == 1) {
            System.out.println("Managing contracts for agent: " + agent.getAgentID());
        } else if (choice == 2) {
            System.out.println("Logging out...");
        } else {
            System.out.println("Invalid option.");
        }
    }

    private static void createProperty(Seller seller) {
        System.out.print("Enter Property ID: ");
        String propertyID = scanner.nextLine();
        System.out.print("Enter Suburb: ");
        String suburb = scanner.nextLine();
        System.out.print("Enter Type (Apartment/Villa/Townhouse): ");
        String type = scanner.nextLine();
        System.out.print("Enter Price: ");
        double price = getDoubleInput();

        Property property = new Property("address",propertyID, suburb, type, price,"status", seller.getSellerID());
        propertyList.add(property);
        System.out.println("Property created successfully.");
    }

    private static void editProperty() {
        System.out.print("Enter Property ID to edit: ");
        String editID = scanner.nextLine();
        for (Property p : propertyList) {
            if (p.getPropertyID().equalsIgnoreCase(editID)) {
                System.out.print("Enter new Price: ");
                double newPrice = getDoubleInput();
                p.setPrice(newPrice);
                System.out.println("Property updated successfully.");
                return;
            }
        }
        System.out.println("Property not found.");
    }

    private static void archiveProperty() {
        System.out.print("Enter Property ID to archive: ");
        String archiveID = scanner.nextLine();
        propertyList.removeIf(p -> p.getPropertyID().equalsIgnoreCase(archiveID));
        System.out.println("Property archived successfully.");
    }

    private static void searchProperties() {
        System.out.print("Search by Suburb or Property ID: ");
        String input = scanner.nextLine();
        for (Property property : propertyList) {
            if (property.getSuburb().equalsIgnoreCase(input) || property.getPropertyID().equalsIgnoreCase(input)) {
                System.out.println(property);
            }
        }
    }

    private static void contactSellerOrAgent() {
        System.out.print("Enter Property ID to contact seller/agent: ");
        String propertyID = scanner.nextLine();
        System.out.println("Contacting seller/agent for property: " + propertyID + " via dummy email.");
    }

    private static void makePayment() {
        System.out.print("Enter Property ID: ");
        String payPropertyID = scanner.nextLine();
        System.out.println("10% deposit paid for property: " + payPropertyID);
        System.out.println("Remaining payments scheduled via direct debit.");
    }

    private static int getIntInput() {
        while (!scanner.hasNextInt()) {
            System.out.print("Invalid input. Enter a number: ");
            scanner.next();
        }
        int input = scanner.nextInt();
        scanner.nextLine();
        return input;
    }

    private static double getDoubleInput() {
        while (!scanner.hasNextDouble()) {
            System.out.print("Invalid input. Enter a valid number: ");
            scanner.next();
        }
        double input = scanner.nextDouble();
        scanner.nextLine();
        return input;
    }
}
