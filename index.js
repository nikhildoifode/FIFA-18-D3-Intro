/* 
* Data
*/

var svg = d3.select("svg")
var margin = 200;
var w = svg.attr("width") - margin;
var h = svg.attr("height") - 250;

var graph = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");
var xAxis = graph.append("g")
var yAxis = graph.append("g")

var myData = []
var graphData = []
var yTick = 0
var xField = ""
var xText = ""
var yField = "count"
var yText = "Number of Players"
var myPadding = 0.0
var firstLoad = 0

var currX = 0
var goingDirection = 0
var isDrawing = false
const mySvg = document.getElementById('mySvg')
var min = 4, max = 16, value = 10, step = 6

var xScale = d3.scaleBand()
.range([0, w])
.padding(myPadding);

var xScaleNew = d3.scaleLinear()
.range([0, w])

var yScale = d3.scaleLinear()
.range ([h, 0]);

var myColor = d3.scaleLinear().domain([0, 13])
.range([d3.rgb("steelblue").darker(), d3.rgb("#69b3a2").darker()])
// .range(["skyblue", "limegreen"])

// var myColor = d3.scaleSequential().domain([1,10])
// .interpolator(d3.interpolateViridis);

var selected = document.getElementById("selected");

/* 
* Utility Functions
*/

function xScaleBar45(yVal) {
    xAxis.selectAll("text")
    .attr("y", 15)
    .attr("x", -5)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

    xAxis.select(".xaxis_label")
    .attr("transform", "rotate(0)")
    .attr("y", yVal)
    .attr("x", 350)
}

function yScaleBar() {
    yAxis.append("text")
    .attr("class", "yaxis_label")
    .attr("dy", "-2em")
    .attr("stroke", "dimgrey")
    .attr("font-family", "sans-serif")
    .attr("font-size", "1.1em")
    .attr("font-weight", "lighter")
    .text(yText)
}

function addNewXAxisLabel() {
    xAxis.selectAll('text').remove()

    xAxis.append("text")
    .attr("class", "xaxis_label")
    .attr("y", h - 300)
    .attr("x", w - 300)
    .attr("stroke", "dimgrey")
    .attr("font-size", "1.1em")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "lighter")
    .text(xText);
}

mySvg.addEventListener('mousedown', e => {
    currX = e.clientX;
    if (myPadding === 0.0) isDrawing = true;
    goingDirection = 0;
});

mySvg.addEventListener('mousemove', e => {
    if (isDrawing === true && goingDirection !== 1 && e.clientX < currX) {
        firstLoad++
        goingDirection = 1
        if (value < max) {
            value *= step;
            loadHistoData(value, xField)
            if (xField === "wage_eur" || xField === "value_eur") {
                xScaleBar45(70)
            }
        }
    } else if (isDrawing === true && goingDirection !== 2 && e.clientX > currX) {
        firstLoad++
        goingDirection = 2
        if (value > min) {
            value /= step;
            loadHistoData(value, xField)
        }
    }
});

window.addEventListener('mouseup', e => {
    if (isDrawing === true) {
        currX = 0;
        goingDirection = 0;
        isDrawing = false;
    }
});

function onMouseOver(d) {
    d3.select(this).attr('class', 'highlight');
    d3.select(this)
    .transition()
    .duration(200)
    .attr('width', function() {
        if (myPadding === 0.0) return (xScaleNew(d.x1) - xScaleNew(d.x0) + 5);
        else return xScale.bandwidth() + 5
    })
    .attr("y", function(d) {
        if (myPadding === 0.0) return 90;
        else return yScale(d[yField]) - 10;
    })
    .attr("height", function(d) {
        if (myPadding === 0.0) return h - yScale(d.length) + 10;
        else return h - yScale(d[yField]) + 10;
    })
    // .style("fill", "orange");
    .style("stroke", "black")
    .style("stroke-width", 1);

    let padding = 10
    if (myPadding === 0.2) padding = 50

    graph.append("text")
    .attr('class', 'val')
    .attr('x', function() {
        if (myPadding === 0.0) return xScaleNew(d.x1) - 25;
        else return xScale(d[xField]) + padding;
    })
    .attr('y', function() {
        if (myPadding === 0.0) return yScale(d.length) - 20 
        return yScale(d[yField]) - 20;
    })
    .text(function() {
        if (myPadding === 0.0) return d.length;
        else return d[yField];
    });
    // console.log("chan or1");
}

