import java.util.Scanner;

public class SellerMenu {
    public static void show(Seller seller, PropertyListing listing, Scanner scanner) {
        boolean exit = false;
        while (!exit) {
            System.out.println("\n--- Seller Menu ---");
            System.out.println("1. Create New Property");
            System.out.println("2. View Messages");
            System.out.println("3. Reply to Buyer");
            System.out.println("4. Review Payment Requests");  // <-- New Option
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    seller.createProperty(listing, scanner);
                    break;
                case 2:
                    seller.viewMessages(listing, scanner);
                    break;
                case 3:
                    seller.replyToBuyer(listing, scanner);
                    break;
                case 4:
                    seller.reviewPayments(listing, scanner);  // <-- Call the new method
                    break;
                case 5:
                    exit = true;
                    System.out.println("Returning to main menu...");
                    break;
                default:
                    System.out.println("Invalid choice, try again.");
            }
        }
    }
}
