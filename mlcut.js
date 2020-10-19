var diameter = 960;

var simThres = 0.65;
var distThres = 0.5;

var clusterCounter = 0;	
var prevClusterCounter = 0;

var tree = d3.layout.tree()
    //.size([350, diameter / 2 - 120]) //to produce a radial layout where the tree breadth (x) is measured in degrees, and the tree depth (y) is a radius r in pixels, say [360, r]
    //.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
	//.separation(function(a, b) { return a.parent == b.parent ? 1 : 2;}); //DEFAULT 
	.size([360, 0.8])//semantic
	.separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });//semantic

//var diagonal = d3.svg.diagonal.radial()
//    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });	

						
var similaritySlider = d3.select("body").append("input")
				.attr("id", "similaritySlider")
				.attr("type", "range")
				.attr("min", "0")
				.attr("max", "1000")
				.attr("step", "1")
				.attr("orient", "vertical");
				
var distinctivenessSlider = d3.select("body").append("input")
				.attr("id", "distinctivenessSlider")
				.attr("type", "range")
				.attr("min", "0")
				.attr("max", "1000")
				.attr("step", "1")
				.attr("orient", "vertical");				
				
	// * DEBUG variable example - WORKS!!!
var similarityLabel = d3.select("body").append("div")
	.attr("class", "simThres_Div")
	.append("text")
		.text("similarity = " + simThres)
		.attr("id", "simThres_Text");  	
		
var distinctivenessLabel = d3.select("body").append("div")
	.attr("class", "distThres_Div")
	.append("text")
		.text("distinctiveness = " + distThres)
		.attr("id", "distThres_Text");  			

//tr.append("td").append("text").text("  |  ");		
	
var clusterLabel =	d3.select("body").append("div")
	.attr("class", "clusterCounter_Div")
	.append("text")
		//.text("Groups = " + clusterCounter)
		.attr("id", "clusterCounter_Text");
		
var weakEdgeLabel = d3.select("body").append("div")
	.attr("class", "weakEdgeCounter_Div")
	.append("text")
		//.text("\"Weak edges\" = " + document.getElementsByClassName("weak").length)
		.attr("id", "weakEdgeCounter_Text");
	

	
	
//semantic
width = diameter;
height = 780;
var x = d3.scale.linear()
.domain([0, width])
.range([0, width]);
//semantic
var y = d3.scale.linear()
.domain([0, height])
.range([0, height]);

var svg, node, diagonal, rad;
	
