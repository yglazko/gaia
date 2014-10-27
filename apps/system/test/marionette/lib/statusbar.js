/* global module */
/* exported StatusBar */

'use strict';

(function(module) {

  var StatusBar = function(client) {
    this.client = client;
    this.init();
  };

  StatusBar.Icons = [
    'label', 'sms', 'alarm', 'playing', 'headphones', 'bluetoothHeadphones',
    'callForwardings', 'geolocation', 'recording', 'mute', 'usb',
    'systemDownloads', 'emergencyCbNotification', 'nfc',
    'bluetoothTransferring', 'bluetooth', 'tethering', 'networkActivity',
    'connections', 'wifi', 'flightMode', 'battery', 'time'
  ];

  StatusBar.Selector = Object.freeze({
    label: '.sb-icon-label',
    sms: '.sb-icon-sms',
    alarm: '.sb-icon-alarm',
    playing: '.sb-icon-playing',
    headphones: '.sb-icon-headphones',
    bluetoothHeadphones: '.sb-icon-bluetooth-headphones',
    callForwardings: '.sb-icon-call-forwardings',
    geolocation: '.sb-icon-geolocation',
    recording: '.sb-icon-recording',
    mute: '.sb-icon-mute',
    usb: '.sb-icon-usb',
    systemDownloads: '.sb-icon-system-downloads',
    emergencyCbNotification: '.sb-icon-emergency-cb-notification',
    nfc: '.sb-icon-nfc',
    bluetoothTransferring: '.sb-icon-bluetooth-transferring',
    bluetooth: '.sb-icon-bluetooth',
    tethering: '.sb-icon-tethering',
    networkActivity: '.sb-icon-network-activity',
    connections: '.sb-icon-connections',
    wifi: '.sb-icon-wifi',
    flightMode: '.sb-icon-flight-mode',
    battery: '.sb-icon-battery',
    time: '.sb-icon-time',

    statusbar: '#statusbar',
    statusbarMaximizedWrapper: '#statusbar-maximized-wrapper',
    statusbarMinimizedWrapper: '#statusbar-minimized-wrapper'
  });

  StatusBar.prototype = {
    kActiveIndicatorTimeout: null,
    client: null,

    /**
     * Change the delay value in StatusBar.
     * @param {number=} delay The new value for delay in milliseconds.
     */
    changeDelayValue: function(delay) {
      var self = this;
      delay = parseInt(delay, 10);
      delay = !isNaN(delay) ? delay : 100;
      this.client.executeScript(function(delay) {
        self.kActiveIndicatorTimeout =
          window.wrappedJSObject.StatusBar.kActiveIndicatorTimeout;
        window.wrappedJSObject.StatusBar.kActiveIndicatorTimeout = delay;
      }, [delay]);
    },

    /**
     * Restore the delay in StatusBar to its original value.
     */
    restoreDelayValue: function() {
      if (this.kActiveIndicatorTimeout === null) {
        return;
      }

      var self = this;
      this.client.executeScript(function() {
        window.wrappedJSObject.StatusBar.kActiveIndicatorTimeout =
          self.kActiveIndicatorTimeout;
        self.kActiveIndicatorTimeout = null;
      });
    },

    /**
     * Dispatch an event of type `eventType` from window.
     * @param {string} eventType
     */
    dispatchEvent: function(eventType) {
      this.client.executeScript(function(eventType) {
        var evt = new CustomEvent(eventType);
        window.wrappedJSObject.dispatchEvent(evt);
      }, [eventType]);
    },

    /**
     * Dispatch a `mozChromeEvent` of type `eventType` with the detail object
     * `detail` from window.
     * @param {string} eventType
     * @param {Object} detail
     */
    dispatchMozChromeEvent: function(eventType, detail) {
      detail = (detail !== undefined) ? detail : {};
      detail.type = eventType;

      this.client.executeScript(function(detail) {
        var evt = new CustomEvent('mozChromeEvent', {
          detail: detail
        });
        window.wrappedJSObject.dispatchEvent(evt);
      }, [detail]);
    },

    /**
     * Initialize the helpers.
     */
    init: function() {
      var self = this;

      // Status bar icons have the following set of helpers:
      // * statusBar.alarm.icon
      //     return the DOM element
      // * statusBar.alarm.show()
      //     show the icon
      // * statusBar.alarm.hide()
      //     hide it
      // * statusBar.alarm.waitForIconToAppear()
      //     wait until the element appears
      // * statusBar.alarm.waitForIconToDisappear()
      //     wait until it disappears
      StatusBar.Icons.forEach(function(iconName) {
        this[iconName] = {
          get icon() {
            return self.client.findElement(StatusBar.Selector[iconName]);
          },
          show: showIconGenerator(iconName),
          hide: hideIconGenerator(iconName),
          waitForIconToAppear: waitForIconToAppearGenerator(iconName),
          waitForIconToDisappear: waitForIconToDisappearGenerator(iconName)
        };
      }.bind(this));

      // Functions generating helper functions.
      function showIconGenerator(iconName) {
        return function() {
          self.client.executeScript(function(iconName) {
            var win = window.wrappedJSObject;
            var statusBar = win.StatusBar;
            statusBar.icons[iconName].hidden = false;
          }, [iconName]);
        };
      }

      function hideIconGenerator(iconName) {
        return function() {
          self.client.executeScript(function(iconName) {
            var win = window.wrappedJSObject;
            var statusBar = win.StatusBar;
            statusBar.icons[iconName].hidden = true;
          }, [iconName]);
        };
      }

      function waitForIconToAppearGenerator(iconName) {
        return function() {
          var icon = self[iconName].icon;
          self.client.waitFor(function() {
            return icon.displayed();
          });
          return icon;
        };
      }

      function waitForIconToDisappearGenerator(iconName) {
        return function() {
          var icon = self[iconName].icon;
          self.client.waitFor(function() {
            return !icon.displayed();
          });
          return icon;
        };
      }
    }
  };

  module.exports = StatusBar;

})(module);
