#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');

function getDueDate(item) {
  const assignment = item.closest('.assignment');
  return assignment.find('.assignment-date-due time[title]').first().attr('title') || null;
}

function getStatus(item) {
  const availableText = item.closest('.assignment')
    .find('.assignment-date-available')
    .text()
    .trim()
    .toLowerCase();

  if (availableText.includes('closed')) {
    return 'Inactive';
  }

  return 'Active';
}

function scrapeData(filePath = 'dom.html', selector = '.ig-title') {
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const $ = jquery(dom.window);
  const results = [];

  $(selector).each((index, element) => {
    const item = $(element);
    const dueDate = getDueDate(item);

    results.push({
      title: item.text().trim(),
      link: item.attr('href') || null,
      available_until: dueDate,
      status: getStatus(item)
    });
  });

  return results;
}

function main() {
  const [, , inputFile = 'dom.html', selector = '.ig-title'] = process.argv;
  const filePath = path.resolve(inputFile);
  const results = scrapeData(filePath, selector);

  if (results.length === 0) {
    console.log(`No elements found for selector: ${selector}`);
    return;
  }

  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { scrapeData };