function updateZoom(doZoom) {
	// nf: needs to be inside the updateZoom function
	rad = d3.scale.linear()
		.domain([0,1])
		.range([0, diameter/2]);
   
	diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [rad(d.y), d.x / 180 * Math.PI]; });

	var svg0 = d3.select("#root").append("svg")
		.attr("width", diameter - 150)
		.attr("height", 780);	
   
	svg = svg0
		//.attr("style", "position: absolute; left: 200px")
		.attr("class",function(d) {return doZoom ? "zoomon" : "zoomoff";})
		.call(d3.behavior.zoom()
			.translate([diameter/2, diameter/2])
			.scaleExtent([-10,10])
			  .on("zoom", function() {return doZoom ? zoom() : null;})
		)
	  .append('g')
			//.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
			.attr("transform", "translate(" + diameter / 2 + "," + 400 + ")")
			.attr("class", "hca");		
   
		//var link = svg.selectAll(".link"),
	var	node = svg.selectAll(".node");
	var link = svg.selectAll(".link");
						
	var pat1 = svg.append("defs")
						.append("pattern")
							.attr("id", "pattern1")
							.attr("width", "4") //"10") //20 is the rect side
							.attr("height","4") //"10")
							.attr("patternUnits", "userSpaceOnUse")
						.append("polygon")
							.attr("points", "0,3 1,4 4,1 3,0")
							.attr("fill", "black");//"grey");
   
	//var nodes = tree.nodes(items);
	//var links = tree.links(nodes);
   
	//var link = svg.selectAll(".link")
	//	.data(links)
	//  .enter().append("path")
	//	.attr("class", "link")
	//	.attr("d", diagonal);
   
	//node = svg.selectAll(".node")
	//	.data(nodes)
	// .enter().append("g")
	//	.attr("class", "node")
	//	.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + rad(d.y) + ")"; })
	 
   



	//------------------------------------------------------------------------
		
	// This method loads the data from the JSON file
	//d3.json("dendrogram.json", function(error, json) 
	d3.json("HOX424_EUCL_new.json", function(error, json) 
	//d3.json("../hox424/hclust/HOX424_ACF.json", function(error, json)
	//d3.json("HOX424_20_EUCL.json", function(error, json) 
	{
		if (error) throw error;	
		
		root = json;

		var nodes = tree.nodes(root),
			links = tree.links(nodes);

		link = link.data(links);
		link = link.enter();
		node = node.data(nodes);
		node = node.enter();
		
		link = link.append("path")
					.attr("class", "link")
					.attr("d", diagonal);
		
		node = node.append("g")			
			.attr("class", "node")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + rad(d.y) + ")"; });			
			//.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });
		
		// append circle in nodes -> DELETED!

		// append rect in nodes			
		rect = node.append("rect");
			rect.attr("width", function(d) {
			return d.children ? (1.5-d.similarity)*20 : 20 // *10 was working well for the radius of the circles but for rect edges the *20 works better!
			})
			.attr("height", function(d) {
			return d.children ? (1.5-d.similarity)*20 : 20
			})
			.attr("rx", function(d) {
			return d.children ? "30" : "2" // with high rx and ry values the rect looks like a circle!
			})//"2")
			.attr("ry", function(d) {
			return d.children ? "30" : "2"
			})//"2")
			.attr("id", function(d) {
				return "HCA_" + d.name})
			.on('click', function(d) {
			
			// TV NEW!
			if (d3.select(this).attr("selected") != 1)
			{
				branchRootSelect(d);
			}
			else
			{
				branchRootUnSelect(d);
			}				
			})
			.on('dblclick', function(d) 
			{
				var existsOneMarked = false;
			
				if (d.children) // it is a circle
					alert(d.name);
				else if (d3.select(this).attr("marked") != 1) // it is a not marked rect
				{
					var oldS = d3.select(this).attr("fill"); // save current fill color
					console.log(oldS);
					d3.select(this).attr("oldstyle", oldS);
					//WORKS!//d3.select("defs").select("pattern").select("polygon").attr("style", oldS);
					//console.log(d3.select("#pattern1").select("polygon").attr("points"));
					d3.select(this).attr("style", "fill: url(#pattern1); stroke-width: 4px; stroke: " + oldS);
					d3.select(this).attr("marked", 1);
					// select path from d.name, since this is id for paths
					d3.select("#" + d.name).attr("style", "").attr('stroke-width', "4px").attr("marked", 1);	
					
					d3.select(".foreground").selectAll("path").each( function(){
						if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1)) 
						{ 
							existsOneMarked = true;
							d3.select(this).attr("style", "");
						}	
						else
							d3.select(this).attr("style", "display: none;");
					})
					// If nothing is selected then show all paths again:
					//if (!existsOneMarked)
					//	d3.select(".foreground").selectAll("path").attr("style", "");	
					
				}
				else // it is a marked rect
				{
					// TODO: unmark it!
					d3.select(this).attr("style", d3.select(this).attr("oldstyle"));
					d3.select(this).attr("marked", null);
					// also the corresponding path
					d3.select("#" + d.name).attr('stroke-width', "1.5px").attr("marked", null);	
					
					d3.select(".foreground").selectAll("path").each( function(){
						if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1)) 
						{ 
							existsOneMarked = true;
							d3.select(this).attr("style", "");
						}	
						else
							d3.select(this).attr("style", "display: none;");
					})
					// If nothing is selected then show all paths again:
					if (!existsOneMarked)
						d3.select(".foreground").selectAll("path").attr("style", "");				
					
				}
			})
			// TV implement on mouseover exploration of the dendrogram
			.on("mouseover", function(d) {
				if (d3.select(".hca").select("#HCA_" + d.name).classed("cluster0")) // FASTER D3 WAY TO MANAGE CLASSES
					console.log("BLANK CIRCLE!");
				else if (d.children) // circle
				{
					d3.select(".foreground").selectAll("path").attr("style", "display: none;");
					branchRootHover(d);
				}
				else
					console.log("Leaf");
			})
			.on("mouseout", function() {
					//RECTS
					d3.select(".hca").selectAll("rect").each( function(){
						if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1)) 
						{ 
							d3.select(this).style("stroke-width", "4px");
						}
						else
							d3.select(this).style("stroke-width", "1.5px");
					});	
			
					//PATHS
					d3.select(".foreground").selectAll("path").attr("style", "display: none;");
					existsOneMarked = false;
					d3.select(".foreground").selectAll("path").each( function(){
						if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1)) 
						{ 
							existsOneMarked = true;
							d3.select(this).attr("style", "");
							d3.select(this).style("stroke-width", "4px");
						}	
						else
							d3.select(this).attr("style", "display: none;");
					})
					// If nothing is selected then show all paths again:
					if (!existsOneMarked)
						d3.select(".foreground").selectAll("path").attr("style", "");	
			});

			
			
		rect.append("svg:title")
			.text(function(d) { return (d.children ? d.similarity : d.name); }); // appending an svg title replaces the mouse over action

		update(simThres, distThres);	
		
		console.log("First time of prevClusterCounter = " + prevClusterCounter);
		
		// This appends labels next to each node
		/*node.append("text")
		  .attr("dy", ".31em")
		  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
			//      .text(function(d) { return d.name; });
			.text(function(d,i) { return d.similarity}); // "i="+i; }); */

	}); // endof d3.json

};