function onMouseOut(d) {
    d3.select(this).attr('class', 'bar')

    d3.select(this)
    .transition()
    .duration(200)
    .attr('width', function () {
        if (myPadding === 0.0) return xScaleNew(d.x1) - xScaleNew(d.x0)
        return xScale.bandwidth()
    })
    .attr("y", function(d) {
        if (myPadding === 0.0) return 100;
        else return yScale(d[yField]);
    })
    .attr("height", function(d) {
        if (myPadding === 0.0) return h - yScale(d.length);
        return h - yScale(d[yField]);
    })
    // .style("fill", function(_, i) { return myColor(i) });
    .style("stroke", "None")

    d3.selectAll('.val').remove()
}

d3.csv("Top_250_FIFA_18.csv").then(function(data) {
    data.forEach((parsedCSV) => {
        myData.push(parsedCSV)
    });

    valueChange("100")
});

/* 
* Main Functions
*/

// Bar Data Functions

function loadBarData() {
    xScale.domain(graphData.map(function(d) { return d[xField]; })).padding(myPadding);
    addNewXAxisLabel()

    xAxis.transition()
    .duration(500)
    .attr("transform", "translate(0," + h + ")")
    .call(d3.axisBottom(xScale))

    yScale.domain([0, d3.max(graphData, function(d) { return d[yField]; })]);
    yAxis.transition()
    .duration(500)
    .call(d3.axisLeft(yScale).tickFormat( function(d){ return d; }).ticks(yTick))

    d3.selectAll('.xaxis_label').text(xText)
    d3.selectAll('.yaxis_label').text(yText)
    d3.selectAll('rect').remove()

    graph.selectAll(".bar")
    .data(graphData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .style("fill", function(_, i) { return myColor(i); })
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)
    .transition()
    .duration(500)
    .attr("x", function(d) { return xScale(d[xField]); })
    .attr("y", function(d) { return yScale(d[yField]); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return h - yScale(d[yField]); })

}

function loadDataSetForNationalityScore() {
    graphData.length = 0
    graphData = [
        { nationality: "Argentina", count: 0 },
        { nationality: "Belgium", count: 0 },
        { nationality: "Brazil", count: 0 },
        { nationality: "Croatia", count: 0 },
        { nationality: "England", count: 0 },
        { nationality: "France", count: 0 },
        { nationality: "Germany", count: 0 },
        { nationality: "Italy", count: 0 },
        { nationality: "Netherlands", count: 0 },
        { nationality: "Portugal", count: 0 },
        { nationality: "Senegal", count: 0 },
        { nationality: "Spain", count: 0 },
        { nationality: "Other", count: 0}
    ]

    myData.forEach((data) => {
        if (data.nationality === 'Argentina') graphData[0].count++;
        else if (data.nationality === 'Belgium') graphData[1].count++;
        else if (data.nationality === 'Brazil') graphData[2].count++;
        else if (data.nationality === 'Croatia') graphData[3].count++;
        else if (data.nationality === 'England') graphData[4].count++;
        else if (data.nationality === 'France') graphData[5].count++;
        else if (data.nationality === 'Germany') graphData[6].count++;
        else if (data.nationality === 'Italy') graphData[7].count++;
        else if (data.nationality === 'Netherlands') graphData[8].count++;
        else if (data.nationality === 'Portugal') graphData[9].count++;
        else if (data.nationality === 'Senegal') graphData[10].count++;
        else if (data.nationality === 'Spain') graphData[11].count++;
        else graphData[12].count++;
    })
    
    xField = "nationality"
    xText = "Nationality of Players"
    yTick = 10
    myPadding = 0.1
    selected.innerText = "Number of Players by Nationality"
}

