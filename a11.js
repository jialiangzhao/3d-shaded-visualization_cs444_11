// 
// a11.js
// name:jialiangzhao
// <jialiangzhao@email.arizona.edu>
// class: CSC 444
//
// content:This is a program that can layer and color 3D models. 
// He can be divided into 7 areas. Each area can adjust 
// the transparency and color. You can also change the overall 
// color with the button.
//
// It expects a div with id 'tfunc' to place the d3 transfer function
// editor
//


////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// D3 layout variables
let size = 500;
let svg = null;

// Variables for the scales
let xScale = null;
let yScale = null;
let colorScale = null;

// current color = 1 or 2 or 3
// different number have different interpolate
let currentColor=1;

////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  //This A is used to draw an array of the color bar.
   a=[];
  for( i=0;i<=50;i++){
      a.push(i);
  }

  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", 525)
    .attr("height", size);

  //Initialize the axes
  //TODO: WRITE THIS
  //I added the initial variables. Let the program 
  //display data when there is no 3D graphics.
  colorScale = d3.scaleSequential(d3.interpolateCool).domain([dataRange[0],dataRange[1]]);
  currentColor=1;
  xScale = d3.scaleLinear().domain([dataRange[0],dataRange[1]]).range([70,450]);
  yScale = d3.scaleLinear().domain([0,1]).range([450,70]);
  let xAxis = d3.axisBottom().scale(xScale).ticks(10);
  let yAxis = d3.axisLeft().scale(yScale).ticks(10);

  // this is set the x axis 
svg.append("g")
   .attr("transform", `translate(0,${xScale(1)})`)
   .attr("id","xline")
   .call(xAxis)

  // this is set the y axis 
svg.append("g")
   .attr("transform", `translate(${yScale(1)},0)`)
   .attr("id","yline")
   .call(yAxis)

  //Initialize path for the opacity TF curve
  //TODO: WRITE THIS
  //Draw a path to connect each circle.
  svg.append("g")
    .attr("class", "pathLine")
    .selectAll("path")
    .data(opacityTF)
    .enter()
    .append("path")
    .attr("d",  function(d,i){
     if(i==0){return ;}
     return "M "+xScale(opacityTF[i-1][0])+" "+yScale(opacityTF[i-1][1])+" "
     +xScale(d[0])+" "+yScale(d[1]);
    })
    .attr("stroke", "black");


  //Initialize circles for the opacity TF control points
  let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

  svg.append("g")
    .attr("class", "points")
    .selectAll("circle")
    .data(opacityTF)
    .enter()
    .append("circle")
    .attr("index", (d,i) => i)
    .style('cursor', 'pointer')
    .attr("cx", d => xScale(d[0]))
    .attr("cy", d => yScale(d[1]))
    .attr("r", 10)
    .attr("fill", d => colorScale(d[0]/dataRange[1]))
    .attr("stroke", "black")
    .call(drag)
    ;

  //Create the color bar to show the color TF
  //TODO: WRITE THIS

  // array a and lineScale are draw the parameters of bar,
  lineScale = d3.scaleLinear().domain([0,50]).range([70,450]);

  svg.append("g")
  .attr("class", "rects")
  .selectAll("rect")
  .data(a)
  .enter()
  .append("rect")
  .attr("x", function(d){return lineScale(d) ; })
  .attr("y", 470)
  .attr("width", 10)
  .attr("height", 30)
  .attr("fill", function(d) {
    return colorScale(d*dataRange[1]/50);
  })
  //After initializing, set up anything that depends on the TF arrays
  updateTFunc();
}

// Call this function whenever a new dataset is loaded or whenever
// colorTF and opacityTF change

function updateTFunc() {
  
  //update scales
  xScale = d3.scaleLinear().domain([dataRange[0],dataRange[1]]).range([70,450]);
    //TODO: WRITE THIS
 
  yScale = d3.scaleLinear().domain([0,1]).range([450,70]);
    //TODO: WRITE THIS
  
    //My setting is when the chart is initialized. 
    //The default is d3.interpolateCool.
if(colorScale==null){
  colorScale = d3.scaleSequential(d3.interpolateCool).domain([dataRange[0],dataRange[1]]);
  currentColor=1;
}

    //TODO: WRITE THIS, or add to makeSequential


  //hook up axes to updated scales
  //TODO: WRITE THIS
  let x = d3.axisBottom().scale(xScale).ticks(10);
  let y = d3.axisLeft().scale(yScale).ticks(10);

  svg.select("#xline")
  .call(x)

  svg.select("#yline")
  .call(y)
 
 
  //update opacity curves
  d3.select(".points")
    .selectAll("circle")
    .data(opacityTF)
    .attr("cx", d => xScale(d[0]))
    .attr("cy", d => yScale(d[1]))
    .attr("r", 10)
    .attr("fill", function(d){ 
     
      return colorScale(d[0]);})
    //TODO: WRITE THIS
    d3.select(".pathLine")
    .selectAll("path")
    .data(opacityTF)
    .attr("d",  function(d,i){
      if(i==0){return ;}
      return "M "+xScale(opacityTF[i-1][0])+" "+yScale(opacityTF[i-1][1])+" "
      +xScale(d[0])+" "+yScale(d[1]);
     })
  //update colorbar
  //TODO: WRITE THIS
  
  svg.select(".rects")
  .selectAll("rect")
  .data(a)
  .attr("fill", function(d) {
    return colorScale(d*dataRange[1]/50);
  })

}