function zoom(d) {
 var node = d3.select(".hca").selectAll(".node");
 var ev = d3.event;
 rad.domain([0, 1/ev.scale]);
 node.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + rad(d.y) + ")"; });
 svg.selectAll(".link").attr("d",diagonal);
	svg.attr("transform", "translate(" + ev.translate + ")");
};

updateZoom(false);

d3.select("#mycheck").on("click", function () {
	if ( d3.select("svg").classed("zoomoff") )
	{
		console.log("check if true");
		d3.selectAll(".zoomoff").remove();
		updateZoom(true);
	}
	else
	{
		console.log("check if false");
		d3.selectAll(".zoomon").remove();
		updateZoom(false);
	}
});	
	

// This method is called when hover over a circle.
// Highlight only elements that belong to that branch of the tree independently of its clustering class.
function branchRootHover(branch) 
{ 

	if (branch.children) 
	{	//console.log(branch);
		branchRootHover(branch.children[0]);
		branchRootHover(branch.children[1]);
		//console.log("HCA_" + branch.children[0].name);
		//console.log("HCA_" + branch.children[1].name + " >-----------------------------------");
		
		d3.select(".hca").select("#HCA_" + branch.name).style("stroke-width", "4px");
		d3.select(".hca").select("#HCA_" + branch.children[0].name).style("stroke-width", "4px");
		d3.select(".hca").select("#HCA_" + branch.children[1].name).style("stroke-width", "4px");		
		//d3.select(".foreground").select(branch.children[0].name).style("stroke-width", "4px");
	} 
	else // Leaf
	{
		d3.select(".hca").select("#HCA_" + branch.name).style("stroke-width", "4px");
		
		d3.select(".foreground").select("#" + branch.name).attr("style", "");
		d3.select(".foreground").select("#" + branch.name).style("stroke-width", "4px");
		/*d3.select(".foreground").selectAll("path").each( function(){
			if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1)) 
			{
				existsOneSelected = true;
				d3.select(this).attr("style", "");
			}	
			else	
				d3.select(this).attr("style", "display: none;");
		}) */		
		
	}
}

