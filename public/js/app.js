"use strict";

function zeropad(val, n) {
    let str = ""+val;
    while (str.length < n) str = "0" + str;
    return str;
}

function fmtDate(year, month, day) {
    return zeropad(year,4) + zeropad(month+1,2) + zeropad(day,2);
}

// https://stackoverflow.com/a/1184359
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function dayOfWeek(month, year, day) {
    let d = new Date();
    d.setDate(day);
    d.setMonth(month);
    d.setYear(year);
    return d.getDay();
}

// https://www.w3docs.com/snippets/javascript/how-to-create-a-new-dom-element-from-html-string.html
function htmlToElem(html) {
    let temp = document.createElement('template');
    html = html.trim(); // Never return a space text node as a result
    temp.innerHTML = html;
    return temp.content.firstChild;
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
        datesInput.createInput();
    };
    datesInput.createInput = function() {
        // delete existing divs
        if (datesInput.navDiv1) {
            container.removeChild(datesInput.navDiv1);
            container.removeChild(datesInput.daysDiv);
            container.removeChild(datesInput.navDiv2);
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
            monthName.textContent = d.toLocaleString("default", {month:"long", year:"numeric"});

            navDiv.appendChild(minusYear);
            navDiv.appendChild(minusMonth);
            navDiv.appendChild(monthName);
            navDiv.appendChild(plusMonth);
            navDiv.appendChild(plusYear);

            return navDiv;
        }

        // create top & bottom navdivs
        datesInput.navDiv1 = navDiv();
        datesInput.navDiv2 = navDiv();

        // create table with td for each day
        datesInput.daysDiv = document.createElement('div');
        let table = document.createElement('table');
        table.classList.add('date-table');
        table.appendChild(htmlToElem("<tr><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>"));
        let row = document.createElement('tr');
        let weekday = dayOfWeek(datesInput.month, datesInput.year, 1);
        let td = document.createElement('td');
        td.colSpan = weekday-1;
        row.appendChild(td);
        for (let day = 1; day <= daysInMonth(datesInput.month, datesInput.year); day++) {
            let td = document.createElement('td');
            td.onclick = function() { datesInput.toggleDay(day) };
            td.textContent = day;
            let date = fmtDate(datesInput.year, datesInput.month, day);
            td.classList.add('date-input');
            if (datesInput.selected[date]) {
                td.classList.add('date-selected');
            } else {
                td.classList.add('date-unselected');
            }
            row.appendChild(td);
            if (weekday++%7 == 0) {
                table.appendChild(row);
                row = document.createElement('tr');
            }
        }
        table.appendChild(row);
        datesInput.daysDiv.appendChild(table);

        // add divs to the container
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