function loadDataSetForPositionScore() {
    graphData.length = 0
    graphData = [
        { position: "Forward", count: 0 },
        { position: "Midfield", count: 0 },
        { position: "Defence", count: 0 },
        { position: "Goalkeepr", count: 0 },
    ]

    myData.forEach((data) => {
        let position = data.team_position

        if (position === "GK")
        graphData[3].count++;

        else if (position === "ST" || position === "LS" || position === "LW" || position === "RS" ||
            position === "RW")
            graphData[0].count++;

        else if (position === "CB" || position === "LB" || position === "RB" || position === "LWB" ||
        position === "RWB" || position === "LCB" || position === "RCB")
        graphData[2].count++;

        else graphData[1].count++;
    })

    xField = "position"
    xText = "Player Position on the Field"
    yTick = 5
    myPadding = 0.2
    selected.innerText = "Number of Players by Position on the Field"
}

function loadDataSetForLeagueScore() {
    graphData.length = 0
    graphData = [
        { league: "Chinese Super League", count: 0},
        { league: "English Premier League", count: 0},
        { league: "French Ligue 1", count: 0},
        { league: "German Bundesliga", count: 0},
        { league: "Italian Serie A", count: 0},
        { league: "Portuguese Primeira Liga", count: 0},
        { league: "Russian Premier League", count: 0},
        { league: "Spain Primera Division", count: 0},
        { league: "Turkish Super Lig", count: 0},
        { league: "USA Major League Soccer", count: 0}
    ]

    myData.forEach((data) => {
        if (data.league === 'Chinese Super League') graphData[0].count++;
        else if (data.league === 'English Premier League') graphData[1].count++;
        else if (data.league === 'French Ligue 1') graphData[2].count++;
        else if (data.league === 'German Bundesliga') graphData[3].count++;
        else if (data.league === 'Italian Serie A') graphData[4].count++;
        else if (data.league === 'Portuguese Primeira Liga') graphData[5].count++;
        else if (data.league === 'Russian Premier League') graphData[6].count++;
        else if (data.league === 'Spain Primera Division') graphData[7].count++;
        else if (data.league === 'Turkish Super Lig') graphData[8].count++;
        else if (data.league === 'USA Major League Soccer') graphData[9].count++;
    })

    xField = "league"
    xText = "Leagues of the Player"
    yTick = 10
    myPadding = 0.1
    selected.innerText = "Number of Players by League they play in"
}

function loadDataSetForClubScore() {
    graphData.length = 0
    graphData = [
        { club: "Arsenal", count: 0},
        { club: "Atletico Madrid", count: 0},
        { club: "AS Monaco", count: 0},
        { club: "Borussia Dortmund", count: 0},
        { club: "Chelsea", count: 0},
        { club: "FC Barcelona", count: 0},
        { club: "FC Bayern Munchen", count: 0},
        { club: "Inter", count: 0},
        { club: "Juventus", count: 0},
        { club: "Liverpool", count: 0},
        { club: "Manchester City", count: 0},
        { club: "Manchester United", count: 0},
        { club: "Milan", count: 0},
        { club: "Napoli", count: 0},
        { club: "Paris Saint-Germain", count: 0},
        { club: "Real Madrid", count: 0},
        { club: "Roma", count: 0},
        { club: "Tottenham Hotspur", count: 0},
        // { club: "Other", count: 0}
    ]

    myData.forEach((data) => {
        if (data.club === 'Arsenal') graphData[0].count++;
        else if (data.club === 'Atletico Madrid') graphData[1].count++;
        else if (data.club === 'AS Monaco') graphData[2].count++;
        else if (data.club === 'Borussia Dortmund') graphData[3].count++;
        else if (data.club === 'Chelsea') graphData[4].count++;
        else if (data.club === 'FC Barcelona') graphData[5].count++;
        else if (data.club === 'FC Bayern Munchen') graphData[6].count++;
        else if (data.club === 'Inter') graphData[7].count++;
        else if (data.club === 'Juventus') graphData[8].count++;
        else if (data.club === 'Liverpool') graphData[9].count++;
        else if (data.club === 'Manchester City') graphData[10].count++;
        else if (data.club === 'Manchester United') graphData[11].count++;
        else if (data.club === 'Milan') graphData[12].count++;
        else if (data.club === 'Napoli') graphData[13].count++;
        else if (data.club === 'Paris Saint-Germain') graphData[14].count++;
        else if (data.club === 'Real Madrid') graphData[15].count++;
        else if (data.club === 'Roma') graphData[16].count++;
        else if (data.club === 'Tottenham Hotspur') graphData[17].count++;
        // else graphData[18].count++
    })

    xField = "club"
    xText = "Club of the Players"
    yTick = 10
    myPadding = 0.1
    selected.innerText = "Number of Players by Clubs they play in"
}