// Αυτή είναι για όταν κάνεις κλικ πανω σε έναν κύκλο
// Ανεξάρτητα από την κατηγοριοποίηση, επέλεξε και τόνισε ότι στοιχείο περιλαμβάνεται στο κλαδί.
function branchRootSelect(branch) 
{ 
	// All nodes get the selected attribute
	d3.select(".hca").select("#HCA_" + branch.name).attr("selected", 1);
	d3.select(".hca").select("#HCA_" + branch.name).style("stroke-width", "4px");
	if (branch.children) 
	{	//console.log(branch);
		branchRootSelect(branch.children[0]);
		branchRootSelect(branch.children[1]);
	} 
	else // Leaf
	{
		// Also paths get the "selected" attribute
		d3.select(".foreground").select("#" + branch.name).attr("selected", 1);	
		d3.select(".foreground").select("#" + branch.name).attr("style", "");
		d3.select(".foreground").select("#" + branch.name).style("stroke-width", "4px");
	}
}

// Αυτή είναι για όταν κάνεις unκλικ πανω σε έναν κύκλο
function branchRootUnSelect(branch) 
{ 
	// All nodes get the selected attribute
	d3.select(".hca").select("#HCA_" + branch.name).attr("selected", null);
	d3.select(".hca").select("#HCA_" + branch.name).style("stroke-width", "1.5px");
	if (branch.children) 
	{	//console.log(branch);
		branchRootUnSelect(branch.children[0]);
		branchRootUnSelect(branch.children[1]);
	} 
	else // Leaf
	{
		// Also paths get the "selected" attribute
		d3.select(".foreground").select("#" + branch.name).attr("selected", null);	
		d3.select(".foreground").select("#" + branch.name).attr("style", "display: none;");
		d3.select(".foreground").select("#" + branch.name).style("stroke-width", "1.5px");
	}
}


