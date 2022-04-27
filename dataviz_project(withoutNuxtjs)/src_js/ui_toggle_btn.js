

// Define function to create toggle map btns
function createToggleBtn(parentDiv, divControlled, btnText, toggleFunc) {
    var btn = document.createElement("button");
    btn.classList.add("toggle_btn");
    btn.innerText = btnText;
    btn.value = divControlled;
    btn.onclick = function () { toggleFunc(divControlled) };
    document.getElementById(parentDiv).appendChild(btn);
    return btn;
}

// Define toggle map functionality--used to change the 'active' map div/SVG that's displayed
function toggleMap(divName) {
    if (divName == MAP_DIVS[0].id && activeMap != MAP_DIVS[0].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "initial";
        document.getElementById(MAP_DIVS[1].id).style.display = "none";
        document.getElementById(MAP_DIVS[2].id).style.display = "none";
        activeMap = MAP_DIVS[0].id;
        setSliderDates(valueStartYear, valueEndYear);
    }
    else if (divName == MAP_DIVS[1].id && activeMap != MAP_DIVS[1].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "none";
        document.getElementById(MAP_DIVS[1].id).style.display = "initial";
        document.getElementById(MAP_DIVS[2].id).style.display = "none";
        activeMap = MAP_DIVS[1].id;
        setSliderDates(incomeStartYear, incomeEndYear);
    }
    else if (divName == MAP_DIVS[2].id && activeMap != MAP_DIVS[2].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "none";
        document.getElementById(MAP_DIVS[1].id).style.display = "none";
        document.getElementById(MAP_DIVS[2].id).style.display = "initial";
        activeMap = MAP_DIVS[2].id;
        setSliderDates(combinedStartYear, combinedEndYear);
    }
    // Function call to switch the styling of active toggle button
    styleActiveToggleBtn();
    updateLegend();
}

// Change the styling of toggle buttons, depending on active/inactive status
function styleActiveToggleBtn() {
    var btns = Array.from(document.getElementsByClassName("toggle_btn"));
    btns.forEach(b => {
        if (b.value == activeMap) {
            b.style.backgroundColor = "steelblue";
            b.style.borderColor = "steelblue";
        }
        else {
            b.style.backgroundColor = "cornflowerblue";
            b.style.borderColor = "cornflowerblue";
        }
    });
}

// Update legend content after toggle for each "map" page 
function updateLegend() {
    var title = "";
    var attr1 = "";
    var attr2 = "";
    if (activeMap == MAP_DIVS[0].id) {
        title = "% Change in Median Home Values";
        attr1 = "Home Value Decrease";
        attr2 = "Home Value Increase";
    }
    else if (activeMap == MAP_DIVS[1].id) {
        title = "% Change in Median Income";
        attr1 = "Income Increase";
        attr2 = "Income Decrease";
    }
    else if (activeMap == MAP_DIVS[2].id) {
        title = "% Market Inflation";
        attr1 = "Market Over-valued";
        attr2 = "Market Under-valued";
    }

    document.getElementById("legend").innerHTML =
        "<p id=\"title\">Legend:</p>" +
        "<p id=\"a1\">" + attr1 + "</p>" +
        "<p id=\"a2\">" + attr2 + "</p>"
}