function loadDataSetForRatingScore() {
    graphData.length = 0
    graphData = [
        { overall: "82", count: 0},
        { overall: "83", count: 0},
        { overall: "84", count: 0},
        { overall: "85", count: 0},
        { overall: "86", count: 0},
        { overall: "87", count: 0},
        { overall: "88", count: 0},
        { overall: "89", count: 0},
        { overall: "90", count: 0},
        { overall: "91", count: 0},
        { overall: "92", count: 0},
        { overall: "93", count: 0},
        { overall: "94", count: 0}
    ]

    myData.forEach((data) => {
        if (data.overall === '82') graphData[0].count++;
        else if (data.overall === '83') graphData[1].count++;
        else if (data.overall === '84') graphData[2].count++;
        else if (data.overall === '85') graphData[3].count++;
        else if (data.overall === '86') graphData[4].count++;
        else if (data.overall === '87') graphData[5].count++;
        else if (data.overall === '88') graphData[6].count++;
        else if (data.overall === '89') graphData[7].count++;
        else if (data.overall === '90') graphData[8].count++;
        else if (data.overall === '91') graphData[9].count++;
        else if (data.overall === '92') graphData[10].count++;
        else if (data.overall === '93') graphData[11].count++;
        else graphData[12].count++;
    })

    xField = "overall"
    xText = "Overall Ratings of the Player"
    yTick = 10
    myPadding = 0.1
    selected.innerText = "Number of Players by their Ratings"
}

function loadDataSetForWorkrateScore() {
    graphData.length = 0
    graphData = [
        { work_rate: "High", count: 0},
        { work_rate: "Medium", count: 0},
        { work_rate: "Low", count: 0}
    ]

    myData.forEach((data) => {
        if (data.work_rate === 'High') graphData[0].count++;
        else if (data.work_rate === 'Medium') graphData[1].count++;
        else graphData[2].count++;
    })

    xField = "work_rate"
    xText = "Work Rate of the Players"
    yTick = 10
    myPadding = 0.2
    selected.innerText = "Number of Players by their Workrate"
}

function loadDataSetForReputationScore() {
    graphData.length = 0
    graphData = [
        { reputation: "1", count: 0},
        { reputation: "2", count: 0},
        { reputation: "3", count: 0},
        { reputation: "4", count: 0},
        { reputation: "5", count: 0}
    ]

    myData.forEach((data) => {
        if (data.international_reputation === '1') graphData[0].count++;
        else if (data.international_reputation === '2') graphData[1].count++;
        else if (data.international_reputation === '3') graphData[2].count++;
        else if (data.international_reputation === '4') graphData[3].count++;
        else graphData[4].count++;
    })

    xField = "reputation"
    xText = "Internation Reputation"
    yTick = 10
    myPadding = 0.2
    selected.innerText = "Number of Players by their International Reputation"
}

// Histograms Functions

