"use strict";

function zeropad(val, n) {
    let str = ""+val;
    while (str.length < n) str = "0" + str;
    return str;
}

function fmtDate(year, month, day) {
    return zeropad(year,4) + zeropad(month+1,2) + zeropad(day,2);
}

function makeDatesInput(container) {
    let now = new Date();

    let datesInput = {
        selected: {},
        container: container,
        year: now.getFullYear(),
        month: now.getMonth(), // 0 = jan
    };

    datesInput.stepMonths = function(n) {
        datesInput.month += n;
        while (datesInput.month > 11) {
            datesInput.month -= 12;
            datesInput.year++;
        }
        while (datesInput.month < 0) {
            datesInput.month += 12;
            datesInput.year--;
        }
        datesInput.createInput();
    };
    datesInput.toggleDay = function(day) {
        let date = fmtDate(datesInput.year, datesInput.month, day);
        if (datesInput.selected[date]) {
            delete datesInput.selected[date];
        } else {
            datesInput.selected[date] = true;
        }
        datesInput.onChange();
    };
    datesInput.onChange = function() {
        let dates = [];
        for (let date in datesInput.selected) {
            if (datesInput.selected[date]) dates.push(date);
        }
        datesInput.inputField.value = dates.sort().join(',');
    };
    datesInput.createInput = function() {
        if (datesInput.navDiv1) {
            container.removeChild(datesInput.navDiv1);
            container.removeChild(datesInput.daysDiv);
            container.removeChild(datesInput.navDiv2);
        }

        // https://stackoverflow.com/a/1184359
        function daysInMonth (month, year) {
            return new Date(year, month, 0).getDate();
        }

        function navDiv() {
            let navDiv = document.createElement('div');

            let minusYear = document.createElement('button');
            let minusMonth = document.createElement('button');
            let plusMonth = document.createElement('button');
            let plusYear = document.createElement('button');

            minusYear.textContent = "<<";
            minusYear.onclick = function() { datesInput.stepMonths(-12) };
            minusMonth.textContent = "<";
            minusMonth.onclick = function() { datesInput.stepMonths(-1) };
            plusMonth.textContent = ">";
            plusMonth.onclick = function() { datesInput.stepMonths(+1) };
            plusYear.textContent = ">>";
            plusYear.onclick = function() { datesInput.stepMonths(+12) };

            let monthName = document.createElement('span');
            let d = new Date();
            d.setDate(1);
            d.setMonth(datesInput.month);
            d.setYear(datesInput.year);
            monthName.textContent = datesInput.month + " " + d.toLocaleString("default", {month:"long", year:"numeric"});

            navDiv.appendChild(minusYear);
            navDiv.appendChild(minusMonth);
            navDiv.appendChild(monthName);
            navDiv.appendChild(plusMonth);
            navDiv.appendChild(plusYear);

            return navDiv;
        }

        datesInput.navDiv1 = navDiv();
        datesInput.navDiv2 = navDiv();

        datesInput.daysDiv = document.createElement('div');
        for (let i = 1; i <= daysInMonth(datesInput.month, datesInput.year); i++) {
            let span = document.createElement('span');
            span.onclick = function() { datesInput.toggleDay(i) };
            span.textContent = i;
            datesInput.daysDiv.appendChild(span);
        }

        datesInput.container.appendChild(datesInput.navDiv1);
        datesInput.container.appendChild(datesInput.daysDiv);
        datesInput.container.appendChild(datesInput.navDiv2);
    };

    datesInput.inputField = document.createElement('input');
    datesInput.inputField.type = "hidden";
    datesInput.inputField.name = "dates";
    datesInput.inputField.value = "";

    container.appendChild(datesInput.inputField);
    datesInput.createInput();
}

function makeDatesInputs() {
    document.querySelectorAll('.dates-input').forEach(div => makeDatesInput(div));
}

makeDatesInputs();
