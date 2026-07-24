const urls = [
  "https://www.google.com/maps/place/Teide/@28.2723363,-16.6449191,15z/data=!3m1!4b1!4m6!3m5!1s0xc6a8270b2f349c1:0xdcdb249b5c3e03!8m2!3d28.272337!4d-16.6423442!16zL20vMDFwOHQx?entry=ttu",
  "https://goo.gl/maps/xyz",
  "https://maps.google.com/?q=28.2723,-16.6423"
];

const exactMatch = urls[0].match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
console.log(exactMatch);
