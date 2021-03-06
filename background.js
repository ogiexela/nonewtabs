let client

try {
  client = browser
} catch (e) {
  try {
      client = chrome
  } catch (f) {
      client = null
  }
}

class Utils {
  updateBadgeText(text) {
    client.browserAction.setBadgeText({text: '' + text})
  }

  closeTab(id) {
    client.tabs.remove(id)
  }

  createTab(url) {
    client.tabs.create({url: url})
  }

  parseBool(str) {
    if(!str) {
      return false
    }

    if(!isNaN(str)) {
      if(Number(str).valueOf() === 0) {
        return false
      }
      return true
    }

    if(typeof str === 'string') {
      if(str === '') {
        return false
      }
      if(str.toLowerCase() === 'false') {
        return false
      }
      return true
    }
  }

}

class NoNewTabsExtension {

  constructor (windowId) {
    this.originalWindowId = windowId
    this._utils = new Utils()
    this._allowAll = this._utils.parseBool(localStorage.getItem('allowAll') || false)
    this._allowBlankTabs = this._utils.parseBool(localStorage.getItem('allowBlankTabs') || false)
    this._allowHistory = this._utils.parseBool(localStorage.getItem('allowHistory') || true)
    this._history = new TabsHistory()
    this._tabToBeOpened = -1
  }

  get utils () {
    return this._utils
  }
  get allowAll () {
    return this._allowAll
  }

  set allowAll (allow) {
      this._allowAll = allow
      localStorage.setItem('allowAll', allow)
  }

  get allowBlankTabs () {
    return this._allowBlankTabs
  }

  set allowBlankTabs (allow) {
    this._allowBlankTabs = allow
    localStorage.setItem('allowBlankTabs', allow)
  }

  get allowHistory () {
    return this._allowHistory
  }

  set allowHistory (allow) {
    this._allowHistory = allow
    localStorage.setItem('allowHistory', allow)
  }

  get history () {
    return this._history.history
  }

  openNewTab (url) {
    this._tabToBeOpened = url
    this._utils.createTab(url)
  }

  clearHistory () {
    this._history.clear()
    this._utils.updateBadgeText(this._history.totalCount)
  }

  removeFromHistory (url) {
    this._history.removeFromHistory(url)
    this._utils.updateBadgeText(this._history.totalCount)
  }

  processTab(tab) {
    if (this._tabToBeOpened == tab.url){
      this._tabToBeOpened = -1
      return
    }

    if (tab.index === 0 && tab.windowId === this.originalWindowId) {
      return
    }

    if (this._allowBlankTabs) {
      switch(tab.url) {
        case 'chrome://newtab/':
        case 'about:blank':
            return
      }
    }

    if (this._allowHistory) {
      this._history.addToHistory(tab.url)
    }

    this._utils.updateBadgeText(this._history.totalCount)
    this._utils.closeTab(tab.id)
  }
}

class TabsHistory {
  constructor() {
    this._history = []
    this._totalCount = 0
    this._incrementCount = (by) => {
      this._totalCount += by
    }
    this._decrementCount = (by) => {
      this._totalCount -= by
    }
  }

  get totalCount () {
    return this._totalCount
  }

  get history () {
    return this._history
  }

  clear () {
    this._history = []
    this._totalCount = 0
  }

  addToHistory(url) {
    const previousCount = this._history[url] || 0
    this._history[url] = previousCount + 1
    this._incrementCount(1)
  }

  removeFromHistory(url) {
    const count = this._history[url] || 0
    this._decrementCount(count)
    delete this._history[url]
  }
}

function menuItemClicked(e) {
  var url = e.linkUrl || e.srcUrl || e.pageUrl
  _noNewTabsExtension.openNewTab(url)
}

function createNewExtension(window) {
  _noNewTabsExtension = new NoNewTabsExtension(window.id)
  client.tabs.onCreated.addListener(function(tab) {
    if(_noNewTabsExtension.allowAll) {
      return
    }
    if(!tab.url) {
        client.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
        if(tabId == tab.id && changeInfo.url) {
          _noNewTabsExtension.processTab(updatedTab)
        }
      })
    }  else {
      _noNewTabsExtension.processTab(tab)
    }
  })
  try {
    client.contextMenus.create({'title': 'Open New Tab', 'id': 'open-new-tab', contexts: ['all']})
  } catch (e) {
    console.log("ERROR CREATING CONTEXT MENU: " + e)
  }
  
  client.contextMenus.onClicked.addListener(function(info, tab) {
      if (info.menuItemId === 'open-new-tab') {
          menuItemClicked(info)
      }
  })
}

var _noNewTabsExtension

client
.windows
.getCurrent({populate: true}, createNewExtension)
