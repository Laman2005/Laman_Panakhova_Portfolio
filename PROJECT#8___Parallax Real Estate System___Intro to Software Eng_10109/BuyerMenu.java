import java.util.Scanner;

public class BuyerMenu {
    public static void show(Buyer buyer, PropertyListing listing, Scanner scanner) {
        boolean exit = false;

        while (!exit) {
            System.out.println("\n--- Buyer Menu ---");
            System.out.println("1. Search Properties");
            System.out.println("2. Show Interest (Contact Seller)");
            System.out.println("3. View Messages");
            System.out.println("4. View Contracts");
            System.out.println("5. Proceed with Payment");
            System.out.println("6. Exit");
            System.out.print("Enter your choice: ");

            int choice = scanner.nextInt();
            scanner.nextLine();  // Consume newline

            switch (choice) {
                case 1:
                    buyer.searchProperties(listing, scanner);
                    break;
                case 2:
                    buyer.showInterest(listing, scanner);
                    break;
                case 3:
                    buyer.viewMessages(listing);  // Ensure this method exists in Buyer.java
                    break;
                case 4:
                    buyer.viewContracts(listing);  // This line is fine
                    break;
                case 5:
                    buyer.proceedWithPayment(listing, scanner);  // Ensure proceedWithPayment exists
                    break;
                case 6:
                    exit = true;
                    System.out.println("Returning to main menu...");
                    break;
                default:
                    System.out.println("Invalid choice, please try again.");
            }
        }
    }
}
