# AI Adoption in EU Companies

**Exploring the Digital Divide Across Countries, Company Sizes and Industries**

Data Visualization course project – Group Proposal

Website: https://federicocerra.github.io/DataVisualizationProject/

---

## 1. Group Members and Working Project Title

| Name | Student ID |
|---|---|
| Giorgio Innocenti | 5299405 |
| Alessio Scarpulla | 5231799 |
| Federico Cerra | 5513839 |

**Working project title:** *AI Adoption in EU Companies: Exploring the Digital Divide Across Countries, Company Sizes and Industries.*

## 2. Main Research Question and Supporting Questions

### Main research question

> How does AI adoption vary across European companies, and what differences emerge between countries, company sizes and economic sectors?

### Supporting questions

- **Geographical differences:** Which European countries have the highest and lowest levels of AI adoption?
- **Company size differences:** Are large companies more likely to adopt AI than small and medium-sized enterprises?
- **Industry differences:** Which economic sectors are leading the adoption of AI, and which are lagging behind?
- **Evolution over time:** How has AI adoption among European enterprises changed between 2021 and 2025?
- **Changes in the Digital Divide:** Are the differences in AI adoption between countries and company sizes increasing or decreasing over time? For example, is the gap between large and small enterprises, or between countries with the highest and lowest adoption rates, widening or narrowing?

## 3. Intended Audience

The project is aimed at students, young professionals, business owners and anyone interested in understanding how artificial intelligence is transforming the European business landscape.

In particular, it may be useful for people interested in economics, business management and digital innovation, as well as policymakers, decision-makers and journalists who want to understand and communicate the differences in AI adoption across European countries and industries.

The findings could also provide useful insights for newspapers, television news programmes and other media outlets looking to report on the growing role of artificial intelligence in the European economy.

The website will present statistical information through accessible visualizations and concise explanations, making the topic understandable even to readers without a technical background.

## 4. Promising Datasets

### Dataset 1 – AI Adoption by Country and Company Size

**Source:** Eurostat · [`isoc_eb_ai`](https://ec.europa.eu/eurostat/databrowser/view/isoc_eb_ai/default/table)

Measures the percentage of enterprises using at least one AI technology, broken down by country, year and company size.

The dataset covers enterprises with at least 10 persons employed. The size categories are:

- **Small enterprises:** 10–49 persons employed
- **Medium-sized enterprises:** 50–249 persons employed
- **Large enterprises:** 250 or more persons employed

**What we can analyse:**

- Compare AI adoption rates across European countries.
- Compare adoption among small, medium-sized and large enterprises.
- Analyse how AI adoption has evolved over time.
- Investigate whether differences in adoption between company sizes and countries are increasing or decreasing.

### Dataset 2 – AI Adoption by Economic Activity

**Source:** Eurostat · [`isoc_eb_ain2`](https://ec.europa.eu/eurostat/databrowser/view/isoc_eb_ain2/default/table)

Shows the extent to which AI technologies are used across different economic sectors, such as manufacturing, services, information and communication, and professional activities.

As with the first dataset, the statistics cover enterprises with at least 10 persons employed and the economic activities included in the Eurostat survey.

**What we can analyse:**

- Compare AI adoption rates across different economic sectors.
- Identify the industries with the highest and lowest adoption rates.
- Create rankings and comparative bar charts.
- Analyse how AI adoption is evolving across different industries.

## 5. Initial Visualization Ideas and Data Availability Concerns

### Initial Visualization Ideas

**1. AI Adoption Across European Countries**

- A choropleth map showing the percentage of enterprises using AI in each European country.
- A bar chart ranking countries from highest to lowest AI adoption.
- A comparison between selected countries, such as Italy, Germany, France and Spain.

**2. Does Company Size Matter?**

- A grouped bar chart comparing AI adoption among small (10–49 employees), medium-sized (50–249 employees) and large enterprises (250 or more employees).
- A comparison of company size differences across selected European countries.
- An analysis of whether larger enterprises consistently show higher AI adoption rates.

**3. AI Adoption Across Economic Sectors**

- A bar chart comparing AI adoption rates across different economic sectors.
- A ranking identifying the industries with the highest and lowest adoption rates.
- A heatmap comparing AI adoption across countries and economic sectors, if data availability allows it.

**4. The Evolution of AI Adoption Over Time**

- Line charts showing changes in AI adoption in the available survey years: 2021, 2023, 2024 and 2025.
- The charts will make the missing year 2022 visible, avoiding a continuous line that could suggest that data are available for that year.
- A comparison of adoption trends across countries and economic sectors.
- An infographic highlighting key statistics and differences in AI adoption.

### Data Availability and Potential Limitations

Although the two datasets provide useful information, we have identified some aspects that require consideration:

- **Lack of company-level information:** The datasets provide aggregated statistical information rather than individual company records. Therefore, we cannot identify specific companies or track the adoption of AI within the same company over time.
- **Limited coverage of enterprises:** The statistics do not represent all European companies. They cover enterprises with at least 10 persons employed and exclude micro-enterprises. The survey also covers only specific economic activities: NACE Rev. 2 sections C–J and L–N, and group 95.1. Consequently, sectors such as agriculture, financial and insurance activities, education, human health and social work, and public administration are not included.
- **Classification of economic activities:** We have verified that, in these Eurostat enterprise statistics, each enterprise is classified according to its principal economic activity. This means that an enterprise operating in multiple sectors is assigned to the sector corresponding to its main activity.
- **Missing data and time coverage:** The AI module of the Eurostat survey is available for 2021, 2023, 2024 and 2025, but not for 2022. Some countries, years or economic sectors may also have incomplete observations, potentially limiting certain comparisons.
- **Changes in AI measurement over time:** Eurostat introduced a common definition of AI in the 2021 survey to improve comparability across countries. However, some questions and aspects of the AI module were subsequently modified or added in 2023, 2024 and 2025. Therefore, comparisons over time will need to take these methodological changes into account.

For example, the EU share of enterprises using at least one AI technology was **7.7%** in 2021, **8.1%** in 2023, **13.5%** in 2024 and **20.0%** in 2025. These figures suggest a significant increase in AI adoption, but the results will be interpreted with the methodological considerations described above.

Both datasets report the same last update date on Eurostat: **15 June 2026**. This provides a common reference point for our initial data collection, although we will still need to verify that the selected indicators and statistical definitions are comparable.

We will take these limitations into account during the data preparation stage and adapt our visualizations accordingly.

---

## How to run

The page loads CSV files with `d3.csv`, so it must be opened through a local server
(double-clicking `index.html` does not work). From this folder run:

```
python -m http.server 8000
```

then open http://localhost:8000

## Data

Downloaded from the Eurostat API (last update 15 June 2026), filtered to the EU-27 countries:

- `data/ai_by_size.csv` – dataset `isoc_eb_ai`: % of enterprises using at least one AI technology,
  by company size, 2021–2025
- `data/ai_by_sector.csv` – dataset `isoc_eb_ain2`: % of enterprises using at least 1, 2 or 3 AI
  technologies, by economic sector, 2025