function loadHistoData(nBin, xField) {
    let range = d3.extent(myData, function(d) { return parseInt(d[xField]); })
    xScaleNew.domain([range[0], Math.ceil((range[1] + 1) / 10) * 10])

    var histogram = d3.histogram()
    .value(function(d) { return d[xField]; })
    .domain(xScaleNew.domain())
    .thresholds(xScaleNew.ticks(nBin));

    var bins = histogram(myData);

    xAxis.transition()
    .duration(500)
    .attr("transform", "translate(0," + h + ")")
    .call(d3.axisBottom(xScaleNew).tickFormat( function(d){ return d; }).ticks(bins.length));

    yScale.domain([0, d3.max(bins, function(d) { return d.length; })]);
    yAxis.transition()
    .duration(500)
    yAxis.call(d3.axisLeft(yScale));

    svg.selectAll("rect").remove()

    var selection = svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)

    if (firstLoad === 0) selection = selection.transition().duration(500);
    
    selection.attr("x", 100)
    .attr("y", 100)
    .attr("transform", function(d) { return "translate(" + xScaleNew(d.x0) + "," + yScale(d.length) + ")"; })
    .attr("width", function(d) { return xScaleNew(d.x1) - xScaleNew(d.x0); })
    .attr("height", function(d) { return h - yScale(d.length); })
    .style("fill", function(_, i) { return myColor(i); })
}

function loadAgeDistribution() {
    xField = "age"
    xText = "Age"
    myPadding = 0.0

    min = 6, max = 18, value = 12, step = 2

    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players in the List by Age"
}

function loadWagesDistribution() {
    xField = "wage_eur"
    xText = "Wages in Euros"
    myPadding = 0.0

    min = 5, max = 39, value = 10, step = 2

    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players in the List by Wages in Euros"
}

function loadValueDistribution() {
    xField = "value_eur"
    xText = "Market Value in Euros"
    myPadding = 0.0

    min = 4, max = 39, value = 10, step = 2

    addNewXAxisLabel()
    loadHistoData(value, xField)
    xScaleBar45(70)

    selected.innerText = "Distribution of Players in the List by Market Value in Euros"
}

function loadAttackingDistribution() {
    xField = "attacking_total"
    xText = "Attacking Capacity"
    myPadding = 0.0

    min = 5, max = 55, value = 10, step = 2

    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players by Attacking Capacity"
}

function loadDefendingDistribution() {
    xField = "defending_total"
    xText = "Defending Capacity"
    myPadding = 0.0

    min = 5, max = 55, value = 10, step = 2

    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players by Defending Capacity"
}

function loadPaceDistribution() {
    xField = "pace"
    xText = "Pace Level"
    myPadding = 0.0

    min = 5, max = 29, value = 10, step = 3
    
    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players by Pace"
}

function loadPhysicalityDistribution() {
    xField = "physic"
    xText = "Physicality Level"
    myPadding = 0.0

    min = 5, max = 29, value = 10, step = 3
    
    addNewXAxisLabel()
    loadHistoData(value, xField)

    selected.innerText = "Distribution of Players by Physicality"
}

function valueChange(val) {
    firstLoad = 0
    switch(val){
    case "0":
        loadDataSetForNationalityScore()
        loadBarData()
        break
    case "1":
        loadDataSetForPositionScore()
        loadBarData()
        break
    case "2":
        loadDataSetForLeagueScore()
        loadBarData()
        xScaleBar45(110)
        break
    case "3":
        loadDataSetForClubScore()
        loadBarData()
        xScaleBar45(90)
        break
    case "4":
        loadDataSetForRatingScore()
        loadBarData()
        break
    case "5":
        loadDataSetForWorkrateScore()
        loadBarData()
        break
    case "6":
        loadDataSetForReputationScore()
        loadBarData()
        break
    case "7":
        break
    case "8":
        loadAgeDistribution()
        break
    case "9":
        loadWagesDistribution()
        break
    case "10":
        loadValueDistribution()
        break
    case "11":
        loadAttackingDistribution()
        break
    case "12":
        loadDefendingDistribution()
        break
    case "13":
        loadPaceDistribution()
        break
    case "14":
        loadPhysicalityDistribution()
        break
    default:
        loadDataSetForNationalityScore()
        yScaleBar()
        loadBarData()
    }
}
