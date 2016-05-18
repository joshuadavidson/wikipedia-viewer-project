//function that takes each result and returns it in HTML format
function createResultHTML(title, extract, pageURL, imgURL) {
  let resultClass = 'result'; //set the class for the entire result div
  let resultTitleClass = 'result-title' //set the class for the title
  let resultExtractClass = 'result-extract' //set the class for the result extract text
  let resultImgClass = 'result-img' //set the class for the result image
  if (pageURL) { // return link only if pageurl is passed.
    return '<a href="' + pageURL + '" target="_blank">' +
      '<div class="row ' + resultClass + '">' +
      '<div class="col-md-2">' +
      '<img src="' + imgURL + '" class="img-responsive center-block">' +
      '</div>' +
      '<div class="col-md-10">' +
      '<p class="' + resultTitleClass + '">' + title + '</p>' +
      '<p class="' + resultExtractClass + '">' + extract + '</p>' +
      '</div>' +
      '</div>' +
      '</a>';
  } else { //pageurl not passed return without link tag
    return '<div class="row ' + resultClass + '">' +
      '<div class="col-md-2">' +
      '<img src="' + imgURL + '" class="img-responsive center-block">' +
      '</div>' +
      '<div class="col-md-10">' +
      '<p class="' + resultTitleClass + '">' + title + '</p>' +
      '<p class="' + resultExtractClass + '">' + extract + '</p>' +
      '</div>' +
      '</div>';
  }
}

//function that shortens an extract to a maxium length of cutoffLength to the nearest word.
function shortenExtract(extract, cutoffLength) {
  var cutoffLength = cutoffLength || 250;
  if (extract.length < cutoffLength) {
    return extract;
  } else {
    while (extract.charAt(cutoffLength) !== ' ') {
      cutoffLength--;
    }
    return extract.slice(0, cutoffLength) + '...';
  }
}

//Wikimedia API call
function searchWikipedia(searchTerm) {
  $('#results-block').empty(); //clear old search results if they exist
  $.ajax({
    url: 'https://en.wikipedia.org/w/api.php?',
    data: {
      action: 'query', //query wikipedia
      generator: 'search', //Return a list of search results
      gsrsearch: searchTerm, //search term
      gsrlimit: '10', //Search results limit
      prop: 'info|extracts|pageimages', //get page information, extracts, and images
      inprop: 'url', //get the url from the info property
      exlimit: 'max', //return as many extracts as possible
      exintro: '', //get the text from the introduction
      explaintext: '', //format the introduction text as plain text
      piprop: 'thumbnail', //return the main thumbnail
      pilimit: '10', //number of images to return
      pithumbsize: '150', //maxium pixel size of thumbnail
      format: 'json' //return JSON format
    },
    dataType: 'jsonp',
    type: 'POST',
    headers: {
      'Api-User-Agent': 'Wikipedia Viewer for Free Code Camp Project (https://jwaynedavidson.com/projects/wikipedia-viewer/viewer.html; email@jwaynedavidson.com)'
    },
    success: function(data) {
      if (data.query !== undefined) { //ensure that wikipedia call returned results
        $.each(data.query.pages, function(pageid, page) {

          let pageImgURL = 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png'; //set image url to wikipeida logo by default
          if (page.thumbnail !== undefined) {
            pageImgURL = page.thumbnail.source;
          }

          $('#results-block').hide().append(createResultHTML(page.title, shortenExtract(page.extract), page.fullurl, pageImgURL)).fadeIn(100);

        });
      } else { //if no results from wikipedia inform the user
        $('#results-block').hide().append(createResultHTML('No Results Found', 'Please modify your search and try again.', undefined, 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png')).fadeIn(100);
      }
    },
    error: function() {
      alert('Wikipedia call failed');
    }
  });
}

$(document).ready(function() {
  //watch for a submit on the form
  $('#form').submit(function(event) {
    searchWikipedia(document.getElementById("input-field").value);
    $('#search-block').animate({ //animate the search form transition
      'padding-top': '0px'
    }, 'slow');
    event.preventDefault(); //prevent submit which clears form
  });

  //while results are loading inform the user
  $('#loading-img').hide();
  $(document).ajaxStart(function() {
    $("#loading-img").show();
  });
  $(document).ajaxStop(function() {
    $("#loading-img").hide();
  });

  //toggle highlight of selected results
  $(document).on('mouseenter', 'div.result', function(e) {
    $(this).addClass("result-selected");
  });
  $(document).on('mouseleave', 'div.result', function(e) {
    $(this).removeClass("result-selected");
  });
});
