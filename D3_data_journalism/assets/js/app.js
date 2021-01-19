// ----------------------------------------------- //
// Create the SVG container
var svgWidth = 960;
var svgHeight = 500;

// Set up the margins
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
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
var chosenXAxis = "in_poverty"
var chosenYAxis = "lacks_healthcare"

// ----------------------------------------------- //
// Create function to update x-scale and y scale vars upon click on axis labels
function xScale(journData, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(journData, d => d[chosenXAxis]) * 0.8,
            d3.max(journData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0,width]);
    return xLinearScale;
}

function yScale(journData, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(journData, d => d[chosenYAxis]),
            d3.max(journData, d => d[chosenYAxis])
        ])
        .range([height, 0]);
    return yLinearScale;
}

// ----------------------------------------------- //
// Create function to update xAxis and yAxis upon click on axis labels
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newXScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// ----------------------------------------------- //
// Create function to update circle group with transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))
    return circlesGroup;    
}

// ----------------------------------------------- //
// Create function to update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel;
    var yLabel;

    if (chosenXAxis === "in_poverty") {
        xLabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age (Median)";
    }
    else {
        xLabel = 'Household Income (Median)'
    }

    if (chosenYAxis === "lacks_healthcare") {
        yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "smokers") {
        yLabel = "Smokers (%)";
    }
    else {
        yLabel = 'Obese (%)'
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // On mouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
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
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
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
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("opacity", ".5")
        .classed("stateCircle", true);
    
        


})
