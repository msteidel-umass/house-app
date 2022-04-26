// Define function to create a range slider input for user to select start/end dates
function dualSliderInput(div, min, max, changeYears) {
    // Create single dual-input range slider composed w/two standard sliders
    var s1 = document.createElement("input");
    var s2 = document.createElement("input");
    s1.classList.add("range_slider");
    s2.classList.add("range_slider");
    s1.name = "s1";
    s2.name = "s2";
    s1.type = s2.type = "range"
    s1.min = s2.min = min;
    s1.max = s2.max = max;
    s1.step = s2.step = 1;
    // Create text display divs to append their input text to
    var t1 = document.createElement("div");
    var t2 = document.createElement("div");
    t1.classList.add("text_box");
    t2.classList.add("text_box");
    t1.id = "t1";
    t2.id = "t2";
    // Add functionality to sliders
    s1.onmouseup = function () { changeYears(s1.value, s2.value) };
    s2.onmouseup = function () { changeYears(s1.value, s2.value) };
    // Append everything to the parent (#control_overlay) div in the correct ordering
    document.getElementById(div).appendChild(t1);
    document.getElementById(div).appendChild(s2);
    document.getElementById(div).appendChild(s1);
    document.getElementById(div).appendChild(t2);
    return [s1, s2, t1, t2];
}

// Additional slider control logic--
// Resets slider knob positions during a page toggle and
// ensures both sliders control togeather to simulate a single dual slider 
function controlSlider(start = null, end = null) {
    var s1 = document.getElementsByName("s1")[0];
    var s2 = document.getElementsByName("s2")[0];
    // If arguments were provided, overide controls and set sliders to arguments
    if (start != null && end != null) {
        s1.value = start;
        s2.value = end;
    }
    // Else control using dual-slider control logic
    else if (s2.value > s1.value) {
        s1.style.display = "initial";
        s2.style.display = "initial";
    }
    else if (this == s2 && s2.value < s1.value) {
        s1.value = s2.value;
        s1.style.display = "none";
    }
    else if (this == s1 && s1.value > s2.value) {
        s2.value = s1.value;
        s2.style.display = "none";
    }
    // update the slider's text box  divs to display the selected input (years)
    updateTextBox(s1.value, s2.value)
}

// Updates the date slider's text boxes with their respective input values 
function updateTextBox(value1, value2) {
    let textBox1 = document.getElementById("t1");
    let textBox2 = document.getElementById("t2");
    textBox1.innerHTML = value1;
    textBox2.innerHTML = value2;
}

// Passes slider values as arguments to slider controlSlider func
// to force-reset it with new values
function setSliderDates(start, end) {
    controlSlider(start, end)
}


