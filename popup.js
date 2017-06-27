function _getExtension() {
  return chrome.extension.getBackgroundPage()._noNewTabsExtension;
}

function clearHistory() {
   _getExtension().clearHistory();
  displayHistory();
}

function removeHistoryItem(item) {
   _getExtension().removeFromHistory(item);
  displayHistory();
}

function openHistoryItem(item) {
   _getExtension().openNewTab(item);
}

function createHistoryItem(url, count) {
  var itemContainer = document.createElement('div');
  var itemContent = document.createElement('div');
  var controlsContainer = document.createElement('div');
  var removeButton = document.createElement('button');
  var openButton = document.createElement('button');
  var text = document.createTextNode('[' + count + '] ' + url);

  itemContainer.className = 'historyItemContainer';
  itemContainer.appendChild(itemContent);
  itemContainer.appendChild(controlsContainer);

  itemContent.className = 'historyItemContent';
  itemContent.appendChild(text);

  removeButton.innerHTML = 'remove';
  removeButton.addEventListener('click', ()=>{removeHistoryItem(url)});

  openButton.innerHTML = 'open';
  openButton.addEventListener('click', ()=>{openHistoryItem(url)});

  controlsContainer.className = "historyItemControls"
  controlsContainer.appendChild(removeButton);
  controlsContainer.appendChild(openButton);

  return itemContainer;
}

function displayHistory() {
  var display = document.querySelector('#historyDisplay');
  display.innerHTML = '';
  var history = _getExtension().history;
  Object.keys(history).forEach((key) => {
    var historyItem = createHistoryItem(key, history[key]);
    display.appendChild(historyItem);
  });
}

function _setupOptionControl(option) {
  var control = document.querySelector('#' + option);
  var extension = _getExtension();
  control.checked = extension[option];
  control.addEventListener('click', (e) => {
      extension[option] = e.target.checked;
    });
}

document.addEventListener('DOMContentLoaded', function() {
  _setupOptionControl('allowAll');
  _setupOptionControl('allowBlankTabs');
  _setupOptionControl('allowHistory');

  document.querySelector('#clearHistoryButton')
    .addEventListener('click', clearHistory);
  displayHistory();

  document.querySelector('#sourceLink')
    .addEventListener('click', (e) => {
      openHistoryItem(e.target.href);
      e.preventDefault();
    });
});
