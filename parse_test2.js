const regex1 = /!3d(-?\d+(?:\.\d+)?)/;
const regex2 = /!4d(-?\d+(?:\.\d+)?)/;

function parseURL(url) {
  let lat = null, lng = null;
  const m1 = url.match(regex1);
  const m2 = url.match(regex2);
  if (m1 && m2) {
    lat = parseFloat(m1[1]);
    lng = parseFloat(m2[1]);
  }
  return { lat, lng };
}

console.log(parseURL("https://www.google.com/maps/place/Teide/@28.2723363,-16.6449191,15z/data=!3m1!4b1!4m6!3m5!1s0xc6a8270b2f349c1:0xdcdb249b5c3e03!8m2!3d28.272337!4d-16.6423442!16zL20vMDFwOHQx?entry=ttu"));
