/*
 * daycount.js v0.1.6
 * http://yellowseed.org/daycount.js/
 *
 * Copyright 2011, Joshua Tacoma
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

// All other globals defined here are kept in this object:
var daycount = ( typeof exports !== 'undefined' && exports !== null ) ? exports : {};

// The 'moment' type, which may include associated information from any
// calendar system:
daycount.moment = (function() {

  // 'moment' constructor:
  function moment(arg) {
    this.set(arg);
  };

  moment.prototype.set = function(arg) {
    if(!arg || arg === null)
      arg = new Date();

    // Now, we're going to calculate as many counts as possible...

    // 'todo' lists counts to be calculated:
    var todo = []
    for(var name in daycount.counts)
    {
      todo.push(name);
      // wipe out any counts lingering from previous calculations:
      if(name in this)
        delete this[name];
    }

    // 'done' lists known counts:
    var done = [arg.constructor.name];
    // TODO: make sure that no item in 'done' is also in 'todo'.

    if (!(arg.constructor.name in daycount.counts))
      this.isUnknown = true;

    // Store argument as the only known property of this:
    this[arg.constructor.name] = arg;

    // Iterate through counts in 'done'.  We're going to add to this list as we
    // go, which makes this for loop a little more interesting:
    for (var indexDone = 0;
         indexDone < done.length && todo.length > 0;
         ++indexDone)
    {
      var nameDone = done[indexDone];
      var builderNameTodo = 'from_' + nameDone;

      // Iterate through counts in 'todo'.  Since we're going to remove
      // them as we go, iterate backwards to keep remaining indices
      // from shifting:
      for (var indexTodo = todo.length - 1; indexTodo >= 0; --indexTodo) {
        var nameTodo = todo[indexTodo];
        var countTodo = daycount.counts[nameTodo];

        if(!countTodo.hasOwnProperty(builderNameTodo)) continue;

        // Found one!  Calculate the value for 'countTodo':
        var builder = countTodo[builderNameTodo];
        var built = builder(this[nameDone]);
        if(built === null) continue;

        this[nameTodo] = built;
        done.push(nameTodo);
        todo.splice(indexTodo, 1)
        if('isUnknown' in this)
          delete this['isUnknown'];
      }
    }
  };

  moment.prototype.plusEarthSolarDays = function(days) {
    if('localJulianDay' in this)
      return new moment(
        new daycount.counts.localJulianDay(
          this.localJulianDay.number + days));
    else
      throw 'this moment has no counts that support the specified increment.';
  };

  moment.prototype.plus = moment.prototype.plusEarthSolarDays;

  return moment;
})();

// A collection of counts i.e. calendar systems.
// Each calendar system should be added to this object.
daycount.counts = {};

daycount.version_ = {
  major: 0,
  minor: 1,
  build: 6,
};

daycount.counts.badi = (function() {

  var epoch_jd = 2394647; // 1844-03-21

  function badi(arg) {
    this.major = parseInt(arg && arg.major);
    this.cycle = parseInt(arg && arg.cycle);
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.isLeapYear = parseInt(arg && arg.isLeapYear);
    var intercalaryStart = 336;
    var intercalaryEnd = 336 + (this.isLeapYear ? 6 : 5);
    this.isIntercalary = intercalaryStart <= this.dayOfYear 
                      && this.dayOfYear < intercalaryEnd;
    this.month = this.isIntercalary ? NaN
      : (this.dayOfYear >= intercalaryEnd) ? 19
      : Math.floor((this.dayOfYear - 1) / 19) + 1;
    this.dayOfMonth = this.isIntercalary ? NaN
      : (this.isLeapYear && this.month == 19)
      ? this.dayOfYear - intercalaryEnd
      : (this.dayOfYear - 1) % 19 + 1;
    //this.dayOfWeek = ?
  };

  badi.prototype.toString = function() {
    return this.major + ':' + this.cycle + ':' + this.year +
      ':' + this.dayOfYear;
  };

  badi.from_gregorian = function(gregorian) {
    var isLeapYear = gregorian.isLeapYear
      ? (gregorian.month < 3 ||
         (gregorian.month == 3 && gregorian.dayOfMonth < 21))
      : new daycount.counts.gregorian(
          { year: gregorian.year + 1, month: 1, dayOfMonth: 1}).isLeapYear;
    var dayOfYear = gregorian.countDaysSince(
        { year: gregorian.year, month: 3, dayOfMonth: 20});
    if (dayOfYear <= 0) dayOfYear += isLeapYear ? 366 : 365;
    var year = gregorian.year - ((dayOfYear > 286) ? 1845 : 1844);
    if (year >= 0) year += 1;
    var major = Math.floor((year - 1) / (19 * 19));
    if (major >= 0) major += 1;
    var cycle = Math.floor((year - 1) / 19);
    if (cycle >= 0) cycle += 1;
    return new daycount.counts.badi({
      major: major,
      cycle: cycle,
      year: year,
      dayOfYear: dayOfYear,
      isLeapYear: isLeapYear,
    });
  };

  badi.pattern = /(\d+):(\d+):(\d+):(\d+)/;

  badi.from_String = function(string) {
    var match = (badi.pattern).exec(string);
    if (!match) return null;
    return new daycount.counts.badi({
      major: parseInt(match[1]),
      cycle: parseInt(match[2]),
      year: parseInt(match[3]),
      dayOfYear: parseInt(match[4]),
    });
  };

  return badi;
})();
// Dates in the Chinese calendar are difficult to calculate without certain
// hard-to-find information.  For now, this algorithm calculates only the year,
// and only for dates when such a simple algorithm is reliable.  For other
// dates, it will determine 'stem' and 'branch' numbers as NaN.
// TODO: Find the necessary information and replace this algorithm with
// something more complete.
daycount.counts.chineseYear = (function() {
  function chineseYear (arg) {
    this.stem = parseInt(arg && arg.stem);
    this.branch = parseInt(arg && arg.branch);
  }
  chineseYear.prototype.toString = function() {
    return (this.stem || '?') + '/' + (this.branch || '?');
  };
  chineseYear.from_gregorian = function(gregorian) {
    if (gregorian.month <= 2)
      return new chineseYear({stem:NaN,branch:NaN});
    var year0 = ((gregorian.year - 2044 % 60) + 60) % 60;
    var stem = (year0 % 10) + 1;
    var branch = (year0 % 12) + 1;
    return new chineseYear({stem:stem,branch:branch});
  };
  return chineseYear;
})();
daycount.counts.dreamspell = (function () {

  function dreamspell (arg) {
    this.month = parseInt(arg && arg.month);
    this.dayOfMonth = parseInt(arg && arg.dayOfMonth);
    this.dayOfYear = isNaN(this.month) ? 0
      : (this.month - 1) * 28 + this.dayOfMonth;
    this.kin = parseInt(arg && arg.kin);
  };

  var reference = {
    gregorian: { year: 2012, month: 12, dayOfMonth: 21 },
    dreamspell: { month: 6, dayOfMonth: 9, kin: 207 },
  };

  function plusDays (dreamspell, days) {
    var dayOfYear = (dreamspell.dayOfYear + 365 + (days % 365)) % 365;
    var month = NaN;
    var dayOfMonth = NaN;
    if (dayOfYear != 0)
    {
      month = Math.ceil(dayOfYear / 28);
      dayOfMonth = dayOfYear - ((month - 1) * 28);
    }
    var kin = isNaN(dreamspell.kin) ? NaN
      : (dreamspell.kin + (days % 260) + 259) % 260 + 1;
    return new daycount.counts.dreamspell({
      month: month,
      dayOfMonth: dayOfMonth,
      kin: kin,
    });
  };

  dreamspell.from_gregorian = function (gregorian) {
    if (reference.dreamspell.constructor !== dreamspell)
      reference.dreamspell = new dreamspell(reference.dreamspell);
    var allDays = gregorian.countDaysSince(reference.gregorian);
    var leapDays = gregorian.countLeapDaysSince(reference.gregorian);
    return plusDays(reference.dreamspell, allDays - leapDays);
  };

  dreamspell.localized = {};

  dreamspell.prototype.monthName = function() {
    return dreamspell.localized.monthNames[this.month - 1];
  };

  dreamspell.prototype.kinToneName = function() {
    return dreamspell.localized.kinToneNames[this.kin % 13];
  };

  dreamspell.prototype.kinSealName = function() {
    return dreamspell.localized.kinSealNames[this.kin % 20];
  };

  dreamspell.prototype.kinColorName = function() {
    return dreamspell.localized.kinColorNames[this.kin % 4];
  };

  dreamspell.prototype.toString = function() {
    return (isNaN(this.month) ? 'x' : this.month)
      + '.' + (isNaN(this.dayOfMonth) ? 'x' : this.dayOfMonth)
      + '.' + (isNaN(this.kin) ? 'x' : this.kin)
  };

  return dreamspell;
})();
daycount.counts.dreamspell.localized.monthNames = [
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic",
  "Resonant", "Galactic", "Solar", "Spectral", "Planetary", "Crystal",
  "Cosmic"
];

daycount.counts.dreamspell.localized.kinToneNames = [
  "Cosmic",
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic",
  "Resonant", "Galactic", "Solar", "Spectral", "Planetary", "Crystal"
];

daycount.counts.dreamspell.localized.kinSealNames = [
  "Sun", "Dragon", "Wind", "Night", "Seed", "Serpent", "World-Bridger",
  "Hand", "Star", "Moon", "Dog", "Monkey", "Human", "Skywalker", "Wizard",
  "Eagle", "Warrior", "Earth", "Mirror", "Storm"
];

daycount.counts.dreamspell.localized.kinColorNames = [
  "Yellow", "Red", "White", "Blue"
];
daycount.counts.gregorian = (function() {

  var dayOfYear = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  for(var i = 1; i < dayOfYear.length; ++i)
    dayOfYear[i] += dayOfYear[i-1];
  var friday = { year: 2012, month: 12, dayOfMonth: 21 };

  function gregorian(arg) {
    this.year = parseInt(arg && arg.year);
    this.month = parseInt(arg && arg.month);
    this.dayOfMonth = parseInt(arg && arg.dayOfMonth);
    this.isLeapYear =
      (!(this.year % 4) && (this.year % 100) || !(this.year % 400)) != 0;
    this.isLeapDay =
      this.isLeapYear && (this.month == 2) && (this.dayOfMonth == 29);
    this.dayOfYear = dayOfYear[this.month - 1]
      + this.dayOfMonth + ((this.isLeapYear && this.month > 2) ? 1 : 0);
    var a = Math.floor((14 - this.month) / 12);
    var y = this.year - a;
    var m = this.month + 12 * a - 2;
    this.dayOfWeek = ((this.dayOfMonth + y + Math.floor(y / 4)
      - Math.floor(y / 100) + Math.floor(y / 400) + Math.floor(31 * m / 12))
      % 7 + 7) % 7 + 1;
  };

  gregorian.prototype.countDaysSince = function (other) {
    var other = (other.constructor === gregorian)
      ? other : new gregorian(other);
    var leaps = new gregorian(
      { year: other.year, month: 1, dayOfMonth: 1 })
      .countLeapDaysSince(new gregorian(
        { year: this.year, month: 1, dayOfMonth: 1 }));
    return (this.year - other.year) * 365
      + this.dayOfYear - other.dayOfYear
      - leaps;
  };

  gregorian.prototype.countLeapDaysSince = function(other) {
    other = (other.constructor === gregorian)
      ? other : new gregorian(other);
    other_leaps = Math.floor(other.year / 4) - Math.floor(other.year / 100)
      + Math.floor(other.year / 400);
    if (other.isLeapYear && other.month <= 2)
      other_leaps -= 1;
    this_leaps = Math.floor(this.year / 4) - Math.floor(this.year / 100)
      + Math.floor(this.year / 400);
    if (this.isLeapYear && this.month <= 2)
      this_leaps -= 1;
    return this_leaps - other_leaps;
  }

  gregorian.localized = {};

  gregorian.prototype.dayOfWeekName = function() {
    return gregorian.localized.dayOfWeekNames[this.dayOfWeek-1];
  };

  gregorian.prototype.monthName = function() {
    return gregorian.localized.monthNames[this.month-1];
  };

  gregorian.prototype.toString = function() {
    return this.year + '-'
      + (this.month >= 10 ? this.month : '0' + this.month) + '-'
      + (this.dayOfMonth >= 10 ? this.dayOfMonth : '0' + this.dayOfMonth);
  };

  // Class methods:

  gregorian.from_Date = function (system) {
    return new daycount.counts.gregorian({
      year: system.getFullYear(),
      month: system.getMonth() + 1,
      dayOfMonth: system.getDate(),
    });
  };

  gregorian.from_localJulianDay = function (localJulianDay) {
    // See Wikipedia's Julian_day#Gregorian_calendar_from_Julian_day_number
    var J = localJulianDay.number + 0.5;
    var j = J + 32044;
    var g = Math.floor(j / 146097);
    var dg = Math.floor(j) % 146097;
    var c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4);
    var dc = dg - c * 36524;
    var b = Math.floor(dc / 1461);
    var db = dc % 1461;
    var a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4);
    var da = db - a * 365;
    var y = g * 400 + c * 100 + b * 4 + a;
    var m = Math.floor((Math.floor(da * 5) + 308) / 153) - 2;
    var d = da - Math.floor((m + 4) * 153 / 5) + 122;
    var Y = y - 4800 + Math.floor((m + 2) / 12);
    var M = (m + 2) % 12 + 1;
    var D = d + 1;
    return new daycount.counts.gregorian({
      year: Y, month: M, dayOfMonth: D,
    });
  };

  gregorian.from_String = function (string) {
    var match = (/(-?\d+)-(\d\d)-(\d\d)/).exec(string);
    if (!match) return null;
    var month = match[2][0] == '0' ? match[2][1] : match[2];
    var dayOfMonth = match[3][0] == '0' ? match[3][1] : match[3];
    return new daycount.counts.gregorian({
      year: parseInt(match[1]),
      month: parseInt(month),
      dayOfMonth: parseInt(dayOfMonth),
    });
  };

  return gregorian;
})();
daycount.counts.gregorian.localized.dayOfWeekNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday"
];

daycount.counts.gregorian.localized.monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];
daycount.counts.julianDay = (function() {

  function julianDay(arg) {
    if(typeof(arg) == 'object') arg = arg.number;
    this.number = parseInt(arg);
  };

  julianDay.prototype.toString = function() {
    return this.number.toString();
  };

  julianDay.from_Date = function(system) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((13 - system.getUTCMonth()) / 12);
    var y = system.getUTCFullYear() + 4800 - a;
    var m = system.getUTCMonth() + (12 * a) - 2;
    var number = system.getUTCDate() + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.julianDay({
      number: number,
    });
  };

  return julianDay;
})();
daycount.counts.localJulianDay = (function() {

  function localJulianDay(arg) {
    if(typeof(arg) == 'object') arg = parseInt(arg && arg.number);
    this.number = parseInt(arg);
  };

  localJulianDay.prototype.plus = function(days) {
    return new daycount.counts.localJulianDay(this.number + days);
  };

  localJulianDay.prototype.toString = function() {
    return this.number.toString();
  };

  // Conversions.  Local Julian Day is the most normalized count, being just
  // one integer to uniquely represent any day.  So it makes sense to convert
  // between most counts via this one.

  localJulianDay.from_Date = function(system) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((13 - system.getMonth()) / 12);
    var y = system.getFullYear() + 4800 - a;
    var m = system.getMonth() + (12 * a) - 2;
    var number = system.getDate() + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.localJulianDay({
      number: number,
    });
  };

  localJulianDay.from_gregorian = function(gregorian) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((14 - gregorian.month) / 12);
    var y = gregorian.year + 4800 - a;
    var m = gregorian.month + (12 * a) - 3;
    var number = gregorian.dayOfMonth + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.localJulianDay({
      number: number,
    });
  };

  localJulianDay.from_long = function(long) {
    var number = 584283 + long.kin + 20 * long.winal + 360 * long.tun
      + 7200 * long.katun + 144000 * long.baktun;
    return new daycount.counts.localJulianDay(number);
  };

  localJulianDay.from_venus = function(venus) {
    var year0 = venus.year > 0 ? venus.year - 1 : venus.year;
    var offset = year0 * 224
      + Math.floor(year0 / 10) * 7
      + venus.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2453951 + offset);
  };

  localJulianDay.from_mars = function(mars) {
    var offset = (mars.year > 0 ? mars.year - 1 : mars.year) * 687 + mars.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2453690 + offset);
  };

  localJulianDay.from_thoth = function(thoth) {
    var offset = (thoth.year > 0 ? thoth.year - 1 : thoth.year) * 88 + thoth.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2452993 + offset);
  };

  localJulianDay.from_String = function(string) {
    var match = (/[Ll][Jj][Dd]:(\d+)/).exec(string);
    if (!match) return null;
    return new daycount.counts.localJulianDay(parseInt(match[1]));
  };

  return localJulianDay;
})();
daycount.counts.long = (function() {

  var start_jd = 584283;

  function long(arg) {
    this.baktun = parseInt(arg && arg.baktun);
    this.katun = parseInt(arg && arg.katun);
    this.tun = parseInt(arg && arg.tun);
    this.winal = parseInt(arg && arg.winal);
    this.kin = parseInt(arg && arg.kin);
  };

  long.prototype.toString = function() {
    return this.baktun + '.' + this.katun + '.' + this.tun +
      '.' + this.winal + '.' + this.kin;
  };

  long.pattern = /(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)/;

  long.from_localJulianDay = function(localJulianDay) {
    var days = localJulianDay.number - start_jd;
    var kin = days % 20;
    var winal = Math.floor(((days - kin) % 360) / 20);
    var tun = Math.floor(((days - kin - winal * 20) % 7200) / 360);
    var katun = Math.floor(
      ((days - kin - winal * 20 - tun * 360) % 144000) / 7200);
    var baktun = Math.floor(
      ((days - kin - winal * 20 - tun * 360 - katun * 7200) % (20 * 144000))
      / 144000);
    return new daycount.counts.long({
      baktun: baktun,
      katun: katun,
      tun: tun,
      winal: winal,
      kin: kin,
    });
  };

  long.from_String = function(string) {
    var match = (long.pattern).exec(string);
    if (!match) return null;
    return new daycount.counts.long({
      baktun: parseInt(match[1]),
      katun: parseInt(match[2]),
      tun: parseInt(match[3]),
      winal: parseInt(match[4]),
      kin: parseInt(match[5]),
    });
  };

  return long;
})();
daycount.counts.mars = (function() {

  var start_jd = 2453690;

  function mars(arg) {
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.ascent = this.dayOfYear <= 300 ? this.dayOfYear : NaN;
    this.firstfour = 300 < this.dayOfYear && this.dayOfYear <= 340
      ? this.dayOfYear - 300 : NaN;
    this.firstthree = 340 < this.dayOfYear && this.dayOfYear <= 343
      ? this.dayOfYear - 340 : NaN;
    this.one = 343 < this.dayOfYear && this.dayOfYear <= 344
      ? this.dayOfYear - 343 : NaN;
    this.secondthree = 344 < this.dayOfYear && this.dayOfYear <= 347
      ? this.dayOfYear - 344 : NaN;
    this.secondfour = 347 < this.dayOfYear && this.dayOfYear <= 387
      ? this.dayOfYear - 347 : NaN;
    this.descent = 387 < this.dayOfYear ? this.dayOfYear - 387 : NaN;
  };

  mars.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var year0 = Math.floor(fixed / 687);
    var dayOfYear = fixed - (year0 * 687) + 1;
    var year = (year0 >= 0) ? year0 + 1 : year0;
    return new daycount.counts.mars({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  mars.pattern = /[Mm][Cc]:?(-?[1-9]\d*)\/(\d+)/;

  mars.from_String = function(string) {
    var match = mars.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]);
    return new mars({year:year,dayOfYear:dayOfYear});
  };

  mars.prototype.toString = function() {
    return 'MC:' + (this.year || 'x') + '/' + this.dayOfYear +
      ' (' + (this.year || 'x') + ':' +
         (this.ascent ? this.ascent : 'x/' +
          (this.firstfour ? this.firstfour : 'x/' +
           (this.firstthree ? this.firstthree : 'x/' +
            (this.one ? this.one : 'x/' +
             (this.secondthree ? this.secondthree : 'x/' +
              (this.secondfour ? this.secondfour : 'x/' +
               this.descent)))))) + ')';
  }

  return mars;
})();
daycount.counts.thoth = (function() {

  var start_jd = 2452993;

  function thoth(arg) {
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
  };

  thoth.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var year0 = Math.floor(fixed / 88);
    var dayOfYear = fixed - (year0 * 88) + 1;
    var year = (year0 >= 0) ? year0 + 1 : year0;
    return new daycount.counts.thoth({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  thoth.pattern = /[Tt][Cc]:?(-?[1-9]\d*)\/(\d+)/;

  thoth.from_String = function(string) {
    var match = thoth.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]);
    return new thoth({year:year,dayOfYear:dayOfYear});
  };

  thoth.prototype.toString = function() {
    return 'TC:' + this.year + '/' + this.dayOfYear;
  }

  return thoth;
})();
daycount.counts.venus = (function() {

  var start_jd = 2453951;

  function venus(arg) {
    this.year = parseInt(arg && arg.year);
    this.yearOfDecade = (this.year > 0) ? (this.year - 1) % 10 + 1 : this.year % 10 + 11;
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.month = Math.floor((this.dayOfYear - 1) / 28) + 1;
    this.dayOfMonth = (this.dayOfYear - 1) % 28 + 1;
    this.week = (this.year ? Math.floor((this.dayOfYear - 1) / 7) + 1 : NaN);
    this.dayOfWeek = (this.dayOfYear - 1) % 7 + 1;
  };

  venus.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var decade0 = Math.floor(fixed / 2247);
    var dayOfDecade = fixed - (decade0 * 2247);
    var yearOfDecade = Math.floor(dayOfDecade / 224) + 1;
    var dayOfYear = dayOfDecade % 224 + 1;
    if (yearOfDecade == 11) { yearOfDecade -= 1; dayOfYear += 224; }
    var year = decade0 * 10 + yearOfDecade - 1;
    if (year >= 0) year += 1;
    return new daycount.counts.venus({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  venus.pattern = /[Vv][Cc]:?(-?[1-9]\d*)\/(\d+)(\+[1-7])?/;

  venus.from_String = function(string) {
    var match = venus.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]) + (match[3] ? parseInt(match[3]) : 0);
    return new venus({year:year,dayOfYear:dayOfYear});
  };

  venus.prototype.toString = function() {
    return 'VC:' + (this.year || 'x') + '/'
      + (this.dayOfYear <= 224 ? this.dayOfYear : '224+' + this.dayOfWeek)
      + ' (' + (this.dayOfYear <= 224
        ? (this.yearOfDecade + ',' + (this.week || 'x') + ',' + this.dayOfWeek)
        : ('\u221E,' + this.dayOfWeek))
      + ')';
  }

  return venus;
})();