// This method creates and updates the graph every time the similarity threshold changes. 
// TV: I suspect that the clusterCounter remains "0" after slider moves, because the 
// parts that increase the counter are not getting executed because all elements have
// already been "entered". One solution would be to exit before update() or sth else.  
function update(simThres, distThres) 
{ 
	var link = d3.select(".hca").selectAll(".link");
	//TV : thickness of edges is analogous to distinctiveness
	link.attr("class", function(d) 
		{
			if (d.target.similarity - d.source.similarity > distThres)
				return "link + weak"
			else
				return "link"
		})
		.attr("d", diagonal)
		.attr("stroke-width", function(d){ return 3.5 - 100*(d.target.similarity - d.source.similarity)}) // ? d.similarity : 1.5 })
		.attr("stroke", function(d){ return (d.target.similarity - d.source.similarity) > distThres ? "red" : "#ccc" })
		.style("stroke-dasharray", function(d) { return (d.target.similarity - d.source.similarity) > distThres ? "5,5" : "5,0"});
	
	// TV: when the tree is parsed after a new update() call, the final clusterCounter is still unknown!
	// TV: Try to store clusterCounter from previous update()! 
	// TV: Also perhaps initialize all nodes to "cluster1" before any update() call, to preserve logic for mental map. 
	clusterCounter = 0;
	rect.attr("class", function(d) 
	{
		if (simThres == 0)
		{
			console.log(simThres);
			//clusterCounter = 1;
			d3.select(this).attr("stubborn", null);	
			return "cluster1";
		}	
		else if (d.similarity<simThres)
		{
			// remove any stubborn attributes
			d3.select(this).attr("stubborn", null);
			return "cluster0";//"cluster0"
		}	
		else if	(d.parent && d.parent.similarity<simThres) //necessary condition for a cluster root of a branch
		{
			// TV: UPDATE TO: check if !classed("cluster0") -> if true make it "stubborn"
			// TV: if new the node becomes "cluster0" make sure that it's children don't mess the counter for the others!
			clusterCounter++;
			//return "cluster" + clusterCounter;
			//console.log("hello!");
			// TV:first make sure that stubborn nodes maintain their previous color:
			//console.log(d3.select(this).attr("stubborn"));
			if (d3.select(this).attr("stubborn") != null) // OLD BRANCH ROOT!
			{
			  //console.log("keep it!");
			  //clusterCounter++; // skipped cluster number! 
			  d3.select(this).attr("skipped", clusterCounter); // Store to debug!
			  d3.select(this).attr("stubborn", 2);
			  
			  // TV: if clusterCounter is different than previous class number then one of the prev class numbers has been used twice!
			  // Otherwise if it is the same then it is OK. The mutation is afterwards and thus a good cluster number is given.
			  var prevClass = d3.select(this).attr("class");
			  //console.log(prevClass);
			  if ("cluster" + clusterCounter != prevClass) //d3.select(this).attr("class"))
			  {
			    console.log("CRACKHEAD! Class num is about to change from: " + prevClass + " to: cluster" + clusterCounter);
			    // Give to the previous the clusterCounter to avoid duplicate
			    d3.selectAll("." + d3.select(this).attr("class")).attr("class", "cluster" + clusterCounter);
			    // Also give it to its children
			    //d3.select("." + d3.select(this).attr("class")).hasChildren();
			  }
			  return prevClass; //d3.select(this).attr("class"); // return previous class
			}  
			else // NEW BRANCH ROOT!
			{
			  // TV: mark every root branch with an attribute to chech in next update!
			  d3.select(this).attr("stubborn", 1);
			  //clusterCounter++; // increase the counter 
			  console.log("ΛΑΤΕΣΤ = cluster" + clusterCounter);
			  return "cluster" + clusterCounter;			  
			}
			// TV TODO: Do a heuristic meta-check μετά από κάθε ανανέωση() for stubborn clusters with the same number. If you find a pair then change the one to clusterCounter!	
			console.log("ERROR: NEVER SAY NEVER! FIX THAT!");
			
			/*
			if (d3.select(this).classed("cluster" + (clusterCounter + 1))) //check if is about the get the same class as before
			{
				console.log("SAME");
				clusterCounter++; // increase the counter 
				return "cluster" + clusterCounter; // Do it keep it the same! It is its sibling that you have to prevent
			}
			else //if (d3.select(this).classed("cluster" + (clusterCounter + 1))) // INTERVENTION NEEDED to keep class the SAME for many branches!
			{
				clusterCounter++; // increase the counter 
				return "cluster" + clusterCounter; //prevClusterCounter++;
			}*/		
		}
		else //it is just a child of a found cluster so (d.parent.similarity>simThres)
		{	//return "cluster" + clusterCounter;
			//console.log(d3.select(this.parentNode.previousSibling.firstChild).attr("class"));
			// remove any stubborn attributes
			d3.select(this).attr("stubborn", null);	
			return d3.select(this.parentNode.previousSibling.firstChild).attr("class"); //"cluster" + clusterCounter; // already its parent increased the clusterCounter to the right value so make it the same class as it's parent!
		}	
	});

	
	// TV TODO: based on the clusterCounter give to the first occurring(!) stubborn the right cluster number, stored in "skipped" attribute.
	//console.log("FINAL clusterCounter = " + clusterCounter);
	var arr = new Array();
	/*d3.select(".hca").selectAll("rect").each( function(d)
	{
	  if (d3.select(this).attr("stubborn") == 1)
	  {*/
	//d3.select(".hca").selectAll("[stubborn=\"1\"]").each( function() 
	d3.select(".hca").selectAll("[stubborn]").each( function() 
	{
	    //console.log("how many do we have of me?");
	    
	    if (arr.indexOf(d3.select(this).attr("class")) == -1)
		{
		  console.log("pushed to arr: "+ d3.select(this).attr("class"));
	      arr.push(d3.select(this).attr("class"));
		} 
	    else // this is a duplicate! BUG: WHAT IF it is the first that has to change, because the mutation happened before?
	    { // ANS: Just change the one which has stubborn 1 and not 2!
		
				if (d3.select(this).attr("stubborn") == 2)
				{
					console.log("OLD PAL FOUND, CHANGE OTHER! " + d3.select(this).attr("class"));
					// IGNORE!
				}
				else // == 1 NEW KID
				{
					console.log("CHANGE ME!");
					
						// Allocate the optimal cluster class dynamically:
						// put current cluster numbers in a list and check if there is one which is not used and reuse it!
						var used = new Array();
						var myC = 0;
						//d3.select(".hca").selectAll("[stubborn=\"1\"]").each( function() {
						d3.select(".hca").selectAll("[stubborn]").each( function() {
							console.log("pushed to used: "+ d3.select(this).attr("class"));
							used.push(d3.select(this).attr("class"));
						})
						for (var i=1; i<clusterCounter; i++)
						{
							console.log(i);
							if (used.indexOf("cluster"+i) == -1) // unused color found!
							{
								//alert("RECYCLED");
								console.log("REUSE: " + i);
								myC = i;
								//d3.select(this).attr("class", "cluster"+i);
							}
						}
						if (myC == 0)
							d3.select(this).attr("class", "cluster" + clusterCounter);
						else
							d3.select(this).attr("class", "cluster" + myC);
					  
					
					
					//d3.select(this).attr("class", "cluster" + clusterCounter);
					console.log("pushed to arr: "+ d3.select(this).attr("class"));
					arr.push(d3.select(this).attr("class"));
				}
				
			update(simThres, distThres);		
		
	    }

	});  

	
	// classify paths in PC view jointly to rects in HCA view.
	d3.selectAll(".foreground").selectAll("path").each( function(d, i) 
	{
		//select the node that has the same class as the path - which is the ILMN_xxx - and assign its class to the path
		if ((d3.select(this).attr("id") != "ILMN_NORMIN")&&(d3.select(this).attr("id") != "ILMN_NORMAX"))
		{
			//console.log(d3.select("." + d3.select(this).attr("id")).attr("class"));
			//if (d3.select("." + d3.select(this).attr("id")).attr("class").indexOf("cluster0") > -1)
			if (d3.select("#HCA_" + d3.select(this).attr("id")).attr("class").indexOf("cluster0") > -1)
				d3.select(this).attr("class", "cluster1_PC");	
			else
				d3.select(this).attr("class", d3.select("#HCA_" + d3.select(this).attr("id")).attr("class") + "_PC"); 
		}
	});
	

	if (clusterCounter=="0") // in the case that (root.similarity<simThres) consider the dendrogram as one cluster
	{
		rect.attr("class", "cluster1");		
		clusterCounter++;
	}
	colorClusters();	
	
	// undo selected circles which became white
	d3.select(".hca").selectAll(".cluster0").attr("selected", null);
	d3.select(".hca").selectAll(".cluster0").style("stroke-width", "1.5px");
	
	prevClusterCounter = clusterCounter;
	return clusterCounter;	
	
} // endof update()
  
