const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const csv = require('csv-stringify');
const parse = require('csv-parse');
const path = require('path');
const fs = require('fs');

const destination = 'stats';

fetch('https://www.boulderwelt-muenchen-ost.de/wp-admin/admin-ajax.php', {
  headers: {
    accept: '*/*',
    'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    pragma: 'no-cache',
    'x-requested-with': 'XMLHttpRequest',
  },
  body: 'action=cxo_get_crowd_indicator',
  method: 'POST',
  mode: 'cors',
})
  .then((res) => res.json())
  .then((stats) => {
    const { queue, percent } = stats;
    console.log(stats);
    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })
    );

    const totals = () => {
      const fp = path.join(destination, 'total.csv');

      const data = [
        ['Date', 'Occupancy', 'Waiting Queue'],
        [now.toISOString(), percent / 100.0, queue],
      ];

      if (fs.existsSync(fp)) {
        const prev = fs.readFileSync(fp);
        parse(prev, (err, lines) => {
          if (err) {
            throw err;
          }
          lines.shift();
          data.push(...lines);
        });
      }

      csv(data, (err, result) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync(fp, String(result));
      });
    };

    totals();
  });
