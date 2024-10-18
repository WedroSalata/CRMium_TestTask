async function initialize() {
  const nbuRate = await fetchExchangeRate();
  if (nbuRate !== null) {
    document.getElementById("nbuRate").value = nbuRate;
    updateDifference();
  }
}

// Fetch the current exchange rate from the NBU
async function fetchExchangeRate() {
  try {
    const response = await fetch(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json"
    );
    const data = await response.json();
    return data[0].rate;
  } catch (error) {
    console.error("Error fetching NBU exchange rate:", error);
    return null;
  }
}

function updateDifference() {
  const nbuRate = parseFloat(document.getElementById("nbuRate").value);
  const agreementRate = parseFloat(
    document.getElementById("agreementRate").value
  );
  const difference = calculateDifference(nbuRate, agreementRate);
  document.getElementById("rateDifference").value = difference + "%";

  const updateButton = document.getElementById("updateButton");
  if (parseFloat(difference) >= 5) {
    updateButton.classList.remove("hidden");
  } else {
    updateButton.classList.add("hidden");
  }
}

function calculateDifference(nbuRate, agreementRate) {
  const difference = ((agreementRate - nbuRate) / nbuRate) * 100;
  return Math.abs(difference).toFixed(1);
}

let searchedId  = "NaN"
// ZOHO Embedded App onPageLoad event
ZOHO.embeddedApp.on("PageLoad", function (data) {
  searchedId = data.EntityId;
  console.log("Page loaded with data:", data);

  // Fetch the agreement rate from Zoho CRM
  ZOHO.CRM.API.getRecord({
    Entity: "Deals",
    RecordID: searchedId, // Replace with the actual Record ID
  }).then(function (response) {
    if (response && response.data && response.data[0]) {
      const agreementRate = response.data[0].myField;
      document.getElementById("agreementRate").value = agreementRate;
      updateDifference();
    } else {
      console.error("Error fetching agreement rate from Zoho CRM:", response);
    }
  });
});

// Event listener for the update button
document.getElementById("updateButton").addEventListener("click", () => {
  const nbuRate = parseFloat(document.getElementById("nbuRate").value);

  // Update the external field in Zoho CRM with the NBU rate value
  var config = {
    Entity: "Deals",
    APIData: {
      id: searchedId, // Replace with the correct Record ID dynamically if needed
      myField: nbuRate.toString(),
    },
    Trigger: ["workflow"],
  };

  ZOHO.CRM.API.updateRecord(config).then(function (response) {
    if (
      response &&
      response.data &&
      response.data[0] &&
      response.data[0].code === "SUCCESS"
    ) {
      console.log("Agreement rate updated successfully in Zoho CRM.");
    } else {
      console.error("Error updating agreement rate in Zoho CRM:", response);
    }
  });
});

// Initialize Zoho Embedded App
ZOHO.embeddedApp.init();

// Call the initialize function when the window loads
window.onload = initialize;