// This method colors all clustersN in the DOM	
function colorClusters()
{
	for (var i = 0; i <= clusterCounter; i++)
	{
		colorCluster(i);
	}
}  
	
// This method colors the elements of each cluster with the same color picked from a list.
function colorCluster(x)
{
	var colors = [  'rgb(255,255,255)', // white color added for cluster0
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',		
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',	
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',
					//and again
					'rgb(141,211,199)',
					'rgb(255,255,179)',
					'rgb(190,186,218)',
					'rgb(251,128,114)',
					'rgb(128,177,211)',
					'rgb(253,180,98)',
					'rgb(179,222,105)',
					'rgb(252,205,229)',
					//'rgb(217,217,217)',
					'rgb(188,128,189)',
					'rgb(204,235,197)',
					'rgb(255,237,111)',					
					];	
	var clusterColor = colors[x];
	
	// OLD DOM WAY
	//elements = document.getElementsByClassName("cluster"+x);
	//for (var i = 0; i < elements.length; i++)
	//{
	//  	elements[i].style.fill = clusterColor; 
	//}
	// NEW D3 WAY
	d3.selectAll("g").selectAll(".cluster"+x).attr("fill", clusterColor);
	
	//
	// This is for coloring the paths in PC
	//elementsPC = document.getElementsByClassName("cluster"+x+"_PC");
	//for (var i = 0; i < elementsPC.length; i++)
	//{
	//  	elementsPC[i].setAttribute("stroke", clusterColor); 
	//}
	// NEW D3 WAY
	d3.selectAll(".cluster"+x+"_PC").attr("stroke", clusterColor);
}

  
d3.select(self.frameElement).style("height", diameter - 150 + "px");


d3.select("#similaritySlider").on("change", function() {
	simThres = this.value/1000;
	console.log("prevClusterCounter = " + prevClusterCounter); // maybe update could take prevClusterCounter as input
	update(simThres, distThres); 
	d3.select("#simThres_Text").text("similarity = " + simThres);
	d3.select("#clusterCounter_Text").text("clusters = " + clusterCounter);
});

