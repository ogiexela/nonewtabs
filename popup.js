function _getExtension(callBack) {
  let client
  try {
    client = browser
  } catch (e) {
    try {
      client = chrome
    } catch(f) {
      client = null
    }
  }

  return client.runtime.getBackgroundPage(callBack)
}

function clearHistory() {
   _getExtension(ext => {
       ext._noNewTabsExtension.clearHistory()
       displayHistory()       
   })
}

function removeHistoryItem(item) {
    _getExtension(ext => {
        ext._noNewTabsExtension.removeFromHistory(item)
        displayHistory()
    })
}

function openHistoryItem(item) {
    _getExtension(ext => ext._noNewTabsExtension.openNewTab(item))
}

function createHistoryItem(url, count) {
  var itemContainer = document.createElement('div')
  var itemContent = document.createElement('div')
  var controlsContainer = document.createElement('div')
  var removeButton = document.createElement('button')
  var openButton = document.createElement('button')
  var text = document.createTextNode('[' + count + '] ' + url)

  itemContainer.className = 'historyItemContainer'
  itemContainer.appendChild(itemContent)
  itemContainer.appendChild(controlsContainer)

  itemContent.className = 'historyItemContent'
  itemContent.appendChild(text)

  removeButton.innerHTML = 'remove'
  removeButton.addEventListener('click', ()=>{removeHistoryItem(url)})

  openButton.innerHTML = 'open'
  openButton.addEventListener('click', ()=>{openHistoryItem(url)})

  controlsContainer.className = 'historyItemControls'
  controlsContainer.appendChild(removeButton)
  controlsContainer.appendChild(openButton)

  return itemContainer
}

function displayHistory() {
  var display = document.querySelector('#historyDisplay')
  display.innerHTML = ''
  _getExtension(ext => Object.keys(ext._noNewTabsExtension.history).forEach((key) => {
    var historyItem = createHistoryItem(key, ext._noNewTabsExtension.history[key])
    display.appendChild(historyItem)
  }))
}

function _setupOptionControl(option) {
  var control = document.querySelector('#' + option)
  _getExtension(ext => {
    control.checked = ext._noNewTabsExtension[option]
    control.addEventListener('click', (e) => {
        ext._noNewTabsExtension[option] = e.target.checked
      })
  })
}

document.addEventListener('DOMContentLoaded', function() {
  _setupOptionControl('allowAll')
  _setupOptionControl('allowBlankTabs')
  _setupOptionControl('allowHistory')

  document.querySelector('#clearHistoryButton')
    .addEventListener('click', clearHistory)
  displayHistory()

  document.querySelector('#sourceLink')
    .addEventListener('click', (e) => {
      openHistoryItem(e.target.href)
      e.preventDefault()
    })
})
