const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const csv = require('csv-stringify');
const parse = require('csv-parse');
const path = require('path');
const fs = require('fs');

const destination = 'stats';

fetch('https://www.boulderwelt-muenchen-ost.de/ampel_2/')
  .then((res) => res.text())
  .then((html) => {
    const doc = new JSDOM(html);
    const occupancy = doc.window.document.querySelector(
      '#crowd-level-tags-container > div.crowd-level-tag.crowd-level-pointer > div'
    ).innerHTML;

    const now = new Date(
      new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })
    );

    const totals = () => {
      const fp = path.join(destination, 'total.csv');

      const data = [
        ['Date', 'Occupancy'],
        [now.toISOString(), occupancy],
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