// To state, let's reset the TFs and then initialize the d3 SVG canvas
// to draw the default transfer function

resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

// Will track which point is selected
let selected = null;

// Called when mouse down
function dragstarted(event,d) {
  selected = parseInt(d3.select(this).attr("index"));
}

// Called when mouse drags
function dragged(event,d) {
  if (selected != null) {
    let pos = [];
    pos[0] = xScale.invert(event.x);
    pos[1] = yScale.invert(event.y);

    //based on pos and selected, update opacityTF
    //TODO: WRITE THIS

    //control  the circle exceed the x coordinate axis.
    if(selected==0){
      //This part is to prevent the first circle from 
      //moving to the right, it can move to the left. 
      //Because this is my extra point.
      if(event.x >70){
      pos[0] = opacityTF[selected][0];}
        
    
    }else if (selected==opacityTF.length-1){
      //This part prevents the last circle from moving t
      //the left. He can move to the right because this is
      // my extra point.
      if(event.x<450){
        pos[0] = opacityTF[selected][0];}
    }
    else{
      //Each point can move up to 30 positions left and right.
      if(event.x>xScale(dataRange[1]*selected/6)+30){
        pos[0]=xScale.invert(xScale(dataRange[1]*selected/6)+30);
      }

      if(event.x<xScale(dataRange[1]*selected/6)-30){
        pos[0]=xScale.invert(xScale(dataRange[1]*selected/6)-30);
      }
    }

    //Do not let the circle exceed the y coordinate axis.
    if(event.y<70){pos[1]=yScale.invert(70);}
    if(event.y>450){pos[1]=yScale.invert(450);}
    
       
    
    opacityTF[selected] = pos;

    makeSequential();
    //update TF window
    updateTFunc();
    
    //update volume renderer
    updateVR(colorTF, opacityTF);
  }
}

// Called when mouse up
function dragended() {
  //This is my additional sub-part. You can move to the previous 
  //interpolate by moving the leftmost point by a distance of 25 to 
  //the left. You can move the rightmost point 25 distances to move to the 
  //previous interpolate.
  if(xScale(opacityTF[opacityTF.length-1][0])>=500){
    
    if(currentColor==1){
     
      colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([dataRange[0],dataRange[1]]);
      currentColor=2;
    }else if(currentColor==2){
      
      colorScale = d3.scaleQuantize(d3.schemePaired).domain([dataRange[0],dataRange[1]]);
      currentColor=3;
    }
  }
  if(xScale(opacityTF[0][0])<=25){
    opacityTF[0][0] = dataRange[0];
    if(currentColor==2){
      colorScale = d3.scaleSequential(d3.interpolateCool).domain([dataRange[0],dataRange[1]]);
      currentColor=1;
    }else if(currentColor==3){
      colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([dataRange[0],dataRange[1]]);
      currentColor=2;
    }}
    opacityTF[opacityTF.length-1][0] = dataRange[1];
    opacityTF[0][0] = dataRange[0];
  selected = null;
  
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF);
}




////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function(e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();
      
      //update the TFs with the volren
      updateVR(colorTF, opacityTF, true);
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", upload);



////////////////////////////////////////////////////////////////////////
// Function to respond to buttons that switch color TFs

function resetTFs() {
  makeSequential();
  makeOpacity();
}

// Make a default opacity TF
function makeOpacity() {
  //TODO: WRITE THIS

  //Here is a default TF
  opacityTF = [
    [dataRange[0], 0.5],
    [dataRange[1]/6, 0.3],
    [dataRange[1]*2/6, 1],
    [dataRange[1]*3/6, 1],
    [dataRange[1]*4/6, 0.1],
    [dataRange[1]*5/6, 1],
    [dataRange[1]*6/6, 1],
  ];
}

// Make a sequential color TF
function makeSequential() {
  //TODO: WRITE THIS
  if(colorScale==null){
  colorScale = d3.scaleSequential(d3.interpolateCool).domain([dataRange[0],dataRange[1]]);
  currentColor=1;
}
colorScale.domain([dataRange[0],dataRange[1]]);
  //Here is a default TF
  colorTF = [
    [dataRange[0], d3.rgb(colorScale(0))],
    [dataRange[1]/6,d3.rgb(colorScale(dataRange[1]/6))],
    [dataRange[1]*2/6, d3.rgb(colorScale(dataRange[1]*2/6))],
    [dataRange[1]*3/6, d3.rgb(colorScale(dataRange[1]*3/6))],
    [dataRange[1]*4/6,d3.rgb(colorScale(dataRange[1]*4/6))],
    [dataRange[1]*5/6, d3.rgb(colorScale(dataRange[1]*5/6))],
    [dataRange[1]*6/6,d3.rgb( colorScale(dataRange[1]))]
    
];
  
}

// Configure callbacks for each button
d3.select("#sequential").on("click", function() {
  colorScale = d3.scaleSequential(d3.interpolateCool).domain([dataRange[0],dataRange[1]]);
  currentColor=1;
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});
d3.select("#diverging").on("click", function() {
  colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([dataRange[0],dataRange[1]]);
  currentColor=2;
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});
d3.select("#categorical").on("click", function() {
  colorScale = d3.scaleQuantize(d3.schemePaired).domain([dataRange[0],dataRange[1]]);
  currentColor=3;
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});

