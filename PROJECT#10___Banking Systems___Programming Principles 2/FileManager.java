import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class FileManager {

    public static final List<Country> COUNTRIES = new ArrayList<>();
    static List<Country> loadCountries() throws FileNotFoundException {
        // returns a list of countries reading the original data source

        final String COUNTRIES_DATA_FILE = "data/countries.csv";
        if (!new File(COUNTRIES_DATA_FILE).exists())
            throw new FileNotFoundException("Specified file is not found!");

        try (BufferedReader br = new BufferedReader(new FileReader(COUNTRIES_DATA_FILE))) {
            br.readLine();

            String line = null;

            while ((line = br.readLine()) != null)
                try {
                    COUNTRIES.add(Country.parseFrom(line));
                } catch (Exception e) {
                    e.getStackTrace();
                }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return COUNTRIES;
    }

    static void saveCountries(List<Country> countries, String fileName)
            throws FileNotFoundException, OverwritingExistingFileException {
        // generates a file with the given filename (under the data folder) and stores
        // the list of countries in the file.

        File f = new File("data", fileName);
        if (f.exists())
            throw new OverwritingExistingFileException("Attempt to overwrite an existing file!");

        try (BufferedWriter bw = new BufferedWriter(new FileWriter(fileName))) {

            countries.stream().forEach(c -> {
                try {
                    bw.write(c.parseTo() + "\n");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}
