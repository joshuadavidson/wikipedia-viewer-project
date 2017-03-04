/* establish global variables for ESLint */
/* global window document */

import $ from 'jquery';

// import custom styles for project
import './index.scss';

// function that takes each result and returns it in HTML format
function createResultHTML(title, extract, pageURL, imgURL) {
  // set the class for the entire result div
  const resultClass = 'result';
  // set the class for the title
  const resultTitleClass = 'result-title';
  // set the class for the result extract text
  const resultExtractClass = 'result-extract';

  // return link only if pageurl is passed.
  if (pageURL) {
    return `<a href="${pageURL}" target="_blank">
      <div class="row ${resultClass}">
        <div class="col-md-2">
          <img src="${imgURL}" class="img-responsive center-block">
        </div>
        <div class="col-md-10">
          <p class="${resultTitleClass}">${title}</p>
          <p class="${resultExtractClass}">${extract}</p>
          </div>
      </div>
      </a>`;
  }

  // pageurl not passed return without link tag
  return `<div class="row ${resultClass}">
      <div class="col-md-2">
        <img src="${imgURL}" class="img-responsive center-block">
      </div>
      <div class="col-md-10">
        <p class="${resultTitleClass}">${title}</p>
        <p class="${resultExtractClass}">${extract}</p>
      </div>
    </div>`;
}

// function that shortens an extract to a maxium length of cutoffLength to the nearest word.
function shortenExtract(extract, length) {
  let cutoffLength = length || 250;

  // if extract is less than cutoff then return it
  if (extract.length < cutoffLength) {
    return extract;
  }

  // extract is longer than cutoff so must be trimmed
  while (extract.charAt(cutoffLength) !== ' ') {
    cutoffLength -= 1;
  }
  return `${extract.slice(0, cutoffLength)}...`;
}

// Wikimedia API call
function searchWikipedia(searchTerm) {
  // clear old search results if they exist
  $('#results-block').empty();
  $.ajax({
    url: 'https://en.wikipedia.org/w/api.php?',
    data: {
      action: 'query', // query wikipedia
      generator: 'search', // Return a list of search results
      gsrsearch: searchTerm, // search term
      gsrlimit: '10', // Search results limit
      prop: 'info|extracts|pageimages', // get page information, extracts, and images
      inprop: 'url', // get the url from the info property
      exlimit: 'max', // return as many extracts as possible
      exintro: '', // get the text from the introduction
      explaintext: '', // format the introduction text as plain text
      piprop: 'thumbnail', // return the main thumbnail
      pilimit: '10', // number of images to return
      pithumbsize: '150', // maxium pixel size of thumbnail
      format: 'json', // return JSON format
    },
    dataType: 'jsonp',
    type: 'POST',
    headers: {
      'Api-User-Agent': 'Wikipedia Viewer for Free Code Camp Project (https://jwaynedavidson.com/projects/wikipedia-viewer/viewer.html; email@jwaynedavidson.com)',
    },
    success(data) {
      // ensure that wikipedia call returned results
      if (data.query !== undefined) {
        $.each(data.query.pages, (pageid, page) => {
          // set image url to wikipeida logo by default
          let pageImgURL = 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png';

          if (page.thumbnail !== undefined) {
            pageImgURL = page.thumbnail.source;
          }

          $('#results-block').hide().append(createResultHTML(page.title, shortenExtract(page.extract), page.fullurl, pageImgURL)).fadeIn(100);
        });
      }

      // if no results from wikipedia inform the user
      else {
        $('#results-block').hide().append(createResultHTML('No Results Found', 'Please modify your search and try again.', undefined, 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png')).fadeIn(100);
      }
    },
    error() {
      window.alert('Wikipedia call failed. Try again later.');
    },
  });
}

// watch for a submit on the form
$('#form').submit((event) => {
  searchWikipedia(document.getElementById('input-field').value);
  $('#search-block').animate({ // animate the search form transition
    'padding-top': '0px',
  }, 'slow');
  event.preventDefault(); // prevent submit which clears form
});

// while results are loading inform the user
$('#loading-img').hide();
$(document).ajaxStart(() => {
  $('#loading-img').show();
});
$(document).ajaxStop(() => {
  $('#loading-img').hide();
});

// toggle highlight of selected results
$(document).on('mouseenter', 'div.result', function mouseEnter() {
  $(this).addClass('result-selected');
});
$(document).on('mouseleave', 'div.result', function mouseLeave() {
  $(this).removeClass('result-selected');
});
