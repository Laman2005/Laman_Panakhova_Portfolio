import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Message {
    private String buyerId;
    private String sellerId;
    private String sender;
    private String receiver;  // New: identify who the message is intended for
    private String content;
    private int propertyId;
    private LocalDateTime timestamp; // New: timestamp for when the message was created

    // DateTime format for CSV
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Constructor for creating a new Message (timestamp = now).
     */
    public Message(String buyerId, String sellerId, String sender, String receiver, String content, int propertyId) {
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.propertyId = propertyId;
        this.timestamp = LocalDateTime.now(); // set current time
    }

    /**
     * Constructor for loading a Message from CSV (timestamp provided).
     */
    public Message(String buyerId, String sellerId, String sender, String receiver, String content, int propertyId, LocalDateTime timestamp) {
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.propertyId = propertyId;
        this.timestamp = timestamp;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getSender() {
        return sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public String getContent() {
        return content;
    }

    public int getPropertyId() {
        return propertyId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getTimestampAsString() {
        return this.timestamp.format(FORMATTER);
    }

    @Override
    public String toString() {
        return "-----------------------------------------\n"
                + "Timestamp: " + getTimestampAsString() + "\n"
                + "From: " + sender + "\n"
                + "To: " + receiver + "\n"
                + "Property ID: " + propertyId + "\n"
                + "Message: " + content + "\n"
                + "-----------------------------------------\n";
    }
}