d3.select("#distinctivenessSlider").on("change", function() {
	distThres = this.value/1000;
	update(simThres, distThres); //find weak edges!
	d3.select("#distThres_Text").text("distinctiveness = " + distThres);
	d3.select("#weakEdgeCounter_Text").text("\"weak-edges\" = " + document.getElementsByClassName("weak").length);

});








/* Parallel Coords view
 *
 */

var geneList = Array();	

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("HOX424.csv", function(error, HOX424) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(HOX424[0]).filter(function(d) {
    return d != "NAME" && (y[d] = d3.scale.linear()
        .domain(d3.extent(HOX424, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(HOX424)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  // Now take the color of the cluster in which they belong to.
  // Only selected lines are displayed in the foreground.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(HOX424)
    .enter().append("path")
      .attr("d", path)
	  .on('click', function(d) {
				console.log(d.NAME);
				//alert( function (d) { // export all selected and marked paths in a file, then later the average could be also extracted.
				//		d3.select(foreground).selectAll("path")("selected") == 1});
			})
	  .on('dblclick', function() { 
				var geneSelection = d3.select(".foreground").selectAll("." + d3.select(this).attr("class"));//.selectAll("[selected=\"1\"]"); // DOESN'T WORK!
				//var geneList = Array();		
				geneSelection.each(  function(d, i)
				{
				  //console.log(d3.select(this).attr("selected"));
				  if ((d3.select(this).attr("selected") == 1) || (d3.select(this).attr("marked") == 1))
					geneList.push(d3.select(this).attr("id"));
				});
				downloadCSV({ filename: "gene-list.csv" });
				alert(geneList);
				console.log("GENE LIST: " + geneList.toString());
				geneList = [];
			});
	  /*
	  function(d) {
				console.log(d.NAME);
				//(d3.select(".hca").selectAll("." + d3.select(this).attr("class")).attr("selected") != 1)
				var geneSelection = d3.select(".foreground").selectAll("." + d3.select(this).attr("class"));
				var geneList = Array();
				
				geneSelection.each(  function(d, i)
				{
					console.log(d3.select(this).attr("id"));
					geneList.push(d3.select(this).attr("id"));
				});
				var csvContent = "data:text/csv;charset=utf-8,";
				geneList.forEach(function(infoArray, index){
					dataString = infoArray.join(",");
					csvContent += index < geneList.length ? dataString+ "\n" : dataString;
				});
				var encodedUri = encodeURI(csvContent);
				window.open(encodedUri);
			});		
			*/	
			
  foreground.append("svg:title")
	  .text(function(HOX424) {return HOX424.NAME; });		

  foreground.attr("id", function(HOX424) { return HOX424.NAME }) //+ "_PC"; })
			.attr("class", function(d) { return d.NAME});

  // Give the first class to paths
  foreground.each( function(d, i) 
	{
		//select the node that has the same class as the path - which is the ILMN_xxx - and assign its class to the path
		if ((d3.select(this).attr("id") != "ILMN_NORMIN")&&(d3.select(this).attr("id") != "ILMN_NORMAX"))
		{
			//console.log(d3.select("." + d3.select(this).attr("id")).attr("class"));
			if (d3.select("." + d3.select(this).attr("id")).attr("class").indexOf("cluster0") > -1)
				d3.select(this).attr("class", "cluster1_PC");	
			else
				d3.select(this).attr("class", d3.select("#HCA_" + d3.select(this).attr("id")).attr("class") + "_PC"); 
		}
	});

  // Color clusters again to include foreground paths
  colorClusters();

	  
  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}

    function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

		/* TV: customised below:
        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

		console.log("CSV RESULT = " + result);
		console.log("GENES = " + data.toString());
        return result;
		*/
		
		// TV: CUSTOM:
		return data.toString();
    }

    function downloadCSV(args) {
        var data, filename, link;

        var csv = convertArrayOfObjectsToCSV({
            data: geneList//stockData
        });
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
