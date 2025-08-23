import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class ParallaxRealEstateApp {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        PropertyListing propertyListing = new PropertyListing();

        // Dummy user lists
        List<Buyer> buyers = new ArrayList<>();
        List<Seller> sellers = new ArrayList<>();

        // Add sample buyers/sellers
        buyers.add(new Buyer("B001", "Alice"));
        buyers.add(new Buyer("B002", "Bob"));
        sellers.add(new Seller("S001", "Charlie"));
        sellers.add(new Seller("S002", "Dave"));

        boolean isRunning = true;

        while (isRunning) {
            displayWelcomeScreen();

            System.out.print("Enter username: ");
            String username = scanner.nextLine();

            System.out.print("Enter password: ");
            String password = scanner.nextLine();

            String role = authenticateUser(username, password);

            if (role != null) {
                switch (role) {
                    case "Buyer":
                        Buyer buyer = findBuyerById(buyers, username);
                        if (buyer != null) {
                            BuyerMenu.show(buyer, propertyListing, scanner);
                        } else {
                            System.out.println("Buyer not found.");
                        }
                        break;
                    case "Seller":
                        Seller seller = findSellerById(sellers, username);
                        if (seller != null) {
                            SellerMenu.show(seller, propertyListing, scanner);
                        } else {
                            System.out.println("Seller not found.");
                        }
                        break;
                    default:
                        System.out.println("Invalid role.");
                }
            } else {
                System.out.println("Invalid credentials. Please try again.");
            }
        }

        scanner.close();
    }

    private static Buyer findBuyerById(List<Buyer> buyers, String id) {
        for (Buyer b : buyers) {
            if (b.getBuyerId().equals(id)) {
                return b;
            }
        }
        return null;
    }

    private static Seller findSellerById(List<Seller> sellers, String id) {
        for (Seller s : sellers) {
            if (s.getSellerId().equals(id)) {
                return s;
            }
        }
        return null;
    }

    private static void displayWelcomeScreen() {
        System.out.println("=========================================");
        System.out.println("   Welcome to the PARALLAX Real Estate Application ");
        System.out.println("=========================================");
        System.out.println("Your one-stop solution for buying and selling properties!");
    }

    // Dummy authentication
    private static String authenticateUser(String username, String password) {
        if (username.startsWith("B") && password.equals("password")) {
            return "Buyer";
        } else if (username.startsWith("S") && password.equals("password")) {
            return "Seller";
        } else {
            return null;
        }
    }
}
