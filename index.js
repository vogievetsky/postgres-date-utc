'use strict'

var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/
var DATE = /^(\d{1,})-(\d{2})-(\d{2})$/
var TIME_ZONE = /([Z|+\-])(\d{2})?:?(\d{2})?:?(\d{2})?/
var BC = /BC$/

module.exports = function parseDate (isoDate) {
  var matches = DATE_TIME.exec(isoDate)

  if (!matches) {
    // Force YYYY-MM-DD dates to be parsed as local time
    return DATE.test(isoDate) ?
      new Date(isoDate + 'T00:00:00Z') :
      null
  }

  var isBC = BC.test(isoDate)
  var year = parseInt(matches[1], 10)
  var isFirstCentury = year > 0 && year < 100
  year = (isBC ? '-' : '') + year

  var month = parseInt(matches[2], 10) - 1
  var day = matches[3]
  var hour = parseInt(matches[4], 10)
  var minute = parseInt(matches[5], 10)
  var second = parseInt(matches[6], 10)

  var ms = matches[7]
  ms = ms ? 1000 * parseFloat(ms) : 0

  var date
  var offset = timeZoneOffset(isoDate)
  if (offset != null) {
    var utc = Date.UTC(year, month, day, hour, minute, second, ms)
    date = new Date(utc - offset)
  } else {
    date = new Date(Date.UTC(year, month, day, hour, minute, second, ms))
  }

  if (isFirstCentury) {
    date.setUTCFullYear(year)
  }

  return date
}

// match timezones:
// Z (UTC)
// -05
// +06:30
var types = ['Z', '+', '-']
function timeZoneOffset (isoDate) {
  var zone = TIME_ZONE.exec(isoDate.split(' ')[1])
  if (!zone) return
  var type = zone[1]

  if (!~types.indexOf(type)) {
    throw new Error('Unidentified time zone part: ' + type)
  }
  if (type === 'Z') {
    return 0
  }
  var sign = type === '-' ? -1 : 1
  var offset = parseInt(zone[2], 10) * 3600 +
    parseInt(zone[3] || 0, 10) * 60 +
    parseInt(zone[4] || 0, 10)

  return offset * sign * 1000
}
