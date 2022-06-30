"use strict";

function zeropad(val, n) {
    let str = ""+val;
    while (str.length < n) str = "0" + str;
    return str;
}

function fmtDate(year, month, day) {
    return zeropad(year,4) + zeropad(month+1,2) + zeropad(day,2);
}

// https://stackoverflow.com/a/33928558
// Copies a string to the clipboard. Must be called from within an
// event handler such as click. May return false if it failed, but
// this is not always possible. Browser support for Chrome 43+,
// Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
// Internet Explorer: The clipboard feature may be disabled by
// an administrator. By default a prompt is shown the first
// time the clipboard is used (per session).
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return prompt("Copy to clipboard: Ctrl+C, Enter", text);
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

// https://stackoverflow.com/a/1184359
function daysInMonth(month, year) {
    return new Date(year, month+1, 0).getDate();
}

function dayOfWeek(year, month, day) {
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
            navDiv.classList.add('month-nav');

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
            monthName.classList.add('month-name');
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
        datesInput.daysDiv.classList.add('days-div');
        let table = document.createElement('table');
        table.classList.add('date-table');
        table.appendChild(htmlToElem("<tr><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>"));
        let row = document.createElement('tr');
        console.log("weekday = dayOfWeek(" + datesInput.year + "," + datesInput.month + "," + 1);
        let weekday = dayOfWeek(datesInput.year, datesInput.month, 1);
        console.log(" = " + weekday);
        if (weekday == 0) weekday = 7;
        if (weekday > 1) {
            let td = document.createElement('td');
            td.colSpan = weekday-1;
            row.appendChild(td);
        }
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

    container.innerHTML = '';
    container.appendChild(datesInput.inputField);
    datesInput.createInput();
}

function makeDatesInputs() {
    document.querySelectorAll('.dates-input').forEach(div => makeDatesInput(div));
}

function makeDateSelectors(inputField, submitButton) {
    let dateSelected = {};
    document.querySelectorAll('.date-select').forEach(td => {
        td.onclick = function() {
            if (dateSelected[td.dataset.date]) {
                delete dateSelected[td.dataset.date];
                td.classList.add('date-unselected');
                td.classList.remove('date-selected');
            } else {
                dateSelected[td.dataset.date] = true;
                td.classList.add('date-selected');
                td.classList.remove('date-unselected');
            }

            let dates = [];
            for (let date in dateSelected) {
                if (dateSelected[date]) dates.push(date);
            }
            inputField.value = dates.sort().join(',');

            if (dates.length > 0) {
                submitButton.disabled = false;
            } else {
                submitButton.disabled = true;
            }
        };
    });
}

makeDatesInputs();
