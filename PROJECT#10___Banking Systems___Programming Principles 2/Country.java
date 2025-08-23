public class Country {
    private String id;
    private String countryName;
    private String continent;
    private Double population;
    private Double IMF_GDP;
    private Double UN_GDP;
    private Double IMF_GDP_per_capita;
    private Double UN_GDP_per_capita;

    public Country() {
    }

    public Country(Country c) {
        this(c.getId(), c.getCountryName(), c.getContinent(), c.getPopulation(), c.getIMF_GDP(), c.getUN_GDP(),
                c.getIMF_GDP_per_capita(), c.getUN_GDP_per_capita());
    }

    public Country(String id, String countryName, String continent, Double population, Double IMF_GDP, Double UN_GDP,
            Double IMF_GDP_per_capita, Double UN_GDP_per_capita) {
        this.id = id;
        this.countryName = countryName;
        this.continent = continent;
        this.population = population;
        this.IMF_GDP = IMF_GDP;
        this.UN_GDP = UN_GDP;
        this.IMF_GDP_per_capita = IMF_GDP_per_capita;
        this.UN_GDP_per_capita = UN_GDP_per_capita;
    }

    public String getId() {
        return id;
    }

    public String getCountryName() {
        return countryName;
    }

    public String getContinent() {
        return continent;
    }

    public Double getPopulation() {
        return population;
    }

    public Double getIMF_GDP() {
        return IMF_GDP;
    }

    public Double getUN_GDP() {
        return UN_GDP;
    }

    public Double getIMF_GDP_per_capita() {
        return IMF_GDP_per_capita;
    }

    public Double getUN_GDP_per_capita() {
        return UN_GDP_per_capita;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public void setContinent(String continent) {
        this.continent = continent;
    }

    public void setPopulation(Double population) {
        this.population = population;
    }

    public void setIMF_GDP(Double iMF_GDP) {
        IMF_GDP = iMF_GDP;
    }

    public void setuN_GDP(Double uN_GDP) {
        this.UN_GDP = uN_GDP;
    }

    public void setiMF_GDP_per_capita(Double IMF_GDP_per_capita) {
        this.IMF_GDP_per_capita = IMF_GDP_per_capita;
    }

    public void setUN_GDP_per_capita(Double UN_GDP_per_capita) {
        this.UN_GDP_per_capita = UN_GDP_per_capita;
    }

    @Override
    public String toString() {
        return "Country [id=" + id + ", countryName=" + countryName + ", continent=" + continent + ", population="
                + population + ", IMF_GDP=" + IMF_GDP + ", UN_GDP=" + UN_GDP + ", IMF_GDP_per_capita="
                + IMF_GDP_per_capita + ", UN_GDP_per_capita=" + UN_GDP_per_capita + "]";
    }

    public static Country parseFrom(String countryRecord) throws StringCannotParsedException {
        // parses the given string (comma-separated) to create
        // an instance of Country and returns it >>>

        String[] tokens = countryRecord.split(",");

        try {
            Country countInst = new Country(

                    tokens[1],
                    tokens[2],
                    tokens[3],
                    Double.parseDouble(tokens[4]),
                    Double.parseDouble(tokens[5]),
                    Double.parseDouble(tokens[6]),
                    Double.parseDouble(tokens[7]),
                    Double.parseDouble(tokens[8])

            );
            return countInst;

        } catch (Exception e) {
            throw new StringCannotParsedException("Given string cannot be parsed to a country!");
        }
    }

    public String parseTo() {
        // parses the current country instance to a string record (comma-separated)
        // to be later stored in a file

        String countryRecord = String.join(",",

                "",
                this.getId(),
                this.getCountryName(),
                this.getContinent(),
                Double.toString(this.getPopulation()),
                Double.toString(this.getIMF_GDP()),
                Double.toString(this.getUN_GDP()),
                Double.toString(this.getIMF_GDP_per_capita()),
                Double.toString(this.getUN_GDP_per_capita()));
        return countryRecord;
    }

    public static String parseTo(Country countryInstance) {
        // parses the given country instance to a string record (comma-separated)
        // to be later stored in a file.
        return countryInstance.parseTo();

    }

}