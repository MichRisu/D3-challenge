// ----------------------------------------------- //
// Create the SVG container
var svgWidth = 960;
var svgHeight = 500;

// Set up the margins
var margin = {
    top: 50,
    right: 100,
    bottom: 100,
    left: 100
};

// ----------------------------------------------- //
// Create the chart height and width variables
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create the SVG container, append and group
var svg = d3.select("#scatter")
    // .select(".chart"), instead of d3.select("body").select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ----------------------------------------------- //    
// Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

// ----------------------------------------------- //
// Create function to update x-scale and y scale vars upon click on axis labels
function xScale(journData, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(journData, d => d[chosenXAxis]) * 0.8,
            d3.max(journData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);
    return xLinearScale;
}

function yScale(journData, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(journData, d => d[chosenYAxis]) * 0.8,
            d3.max(journData, d => d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// ----------------------------------------------- //
// Create function to update xAxis and yAxis scales
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Create function to update xAxis and yAxis circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]))
      .attr("dy", d => newYScale(d[chosenYAxis]))
  
    return circlesGroup;
}

// Create function to update xAxis and yAxis circles text
function renderXText(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}
function renderYText(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis]))
  
    return circlesGroup;
}

// ----------------------------------------------- //
// Create function to update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age:";
    }
    else if (chosenXAxis === "income") {
        xLabel = "Household Income:"
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "smokers") {
        yLabel = "Smokers:";
    }
    else if (chosenYAxis === "obesity") {
        yLabel = "Obesity:"
    }

    var toolTip = d3.select("body")
        .append("div")
        // .attr("class", "d3-tip");
        .classed("d3-tip", true)
        .style("display", "none")
        console.log("tooltip test")

    d3.selectAll("#circleTooltip")     
        .on("mouseover", function(d) {
        toolTip.style("display", "block")
        toolTip.html(`<strong>${d.state}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`)
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
    })    
        .on("mouseout", function() {
            toolTip.style("display", "none");
        });
    // var toolTip = d3.tip()
    //     .attr("class", "d3-tip")
    //     .offset([80, -60])
    //     .html(function(d) {
    //         return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
    //     });
    
    // circlesGroup.call(toolTip);

    // circlesGroup.on("mouseover", function(data) {
    //     toolTip.show(data);
    // })
    //     // On mouseout event
    //     .on("mouseout", function(data, index) {
    //         toolTip.hide(data);
    //     });
    // return circlesGroup;
}

// Retrieve data from the CSV file and execute the functions
d3.csv("assets/data/data.csv").then(function(journData, err){
    if (err) throw err;
    console.log('state data', journData);

    // Parse data
    journData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Call xLinearScale  and yLinearScalefunction from above the csv import
    var xLinearScale = xScale(journData, chosenXAxis);
    var yLinearScale = yScale(journData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    // Append the initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(journData)
        .enter()
        .append("g")
        .attr("id", "circleTooltip");
    
    var circles = circlesGroup.append("circle")
        
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", ".5")
        .classed("stateCircle", true);

        // console.log('test')
    
    // Append the text inside the circles
    var circlesText = circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
        .classed("stateText", true);
    
    // Create group for x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // the value for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // the value for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // the value for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for the y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${-margin.left}, ${chartHeight / 2}) rotate(-90)`);

    var healthLabel = ylabelsGroup.append("text")
        .attr("y", 5)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("atext", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 30)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("atext", true)
        .classed("inactive", true)
        .text("Smokers (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("y", 55)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("atext", true)
        .classed("inactive", true)
        .text("Obese (%)");

     // Update tooltip function from above the csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
     console.log("update tooltip");

    // Create the x-axis labels even listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // Get the value of the selection
            var value = d3.select(this).attr("value");

            if (value !== chosenXAxis) {

                // Replaces chosenXAxis with value
                chosenXAxis = value;
                console.log(chosenXAxis);

                // Update x scale for new data
                xLinearScale = xScale(journData, chosenXAxis);

                // Update x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles with new values
                circles = renderXCircles(circles, xLinearScale, chosenXAxis);

                // Update circles with new text
                circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);
                
                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                
            }
        });

    // Create the y-axis labels even listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // Get the value of the selection
            var value = d3.select(this).attr("value");

            if (value !== chosenYAxis) {

                // Replaces chosenYAxis with value
                chosenYAxis = value;
                console.log(chosenYAxis);

                // Update y scale for new data
                yLinearScale = yScale(journData, chosenYAxis);

                // Update x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles with new values
                circles = renderYCircles(circles, yLinearScale, chosenYAxis);
                
                // Update circles with new text
                circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);
                
                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                
            }
    });
}).catch(function(error) {
    console.log(error);
});
