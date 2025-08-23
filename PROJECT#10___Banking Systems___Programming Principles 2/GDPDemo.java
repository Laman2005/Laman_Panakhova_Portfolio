/*
 Welcome to my project!!!
 Run GDPDemo and see the output please!!!

 The following link to YouTube video 
 about the explanation of the project code is on README.md file.

 The main purpose here is to read the data 
 from the countries.csv file and procces it to certain methods 
 such as filter and sort.

 There are some exceptions for handling the problems.

 There is a method to save the data in a new file with the savecountries method.

 GDPDemo is the main class run and see the output!!! :)

 ...
 */

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class GDPDemo {
    public static void main(String[] args) throws FileNotFoundException, InvalidFieldNameException {

        System.out.println("Welcome to my project!!!\nRun GDPDemo and see the output please!!!");

        System.out.println();
        System.out.print("Just an example:\n");
        FileManager.loadCountries(); // Load all the countries from countries.csv

        // Call the sort method to sort all countries based on the continent (first) and
        // country names
        // sort(sortedCountries);

        // Save the result in a .csv file
        // Call the sort method again to sort all countries based on the descending
        // order of population
        // Save the result in a .csv file

        // //Call the filterByContinent method to find the info about countries in
        // Oceania
        // Save the result in a .csv file
        // Define a method filterByPerCapita(List countries, Double lower, Double
        // upper) method to select those countries whose UN_GDP_per_capita falls in the
        // given range
        // Call the filterByPerCapita method to find the info about countries whose per
        // capita gdp is in the range of [40000,50000]
        // Save the result in a .csv file

        try {
            var parse = Country
                    .parseFrom("80,31,Azerbaijan,Europe,10412.65,72912000000,37847204069,7002.25,3634.733144");
            System.out.println(parse);
        } catch (StringCannotParsedException scp) {
            scp.getStackTrace();
        }
        System.out.println();
        try {
            var sorted = sort(FileManager.COUNTRIES, "population", "order");
            FileManager.saveCountries(sorted, "data/sortedPopul.csv");

            var res = filterByContinent(FileManager.COUNTRIES, "asia");
            FileManager.saveCountries(res, "data/sortAsia.csv");

            var res2 = filterByContinent(FileManager.COUNTRIES, "Oceania");
            FileManager.saveCountries(res2, "data/filterOceania.csv");

            var resPerCapita = filterByPerCapita(FileManager.COUNTRIES, 40000.00, 50000.00);
            FileManager.saveCountries(resPerCapita, "data/filterPerCapita.csv");

            var res1 = sort(FileManager.COUNTRIES, "id", "Ascending");
            FileManager.saveCountries(res1, "data/sortedId.csv");

            FileManager.saveCountries(
                    sort(FileManager.COUNTRIES, "countryName", "Descending"),
                    "data/sortNameDesc.csv");

            var res3 = sort(FileManager.COUNTRIES, "population", "Ascending");
            FileManager.saveCountries(res3, "data/sortPopulAsc.csv");

            var res4 = sort(FileManager.COUNTRIES, "continent", "Descending");
            FileManager.saveCountries(res4, "data/sortContinent.csv");

            var res5 = sort(FileManager.COUNTRIES, "UN_GDP_per_capita", "Ascending");
            FileManager.saveCountries(res5, "data/sortUN_GDP_per_capita.csv");

            var res6 = sort(FileManager.COUNTRIES, "countryName", "Ascending");
            FileManager.saveCountries(res6, "data/sortNamesAsc.csv");

            var res7 = sort(FileManager.COUNTRIES, "population", "Descending");
            FileManager.saveCountries(res7, "data/sortPopulDesc.csv");

            var res8 = sort(FileManager.COUNTRIES, "continent", "Ascending");
            var res9 = sort(res8, "countryName", "Ascending");
            FileManager.saveCountries(res9, "data/SortContinentCountryNames.csv");



        } catch (OverwritingExistingFileException oef) {
            oef.getStackTrace();
        } catch (FileNotFoundException ffe) {
            ffe.getStackTrace();
        } catch (InvalidFieldNameException ife) {
            ife.getStackTrace();
        }
    }

    static List<Country> sort(List<Country> countries, String fieldName, String order) throws InvalidFieldNameException {
        // Define a method sort(List countries, String fieldName, String order) method
        // to sort the list of all countries based on the given field and order

        return countries.stream().sorted(
                getComparator(fieldName, order)).toList();

    }

    static Comparator<Country> getComparator(String fieldName, String order) throws InvalidFieldNameException{

        Comparator<Country> comp = null;

        switch (fieldName) {
            case "id":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getId().compareTo(c2.getId())
                        : (c1, c2) -> c2.getId().compareTo(c1.getCountryName());
                break;

            case "countryName":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getCountryName().compareTo(c2.getCountryName())
                        : (c1, c2) -> c2.getCountryName().compareTo(c1.getCountryName());

                break;
            case "continent":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getContinent().compareTo(c2.getContinent())
                        : (c1, c2) -> c2.getContinent().compareTo(c1.getContinent());

                break;
            case "population":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getPopulation().compareTo(c2.getPopulation())
                        : (c1, c2) -> c2.getPopulation().compareTo(c1.getPopulation());

                break;
            case "IMF_GDP":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getIMF_GDP().compareTo(c2.getIMF_GDP())
                        : (c1, c2) -> c2.getIMF_GDP().compareTo(c1.getIMF_GDP());

                break;
            case "UN_GDP":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getUN_GDP().compareTo(c2.getUN_GDP())
                        : (c1, c2) -> c2.getUN_GDP().compareTo(c1.getUN_GDP());

                break;
            case "IMF_GDP_per_capita":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getIMF_GDP_per_capita().compareTo(c2.getIMF_GDP_per_capita())
                        : (c1, c2) -> c2.getIMF_GDP_per_capita().compareTo(c1.getIMF_GDP_per_capita());
                break;
            case "UN_GDP_per_capita":
                comp = "Ascending".equals(order)
                        ? (c1, c2) -> c1.getUN_GDP_per_capita().compareTo(c2.getUN_GDP_per_capita())
                        : (c1, c2) -> c2.getUN_GDP_per_capita().compareTo(c1.getUN_GDP_per_capita());
                break;
        }

        return comp;
    }

    static List<Country> filterByContinent(List<Country> countries, String continent) {
        // Define a method filterByContinent(List countries, String continent)
        // method to select only those countries that are in the given continent

        List<Country> filteredCountries = new ArrayList<>(countries);
        var filtered = filteredCountries.stream().filter(
                c -> c.getContinent().equalsIgnoreCase(continent)

        );

        return filtered.collect(Collectors.toList());
    }

    static List<Country> filterByPerCapita(List<Country> countries, Double lower, Double upper) {

        List<Country> filteredCountries_PerCapita = new ArrayList<>(countries);
        var filteredPerCapita = filteredCountries_PerCapita.stream().filter(
                p -> p.getUN_GDP_per_capita() > lower && p.getUN_GDP_per_capita() < upper);

        return filteredPerCapita.collect(Collectors.toList());
    }

}
