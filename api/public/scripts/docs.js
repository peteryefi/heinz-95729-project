/* global jQuery, ko, window, document, history */
(function ($, ko, window, document, history) {
  'use strict'

  var docsVm = {
    NavVm: undefined,
    activeVm: undefined,
    init: undefined
  }
  var NavVm
  var MenuItemVm
  var makeNavVm
  var Language
  var toggleLanguage
  var toggleLanguageByUri
  var bootstrapperizeIt
  var init

  NavVm = function (nav) {
    const self = this
    var languages = []

    nav = Object.assign({}, nav)

    self.title = nav.title
    self.logo = nav.logoPath
    self.menuItems = []
    self.languages = []
    self.languageDict = {}
    self.showLanguageMenu = ko.observable(false)

    self.addMenuItem = function (item) {
      self.menuItems.push(new MenuItemVm(item))
    }

    self.addLanguage = function (lang) {
      var language = new Language(lang)
      self.languages.push(language)
      self.languageDict[language.highlightClass] = language
      self.showLanguageMenu(true)
    }

    self.setActiveLanguage = function (lang) {
      for (let i = 0; i < self.languages.length; i += 1) {
        if (self.languages[i].highlightClass === lang) {
          self.languages[i].setStatus(true)
        } else {
          self.languages[i].setStatus(false)
        }
      }
    }

    if (nav && nav.menuItems && nav.menuItems.length) {
      for (let i = 0; i < nav.menuItems.length; i += 1) {
        self.addMenuItem(nav.menuItems[i])
      }
    }

    if (typeof nav.languages === 'string') {
      try {
        languages = JSON.parse(nav.languages.replace(/&quot;/g, '"'))
      } catch (e) {
        // ignore
      }
    } else if (Array.isArray(nav.languages)) {
      languages = nav.languages
    }

    if (Array.isArray(languages)) {
      for (let i = 0; i < languages.length; i += 1) {
        self.addLanguage(languages[i])
      }
    }
  }

  MenuItemVm = function (item) {
    var self = this

    self.name = item.name || 'Resource'
    self.link = item.link || '#'
  }

  // { "name": "All", "highlightClass": "language-any" },
  // { "name": "Shell", "highlightClass": "language-bash" },
  // { "name": "JavaScript", "highlightClass": "language-js" }
  Language = function (lang) {
    var self = this

    self.name = lang.name
    self.highlightClass = lang.highlightClass
    self.link = '/docs/' + self.highlightClass
    self.css = ko.observable()
    self.click = function () {
      var link = self.link

      if (window.location.hash) {
        link += window.location.hash
      }

      history.pushState({ uri: link }, document.title, link)
      toggleLanguage(self.highlightClass)
      // docsVm.activeVm.setActiveLanguage(self.highlightClass);
    }

    self.setStatus = function (isActive) {
      if (isActive) {
        self.css('active')
      } else {
        self.css('')
      }
    }

    self.setStatus(lang.isActive)
  }

  makeNavVm = function (options) {
    var vm = new NavVm(options)

    $('h1').each(function (i, e) {
      var $this = $(e)

      if ($this.parent()[0].tagName !== 'BLOCKQUOTE') {
        vm.addMenuItem({
          name: $this.text(),
          link: '#' + e.id
        })
      }
    })

    return vm
  }

  toggleLanguage = function (lang) {
    var activeVm = docsVm.activeVm
    var getHandles, hideAllLangBlocks, showLangBlocks

    getHandles = function (langs) {
      var langHandles = []

      for (let i = 0; i < langs.length; i += 1) {
        langHandles.push(langs[i].highlightClass)
      }

      return langHandles
    }

    hideAllLangBlocks = function (langDict) {
      var pres, pre, block, i

      pres = document.querySelectorAll('pre')

      for (i = 0; i < pres.length; i += 1) {
        pre = pres[i]
        block = $(pre).children('[class^="lang"]')[0]

        if (block && langDict[block.className]) {
          // if the code block was processed by highlight.js
          // and the className is in our language dictionary
          // (which also implies it't not already "out")
          // (we only want to take action on the languages that
          // users can choose from, otherwise we'll hide things they
          // have not way of recovering)
          // hide it
          $(pre).addClass('out')
        }
      }
    }

    showLangBlocks = function (langHandles, lang) {
      var pre, blocks, i, j

      for (i = 0; i < langHandles.length; i += 1) {
        blocks = document.querySelectorAll('.' + langHandles[i])

        for (j = 0; j < blocks.length; j += 1) {
          pre = $(blocks[j]).parent('pre')

          if (lang === 'lang-all' || lang === langHandles[i]) {
            pre.removeClass('out')
          }
        }
      }
    }

    activeVm.setActiveLanguage(lang)
    hideAllLangBlocks(activeVm.languageDict)
    showLangBlocks(getHandles(activeVm.languages), lang)
  }

  toggleLanguageByUri = function () {
    var path = window.location.pathname

    if (path.indexOf('lang') > -1) {
      toggleLanguage(path.split('/').pop())
    }
  }

  bootstrapperizeIt = function (options) {
    $('table').addClass('table').addClass('table-striped').addClass('table-bordered')

    if (options.useHeadingAlerts !== false) {
      $('h4').addClass('alert').addClass('alert-info')
      $('h5').addClass('alert').addClass('alert-danger')
    }
  }

  init = function (options) {
    var vm = makeNavVm(options)
    options = options || {}

    docsVm.activeVm = vm
    toggleLanguageByUri()

    ko.applyBindings(vm, $('nav')[0])

    bootstrapperizeIt(options)
  }

  docsVm.NavVm = NavVm
  docsVm.init = init

  window.docsVm = docsVm
}(jQuery, ko, window, document, history))
