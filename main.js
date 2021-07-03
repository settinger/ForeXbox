// Current system loads alllll the exchange info when the user loads the page.
// This could be improved by selectively loading data as the user requests it.
// However this seems pretty unnecessary because it only saves like 40 kb at best.

const $ = (id) => document.getElementById(id);

// Populate dropdown
for (let country of Object.keys(db)) {
  const c = document.createElement("option");
  c.innerText = country;
  $("countries").appendChild(c);
  $("countries").value = "Italy";
}

// calculate CPI multiplier
// Interpolate if necessary
const CPI = (year1, year2 = 2001) => {
  if (!Object.keys(USCPI).includes(year1)) {
    let prior = Math.max(...Object.keys(USCPI).filter((x) => x <= year1));
    let post = Math.min(...Object.keys(USCPI).filter((x) => x > year1));
    USCPI[year1] =
      USCPI[prior] +
      ((year1 - prior) / (post - prior)) * (USCPI[post] - USCPI[prior]);
  }
  if (!Object.keys(USCPI).includes(year2)) {
    let prior = Math.max(...Object.keys(USCPI).filter((x) => x <= year2));
    let post = Math.min(...Object.keys(USCPI).filter((x) => x > year2));
    USCPI[year2] =
      USCPI[prior] +
      ((year2 - prior) / (post - prior)) * (USCPI[post] - USCPI[prior]);
  }
  return USCPI[year2] / USCPI[year1];
};

const update = (event) => {
  let year = parseInt($("year").value);
  let payout = parseFloat($("payout").value);
  let country = db[$("countries").value];
  // Set year range
  $("yearRange").innerText = `(${country.start} – ${country.end})`;
  // If current year is before start of data or after end of data, modify
  if (year < country.start) {
    $("year").value = country.start;
    year = country.start;
  }
  if (year > country.end) {
    $("year").value = country.end;
    year = country.end;
  }
  // Set currency type
  $("currencyUnit").innerText = country.currency(year);

  let generalNumber = new Intl.NumberFormat();
  // Get that year's value in USD
  let USD = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD"
  });
  let UsdOld = USD.format(payout / country.xr(year));
  let Usd2001 = USD.format(payout / country.xr(year) * CPI(year));
  let boxen = payout / country.xr(year) * CPI(year) / 299.99;
  $("tldr").innerText = generalNumber.format(boxen) + " Xboxes"
  $("xboxen").innerHTML = `
<p>
  In ${year}, one U.S. dollar was worth roughly <b>${generalNumber.format(country.xr(year))} ${country.currency(year)}</b>. A payout of ${generalNumber.format(payout)} ${country.currency(year)} was equivalent to <b>USD ${UsdOld}</b> in ${year}.
</p>
<p>
  In 2001, the U.S. Consumer Price Index (USCPI) was ${CPI(year).toFixed(3)} times the USCPI of ${year}. Therefore the payout in ${year} was roughly equivalent to <b>${Usd2001}</b> in 2001.
</p>
<p>
  At the North America launch in 2001, a first-generation Xbox cost $299.99. The payout would pay for <b>${generalNumber.format(boxen)} Xboxes</b>.
</p>
`;
};

update();
$("mainForm").onchange = update;
